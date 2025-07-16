"use client"

import { useState, useEffect, useRef } from 'react'
import { MagnifyingGlass, Clock, X, Trash } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useSearchHistory } from '@/lib/store/project-store/use-project'
import { Input } from '../ui/input'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ onSearch, placeholder = "Search projects...", className }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { searchHistory, saveSearch, clearHistory, isLoading } = useSearchHistory()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim()
    if (trimmedQuery) {
      await saveSearch(trimmedQuery)
      onSearch(trimmedQuery)
      setQuery(trimmedQuery)
      setIsOpen(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch(query)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const clearSearch = () => {
    setQuery('')
    onSearch('')
    inputRef.current?.focus()
  }

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery)
    handleSearch(historyQuery)
  }

  const handleClearHistory = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await clearHistory()
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <MagnifyingGlass 
          size={20} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
        />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && !isLoading && searchHistory.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center justify-between mb-2 px-2">
              <div className="text-xs text-muted-foreground">Recent searches</div>
              <button
                onClick={handleClearHistory}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
              >
                <Trash size={12} />
                Clear
              </button>
            </div>
            {searchHistory.map((item) => (
              <button
                key={item.id}
                onClick={() => handleHistoryClick(item.query)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-md text-left group transition-colors"
              >
                <Clock size={14} className="text-muted-foreground" />
                <span className="flex-1 truncate">{item.query}</span>
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}