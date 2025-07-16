import { useCallback, useEffect, useState } from 'react';
import {
  deleteFromIndexedDB,
  readFromIndexedDB,
  writeToIndexedDB
} from '@/lib/store/persist';
import { STORE_NAMES } from '../persist';

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
}

export function useChatSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSearchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const history = await readFromIndexedDB<SearchHistoryItem>(STORE_NAMES.CHAT_SEARCH_HISTORY);
      
      if (Array.isArray(history)) {
        const sortedHistory = history.sort((a, b) => b.timestamp - a.timestamp);
        setSearchHistory(sortedHistory);
      } else if (history && typeof history === 'object' && 'id' in history) {
        setSearchHistory([history]);
      } else {
        setSearchHistory([]);
      }
    } catch (error) {
      console.error('Failed to load chat search history:', error);
      setSearchHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSearchHistory();
  }, [loadSearchHistory]);

  const saveSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    try {
      const trimmedQuery = query.trim();
      
      const existingHistory = await readFromIndexedDB<SearchHistoryItem>(STORE_NAMES.CHAT_SEARCH_HISTORY);
      let historyArray: SearchHistoryItem[] = [];
      
      if (Array.isArray(existingHistory)) {
        historyArray = existingHistory;
      } else if (existingHistory && typeof existingHistory === 'object' && 'id' in existingHistory) {
        historyArray = [existingHistory];
      }
      
      const existingItemIndex = historyArray.findIndex(item => 
        item.query.toLowerCase() === trimmedQuery.toLowerCase()
      );
      
      if (existingItemIndex !== -1) {
        const existingItem = historyArray[existingItemIndex];
        existingItem.timestamp = Date.now();
        
        historyArray.splice(existingItemIndex, 1);
        
        historyArray.unshift(existingItem);
        
        await writeToIndexedDB(STORE_NAMES.CHAT_SEARCH_HISTORY, existingItem);
      } else {
        const newSearch: SearchHistoryItem = {
          id: Date.now().toString(),
          query: trimmedQuery,
          timestamp: Date.now()
        };
        
        await writeToIndexedDB(STORE_NAMES.CHAT_SEARCH_HISTORY, newSearch);
      }
      
      await loadSearchHistory();
    } catch (error) {
      console.error('Failed to save chat search:', error);
    }
  }, [loadSearchHistory]);

  const clearHistory = useCallback(async () => {
    try {
      await deleteFromIndexedDB(STORE_NAMES.CHAT_SEARCH_HISTORY);
      await loadSearchHistory();
    } catch (error) {
      console.error('Failed to clear chat search history:', error);
    }
  }, [loadSearchHistory]);

  return {
    searchHistory,
    saveSearch,
    clearHistory,
    isLoading,
    refetch: loadSearchHistory
  };
}