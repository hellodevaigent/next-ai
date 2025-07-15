"use client"

import { useEffect, useState } from 'react'
import { indexedDBStore } from '@/lib/stores/indexeddb-store'
import { FolderIcon, Heart, MagnifyingGlass, Clock } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useIndexedDB } from '@/lib/hooks/use-indexeddb'

interface ProjectStats {
  totalProjects: number
  totalFavorites: number
  totalSearches: number
  lastActivity: string | null
}

export function ProjectStats() {
  const [stats, setStats] = useState<ProjectStats>({
    totalProjects: 0,
    totalFavorites: 0,
    totalSearches: 0,
    lastActivity: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const { isInitialized } = useIndexedDB()

  useEffect(() => {
    if (isInitialized) {
      loadStats()
    }
  }, [isInitialized])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      const statsData = await indexedDBStore.getStats()
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    color = 'text-primary',
    bgColor = 'bg-primary/10'
  }: {
    icon: any
    label: string
    value: string | number
    color?: string
    bgColor?: string
  }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow">
      <div className={cn("p-2 rounded-lg", bgColor)}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{isLoading ? '...' : value}</p>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        icon={FolderIcon}
        label="Total Projects"
        value={stats.totalProjects}
        color="text-blue-600"
        bgColor="bg-blue-100 dark:bg-blue-900/20"
      />
      <StatCard
        icon={Heart}
        label="Favorites"
        value={stats.totalFavorites}
        color="text-red-600"
        bgColor="bg-red-100 dark:bg-red-900/20"
      />
      <StatCard
        icon={MagnifyingGlass}
        label="Recent Searches"
        value={stats.totalSearches}
        color="text-green-600"
        bgColor="bg-green-100 dark:bg-green-900/20"
      />
      <StatCard
        icon={Clock}
        label="Last Activity"
        value={stats.lastActivity ? formatDate(stats.lastActivity) : 'None'}
        color="text-purple-600"
        bgColor="bg-purple-100 dark:bg-purple-900/20"
      />
    </div>
  )
}