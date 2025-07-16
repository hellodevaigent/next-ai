"use client"

import { toast } from "@/components/ui/toast"
import { useFileDelete } from "@/lib/hooks/use-file-delete"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { MODEL_DEFAULT, SYSTEM_PROMPT_DEFAULT } from "../../../config"
import {
  deleteFromIndexedDB,
  readFromIndexedDB,
  STORE_NAMES,
  writeToIndexedDB,
} from "../../persist"
import type { Chats } from "../types"
import {
  createNewChat as createNewChatFromDb,
  deleteChat as deleteChatFromDb,
  fetchAndCacheChats,
  getCachedChats,
  updateChatModel as updateChatModelFromDb,
  updateChatTitle,
} from "./api"

interface FavoriteItem {
  id: string
}

interface ChatsContextType {
  chats: Chats[]
  favorites: string[]
  refresh: () => Promise<void>
  isLoading: boolean
  updateTitle: (id: string, title: string) => Promise<void>
  deleteChat: (
    id: string,
    currentChatId?: string,
    redirect?: () => void
  ) => Promise<void>
  setChats: React.Dispatch<React.SetStateAction<Chats[]>>
  createNewChat: (
    userId: string,
    title?: string,
    model?: string,
    isAuthenticated?: boolean,
    systemPrompt?: string,
    projectId?: string
  ) => Promise<Chats | undefined>
  resetChats: () => Promise<void>
  getChatById: (id: string) => Chats | undefined
  updateChatModel: (id: string, model: string) => Promise<void>
  bumpChat: (id: string) => Promise<void>
  markChatAsLoaded: (chatId: string) => void
  isChatLoaded: (chatId: string) => boolean
  toggleFavorite: (chatId: string) => Promise<void>
}
const ChatsContext = createContext<ChatsContextType | null>(null)

export function useChats() {
  const context = useContext(ChatsContext)
  if (!context) throw new Error("useChats must be used within ChatsProvider")
  return context
}

export function ChatsProvider({
  userId,
  children,
}: {
  userId?: string
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [chats, setChats] = useState<Chats[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [loadedChats, setLoadedChats] = useState<Set<string>>(new Set())
  const { deleteChatAttachments } = useFileDelete()

  const loadFavorites = useCallback(async () => {
    const favoriteItems = await readFromIndexedDB<FavoriteItem>(
      STORE_NAMES.CHAT_FAVORITE
    )
    if (Array.isArray(favoriteItems)) {
      setFavorites(favoriteItems.map((item) => item.id))
    }
  }, [])

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      setChats([])
      setFavorites([])
      return
    }

    const load = async () => {
      setIsLoading(true)
      const cached = await getCachedChats()
      setChats(cached)
      await loadFavorites()

      try {
        const fresh = await fetchAndCacheChats(userId)
        setChats(fresh)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [userId])

  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      const aIsFavorite = favorites.includes(a.id)
      const bIsFavorite = favorites.includes(b.id)
      if (aIsFavorite && !bIsFavorite) return -1
      if (!aIsFavorite && bIsFavorite) return 1
      return (
        new Date(b.updated_at || 0).getTime() -
        new Date(a.updated_at || 0).getTime()
      )
    })
  }, [chats, favorites])

  const toggleFavorite = useCallback(
    async (chatId: string) => {
      const originalFavorites = [...favorites]
      const isCurrentlyFavorite = originalFavorites.includes(chatId)

      const newFavorites = isCurrentlyFavorite
        ? originalFavorites.filter((id) => id !== chatId)
        : [...originalFavorites, chatId]

      setFavorites(newFavorites) // Optimistic update

      try {
        if (isCurrentlyFavorite) {
          await deleteFromIndexedDB(STORE_NAMES.CHAT_FAVORITE, chatId)
        } else {
          await writeToIndexedDB(STORE_NAMES.CHAT_FAVORITE, { id: chatId })
        }
      } catch (error) {
        console.error("Failed to toggle chat favorite:", error)
        setFavorites(originalFavorites) // Rollback
      }
    },
    [favorites]
  )

  const refresh = async () => {
    if (!userId) return

    const fresh = await fetchAndCacheChats(userId)
    setChats(fresh)
    await loadFavorites()
  }

  const updateTitle = async (id: string, title: string) => {
    const prev = [...chats]
    const updatedChatWithNewTitle = prev.map((c) =>
      c.id === id ? { ...c, title, updated_at: new Date().toISOString() } : c
    )
    setChats(updatedChatWithNewTitle)
    try {
      await updateChatTitle(id, title)
    } catch {
      setChats(prev)
      toast({ title: "Failed to update title", status: "error" })
    }
  }

  const deleteChat = async (
    id: string,
    currentChatId?: string,
    redirect?: () => void
  ) => {
    const prev = [...chats]
    setChats((prev) => prev.filter((c) => c.id !== id))

    try {
      await deleteChatAttachments(id)
      await deleteChatFromDb(id)
      await deleteFromIndexedDB(STORE_NAMES.CHAT_FAVORITE, id)
      if (id === currentChatId && redirect) redirect()
    } catch {
      setChats(prev)
      toast({ title: "Failed to delete chat", status: "error" })
    }
  }

  const createNewChat = async (
    userId: string,
    title?: string,
    model?: string,
    isAuthenticated?: boolean,
    systemPrompt?: string,
    projectId?: string
  ) => {
    if (!userId) return
    const prev = [...chats]

    const optimisticId = `optimistic-${Date.now().toString()}`
    const optimisticChat = {
      id: optimisticId,
      title: title || "New Chat",
      created_at: new Date().toISOString(),
      model: model || MODEL_DEFAULT,
      system_prompt: systemPrompt || SYSTEM_PROMPT_DEFAULT,
      user_id: userId,
      public: true,
      updated_at: new Date().toISOString(),
      project_id: null,
    }
    setChats((prev) => [optimisticChat, ...prev])

    try {
      const newChat = await createNewChatFromDb(
        userId,
        title,
        model,
        isAuthenticated,
        projectId
      )

      setChats((prev) => [
        newChat,
        ...prev.filter((c) => c.id !== optimisticId),
      ])

      return newChat
    } catch {
      setChats(prev)
      toast({ title: "Failed to create chat", status: "error" })
    }
  }

  const resetChats = async () => {
    setChats([])
  }

  const getChatById = (id: string) => {
    const chat = chats.find((c) => c.id === id)
    return chat
  }

  const updateChatModel = async (id: string, model: string) => {
    const prev = [...chats]
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, model } : c)))
    try {
      await updateChatModelFromDb(id, model)
    } catch {
      setChats(prev)
      toast({ title: "Failed to update model", status: "error" })
    }
  }

  const bumpChat = async (id: string) => {
    const prev = [...chats]
    const updatedChatWithNewUpdatedAt = prev.map((c) =>
      c.id === id ? { ...c, updated_at: new Date().toISOString() } : c
    )
    const sorted = updatedChatWithNewUpdatedAt.sort(
      (a, b) => +new Date(b.updated_at || "") - +new Date(a.updated_at || "")
    )
    setChats(sorted)
  }

  const markChatAsLoaded = useCallback((chatId: string) => {
    setLoadedChats((prev) => new Set(prev).add(chatId))
  }, [])

  const isChatLoaded = useCallback(
    (chatId: string) => {
      return loadedChats.has(chatId)
    },
    [loadedChats]
  )

  useEffect(() => {
    setLoadedChats(new Set())
  }, [userId])

  return (
    <ChatsContext.Provider
      value={{
        chats: sortedChats,
        favorites,
        refresh,
        updateTitle,
        deleteChat,
        setChats,
        createNewChat,
        resetChats,
        getChatById,
        updateChatModel,
        bumpChat,
        isLoading,
        markChatAsLoaded,
        isChatLoaded,
        toggleFavorite,
      }}
    >
      {children}
    </ChatsContext.Provider>
  )
}
