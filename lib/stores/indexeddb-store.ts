interface ProjectData {
  id: string
  name: string
  user_id: string
  created_at: string
  is_favorite?: boolean
  search_count?: number
  last_accessed?: string
}

interface SearchHistory {
  id: string
  query: string
  timestamp: string
  results_count: number
}

class IndexedDBStore {
  private db: IDBDatabase | null = null
  private readonly DB_NAME = 'ProjectsDB'
  private readonly DB_VERSION = 1

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Projects store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' })
          projectStore.createIndex('name', 'name', { unique: false })
          projectStore.createIndex('is_favorite', 'is_favorite', { unique: false })
          projectStore.createIndex('user_id', 'user_id', { unique: false })
        }

        // Search history store
        if (!db.objectStoreNames.contains('search_history')) {
          const searchStore = db.createObjectStore('search_history', { keyPath: 'id' })
          searchStore.createIndex('timestamp', 'timestamp', { unique: false })
          searchStore.createIndex('query', 'query', { unique: false })
        }

        // App settings store
        if (!db.objectStoreNames.contains('app_settings')) {
          const settingsStore = db.createObjectStore('app_settings', { keyPath: 'key' })
        }
      }
    })
  }

  // Helper method to promisify IDB requests
  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Projects operations
  async saveProject(project: ProjectData): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['projects'], 'readwrite')
    const store = transaction.objectStore('projects')
    
    // Ensure is_favorite has a default value
    const projectData = {
      ...project,
      is_favorite: project.is_favorite || false
    }
    
    await this.promisifyRequest(store.put(projectData))
  }

  async getProjects(): Promise<ProjectData[]> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['projects'], 'readonly')
    const store = transaction.objectStore('projects')
    return await this.promisifyRequest(store.getAll())
  }

  async getProject(id: string): Promise<ProjectData | undefined> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['projects'], 'readonly')
    const store = transaction.objectStore('projects')
    return await this.promisifyRequest(store.get(id))
  }

  async toggleFavorite(projectId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['projects'], 'readwrite')
    const store = transaction.objectStore('projects')
    
    const project = await this.promisifyRequest(store.get(projectId))
    
    if (project) {
      project.is_favorite = !project.is_favorite
      await this.promisifyRequest(store.put(project))
    }
  }

  async getFavoriteProjects(): Promise<ProjectData[]> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['projects'], 'readonly')
    const store = transaction.objectStore('projects')
    
    // Get all projects and filter favorites in JavaScript
    const allProjects = await this.promisifyRequest(store.getAll())
    return allProjects.filter(project => project.is_favorite === true)
  }

  async searchProjects(query: string): Promise<ProjectData[]> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['projects'], 'readonly')
    const store = transaction.objectStore('projects')
    
    const allProjects = await this.promisifyRequest(store.getAll())
    return allProjects.filter(project => 
      project.name.toLowerCase().includes(query.toLowerCase())
    )
  }

  // Search operations
  async saveSearchQuery(query: string, resultsCount: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    const searchEntry: SearchHistory = {
      id: `search_${Date.now()}_${Math.random()}`,
      query: query.trim(),
      timestamp: new Date().toISOString(),
      results_count: resultsCount
    }

    const transaction = this.db.transaction(['search_history'], 'readwrite')
    const store = transaction.objectStore('search_history')
    await this.promisifyRequest(store.put(searchEntry))
  }

  async getSearchHistory(limit: number = 10): Promise<SearchHistory[]> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['search_history'], 'readonly')
    const store = transaction.objectStore('search_history')
    
    const allSearches = await this.promisifyRequest(store.getAll())
    
    // Sort by timestamp descending and limit results
    return allSearches
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  async clearSearchHistory(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['search_history'], 'readwrite')
    const store = transaction.objectStore('search_history')
    await this.promisifyRequest(store.clear())
  }

  // Settings operations
  async saveSetting(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['app_settings'], 'readwrite')
    const store = transaction.objectStore('app_settings')
    await this.promisifyRequest(store.put({ key, value }))
  }

  async getSetting(key: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['app_settings'], 'readonly')
    const store = transaction.objectStore('app_settings')
    
    const result = await this.promisifyRequest(store.get(key))
    return result?.value
  }

  async deleteSetting(key: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['app_settings'], 'readwrite')
    const store = transaction.objectStore('app_settings')
    await this.promisifyRequest(store.delete(key))
  }

  // Utility methods
  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['projects', 'search_history', 'app_settings'], 'readwrite')
    
    await Promise.all([
      this.promisifyRequest(transaction.objectStore('projects').clear()),
      this.promisifyRequest(transaction.objectStore('search_history').clear()),
      this.promisifyRequest(transaction.objectStore('app_settings').clear())
    ])
  }

  async getStats(): Promise<{
    totalProjects: number
    totalFavorites: number
    totalSearches: number
    lastActivity: string | null
  }> {
    if (!this.db) throw new Error('Database not initialized')
    
    const [projects, searches] = await Promise.all([
      this.getProjects(),
      this.getSearchHistory()
    ])

    const favorites = projects.filter(p => p.is_favorite)
    const lastActivity = projects.length > 0 
      ? projects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
      : null

    return {
      totalProjects: projects.length,
      totalFavorites: favorites.length,
      totalSearches: searches.length,
      lastActivity
    }
  }
}

export const indexedDBStore = new IndexedDBStore()