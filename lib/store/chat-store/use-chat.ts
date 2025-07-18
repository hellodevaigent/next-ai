import { fetchClient } from "@/lib/fetch"
import {
  deleteFromIndexedDB,
  readFromIndexedDB,
  writeToIndexedDB,
} from "@/lib/store/persist"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useState } from "react"
import { STORE_NAMES } from "../persist"
import { API_ROUTE_FAVORITE_CHAT } from "@/lib/routes"

type FavoriteChatsResponse = {
  favorite_chats: string[]
}

interface SearchHistoryItem {
  id: string
  query: string
  timestamp: number
}

export function useFavoriteChats() {
  const queryClient = useQueryClient()

  const { data: favoriteChats = [], isLoading } = useQuery<string[]>({
    queryKey: ["favorite-chats"],
    queryFn: async () => {
      const response = await fetchClient(API_ROUTE_FAVORITE_CHAT)
      if (!response.ok) {
        throw new Error("Failed to fetch favorite chats")
      }
      const data: FavoriteChatsResponse = await response.json()
      return data.favorite_chats || []
    },
    staleTime: 5 * 60 * 1000,
  })

  const updateFavoriteChatsMutation = useMutation({
    mutationFn: async (favoriteChats: string[]) => {
      const response = await fetchClient(API_ROUTE_FAVORITE_CHAT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          favorite_chats: favoriteChats,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save favorite chats")
      }

      return (await response.json()) as FavoriteChatsResponse
    },
    onMutate: async (newFavoriteChats) => {
      await queryClient.cancelQueries({ queryKey: ["favorite-chats"] })
      const previousFavoriteChats = queryClient.getQueryData<string[]>([
        "favorite-chats",
      ])
      queryClient.setQueryData(["favorite-chats"], newFavoriteChats)
      return { previousFavoriteChats }
    },
    onError: (err, newFavoriteChats, context) => {
      if (context?.previousFavoriteChats) {
        queryClient.setQueryData(
          ["favorite-chats"],
          context.previousFavoriteChats
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-chats"] })
    },
  })

  const toggleFavorite = useCallback(
    (chatId: string) => {
      const newFavorites = favoriteChats.includes(chatId)
        ? favoriteChats.filter((id) => id !== chatId)
        : [...favoriteChats, chatId]
      updateFavoriteChatsMutation.mutate(newFavorites)
    },
    [favoriteChats, updateFavoriteChatsMutation]
  )

  return {
    favorites: favoriteChats,
    toggleFavorite,
    isLoading,
  }
}

export function useChatSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadSearchHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const history = await readFromIndexedDB<SearchHistoryItem>(
        STORE_NAMES.CHAT_SEARCH_HISTORY
      )

      if (Array.isArray(history)) {
        const sortedHistory = history.sort((a, b) => b.timestamp - a.timestamp)
        setSearchHistory(sortedHistory)
      } else if (history && typeof history === "object" && "id" in history) {
        setSearchHistory([history])
      } else {
        setSearchHistory([])
      }
    } catch (error) {
      console.error("Failed to load chat search history:", error)
      setSearchHistory([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSearchHistory()
  }, [loadSearchHistory])

  const saveSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) return

      try {
        const trimmedQuery = query.trim()

        const existingHistory = await readFromIndexedDB<SearchHistoryItem>(
          STORE_NAMES.CHAT_SEARCH_HISTORY
        )
        let historyArray: SearchHistoryItem[] = []

        if (Array.isArray(existingHistory)) {
          historyArray = existingHistory
        } else if (
          existingHistory &&
          typeof existingHistory === "object" &&
          "id" in existingHistory
        ) {
          historyArray = [existingHistory]
        }

        const existingItemIndex = historyArray.findIndex(
          (item) => item.query.toLowerCase() === trimmedQuery.toLowerCase()
        )

        if (existingItemIndex !== -1) {
          const existingItem = historyArray[existingItemIndex]
          existingItem.timestamp = Date.now()

          historyArray.splice(existingItemIndex, 1)

          historyArray.unshift(existingItem)

          await writeToIndexedDB(STORE_NAMES.CHAT_SEARCH_HISTORY, existingItem)
        } else {
          const newSearch: SearchHistoryItem = {
            id: Date.now().toString(),
            query: trimmedQuery,
            timestamp: Date.now(),
          }

          await writeToIndexedDB(STORE_NAMES.CHAT_SEARCH_HISTORY, newSearch)
        }

        await loadSearchHistory()
      } catch (error) {
        console.error("Failed to save chat search:", error)
      }
    },
    [loadSearchHistory]
  )

  const clearHistory = useCallback(async () => {
    try {
      await deleteFromIndexedDB(STORE_NAMES.CHAT_SEARCH_HISTORY)
      await loadSearchHistory()
    } catch (error) {
      console.error("Failed to clear chat search history:", error)
    }
  }, [loadSearchHistory])

  return {
    searchHistory,
    saveSearch,
    clearHistory,
    isLoading,
    refetch: loadSearchHistory,
  }
}
