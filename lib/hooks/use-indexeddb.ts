import { useEffect, useState, useCallback } from 'react'
import { indexedDBStore } from '@/lib/stores/indexeddb-store'

export function useIndexedDB() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initDB = async () => {
      try {
        await indexedDBStore.init()
        setIsInitialized(true)
        setError(null)
      } catch (error) {
        console.error('Failed to initialize IndexedDB:', error)
        setError(error instanceof Error ? error.message : 'Failed to initialize database')
      }
    }

    initDB()
  }, [])

  return { isInitialized, error, indexedDBStore }
}

export function useProjectFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isInitialized } = useIndexedDB()

  const loadFavorites = useCallback(async () => {
    if (!isInitialized) return
    
    try {
      setIsLoading(true)
      const favoriteProjects = await indexedDBStore.getFavoriteProjects()
      setFavorites(favoriteProjects.map(p => p.id))
    } catch (error) {
      console.error('Failed to load favorites:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  const toggleFavorite = useCallback(async (projectId: string) => {
    try {
      await indexedDBStore.toggleFavorite(projectId)
      await loadFavorites()
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }, [loadFavorites])

  const isFavorite = useCallback((projectId: string) => {
    return favorites.includes(projectId)
  }, [favorites])

  return { 
    favorites, 
    toggleFavorite, 
    isFavorite, 
    isLoading,
    refetch: loadFavorites
  }
}

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isInitialized } = useIndexedDB()

  const loadSearchHistory = useCallback(async () => {
    if (!isInitialized) return
    
    try {
      setIsLoading(true)
      const history = await indexedDBStore.getSearchHistory()
      setSearchHistory(history)
    } catch (error) {
      console.error('Failed to load search history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  useEffect(() => {
    loadSearchHistory()
  }, [loadSearchHistory])

  const saveSearch = useCallback(async (query: string, resultsCount: number = 0) => {
    if (!query.trim()) return
    
    try {
      await indexedDBStore.saveSearchQuery(query, resultsCount)
      await loadSearchHistory()
    } catch (error) {
      console.error('Failed to save search:', error)
    }
  }, [loadSearchHistory])

  const clearHistory = useCallback(async () => {
    try {
      await indexedDBStore.clearSearchHistory()
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