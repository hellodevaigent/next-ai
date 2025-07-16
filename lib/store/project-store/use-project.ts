import { useEffect, useState, useCallback } from 'react'
import { 
  readFromIndexedDB, 
  writeToIndexedDB, 
  deleteFromIndexedDB 
} from '@/lib/store/chat-store/persist'

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
}

interface FavoriteItem {
  id: string;
}

export function useProjectFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadFavorites = useCallback(async () => {
    setIsLoading(true)
    try {
      const favoriteItems = await readFromIndexedDB<FavoriteItem>("project-favorite")
      
      if (Array.isArray(favoriteItems)) {
        setFavorites(favoriteItems.map(item => item.id))
      } else if (favoriteItems && typeof favoriteItems === 'object' && 'id' in favoriteItems) {
        setFavorites([favoriteItems.id])
      } else {
        setFavorites([])
      }
    } catch (error) {
      console.error('Failed to load favorites:', error)
      setFavorites([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  const toggleFavorite = useCallback(async (projectId: string) => {
    try {
      const isCurrentlyFavorite = favorites.includes(projectId)
      
      if (isCurrentlyFavorite) {
        await deleteFromIndexedDB("project-favorite", projectId)
      } else {
        await writeToIndexedDB("project-favorite", { id: projectId })
      }
      await loadFavorites() 
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }, [favorites, loadFavorites])

  return { 
    favorites, 
    toggleFavorite, 
    isLoading,
    refetch: loadFavorites
  }
}


export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadSearchHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const history = await readFromIndexedDB<SearchHistoryItem>("project-search-istory")
      
      if (Array.isArray(history)) {
        const sortedHistory = history.sort((a, b) => b.timestamp - a.timestamp)
        setSearchHistory(sortedHistory)
      } else if (history && typeof history === 'object' && 'id' in history) {
        setSearchHistory([history])
      } else {
        setSearchHistory([])
      }
    } catch (error) {
      console.error('Failed to load search history:', error)
      setSearchHistory([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSearchHistory()
  }, [loadSearchHistory])

  const saveSearch = useCallback(async (query: string) => {
    if (!query.trim()) return
    
    try {
      const newSearch: SearchHistoryItem = {
        id: Date.now().toString(),
        query: query.trim(),
        timestamp: Date.now()
      }
      await writeToIndexedDB("project-search-istory", newSearch)
      await loadSearchHistory()
    } catch (error) {
      console.error('Failed to save search:', error)
    }
  }, [loadSearchHistory])

  const clearHistory = useCallback(async () => {
    try {
      await deleteFromIndexedDB("project-search-istory")
      await loadSearchHistory()
    } catch (error) {
      console.error('Failed to clear search history:', error)
    }
  }, [loadSearchHistory])

  return {
    searchHistory,
    saveSearch,
    clearHistory,
    isLoading,
    refetch: loadSearchHistory
  }
}