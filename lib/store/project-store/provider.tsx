"use client"

import { toast } from "@/components/ui/toast"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import {
  createNewProject as apiCreate,
  deleteProject as apiDelete,
  getCachedProjects,
  syncProjects,
  updateProject as apiUpdate,
} from "./api"
import type { Project } from "./types"

interface ProjectsContextType {
  projects: Project[]
  isLoading: boolean
  getProjectById: (id: string) => Project | undefined
  refreshProjects: () => Promise<void>
  createProject: (name: string) => Promise<Project | undefined>
  updateProjectName: (id: string, name: string) => Promise<void>
  deleteProject: (id: string) => Promise<void>
}

const ProjectsContext = createContext<ProjectsContextType | null>(null)

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (!context) {
    throw new Error("useProjects must be used within a ProjectsProvider")
  }
  return context
}

export function ProjectsProvider({
  children,
  userId,
}: {
  children: React.ReactNode,
  userId?: string
}) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
        setIsLoading(false)
        setProjects([])
        return
    };

    setIsLoading(true);

    getCachedProjects().then(cachedProjects => {
      setProjects(cachedProjects)
    })

    syncProjects()
      .then(freshProjects => {
        setProjects(freshProjects)
      })
      .catch(error => {
        console.error("Error during initial project sync:", error)
        toast({ title: "Could not fetch latest projects.", status: "error" })
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [userId])

  const getProjectById = useCallback((id: string) => {
    return projects.find(p => p.id === id)
  }, [projects])

  const refreshProjects = useCallback(async () => {
    setIsLoading(true)
    try {
      const freshProjects = await syncProjects()
      setProjects(freshProjects)
    } catch (error) {
      toast({ title: "Failed to refresh projects", status: "error" })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createProject = useCallback(async (name: string) => {
    try {
      const newProject = await apiCreate(name)
      setProjects(prev => [newProject, ...prev])
      toast({ title: "Project created!", status: "success" })
      return newProject
    } catch (error: any) {
      toast({ title: "Failed to create project", description: error.message, status: "error" })
    }
  }, [])

  const updateProjectName = useCallback(async (id: string, name: string) => {
    const originalProjects = [...projects]
    // Optimistic update
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, name } : p))
    )
    try {
      await apiUpdate(id, name)
    } catch (error: any) {
      setProjects(originalProjects)
      toast({ title: "Failed to update project", description: error.message, status: "error" })
    }
  }, [projects])

  const deleteProject = useCallback(async (id: string) => {
    const originalProjects = [...projects]
    // Optimistic update
    setProjects(prev => prev.filter(p => p.id !== id))
    try {
      await apiDelete(id)
      toast({ title: "Project deleted", status: "success" })
    } catch (error: any) {
      setProjects(originalProjects) // Rollback
      toast({ title: "Failed to delete project", description: error.message, status: "error" })
    }
  }, [projects])

  const value = {
    projects,
    isLoading,
    getProjectById,
    refreshProjects,
    createProject,
    updateProjectName,
    deleteProject,
  }

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  )
}