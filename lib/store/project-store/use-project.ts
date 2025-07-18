import { useEffect, useState, useCallback } from 'react'
import { 
  readFromIndexedDB, 
  writeToIndexedDB, 
  deleteFromIndexedDB 
} from '@/lib/store/persist'
import { STORE_NAMES } from '../persist';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '@/lib/fetch';
import { API_ROUTE_FAVORITE_PROJECT } from '@/lib/routes';

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
}

type FavoriteProjectsResponse = {
  favorite_projects: string[];
};

export function useProjectFavorites() {
  const queryClient = useQueryClient();

  const { data: favoriteProjects = [], isLoading } = useQuery<string[]>({
    queryKey: ["favorite-projects"],
    queryFn: async () => {
      const response = await fetchClient(
        API_ROUTE_FAVORITE_PROJECT
      );
      if (!response.ok) {
        throw new Error("Failed to fetch favorite projects");
      }
      const data: FavoriteProjectsResponse = await response.json();
      return data.favorite_projects || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const updateFavoriteProjectsMutation = useMutation({
    mutationFn: async (favorites: string[]) => {
      const response = await fetchClient(
        API_ROUTE_FAVORITE_PROJECT,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ favorite_projects: favorites }),
        }
      );
      if (!response.ok) throw new Error("Failed to save favorite projects");
      return (await response.json()) as FavoriteProjectsResponse;
    },
    onMutate: async (newFavorites) => {
      await queryClient.cancelQueries({ queryKey: ["favorite-projects"] });
      const previousFavorites = queryClient.getQueryData<string[]>(["favorite-projects"]);
      queryClient.setQueryData(["favorite-projects"], newFavorites);
      return { previousFavorites };
    },
    onError: (err, newFavorites, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(["favorite-projects"], context.previousFavorites);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-projects"] });
    },
  });

  const toggleFavorite = useCallback(
    (projectId: string) => {
      const newFavorites = favoriteProjects.includes(projectId)
        ? favoriteProjects.filter((id) => id !== projectId)
        : [...favoriteProjects, projectId];
      updateFavoriteProjectsMutation.mutate(newFavorites);
    },
    [favoriteProjects, updateFavoriteProjectsMutation]
  );

  return {
    favorites: favoriteProjects,
    toggleFavorite,
    isLoading,
  };
}

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadSearchHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const history = await readFromIndexedDB<SearchHistoryItem>(STORE_NAMES.CHAT_SEARCH_HISTORY)
      
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
      await writeToIndexedDB(STORE_NAMES.CHAT_SEARCH_HISTORY, newSearch)
      await loadSearchHistory()
    } catch (error) {
      console.error('Failed to save search:', error)
    }
  }, [loadSearchHistory])

  const clearHistory = useCallback(async () => {
    try {
      await deleteFromIndexedDB(STORE_NAMES.CHAT_SEARCH_HISTORY)
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