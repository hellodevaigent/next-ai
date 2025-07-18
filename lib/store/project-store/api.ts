import {
  deleteFromIndexedDB,
  readFromIndexedDB,
  writeToIndexedDB,
} from "@/lib/store/persist"
import { fetchClient } from "@/lib/fetch"
import type { Project } from "./types"
import { API_ROUTE_PROJECTS } from "@/lib/routes"

async function fetchProjectsFromApi(): Promise<Project[]> {
  const response = await fetchClient(API_ROUTE_PROJECTS)
  if (!response.ok) {
    throw new Error("Failed to fetch projects from API")
  }
  return response.json()
}

async function createProjectInApi(name: string): Promise<Project> {
  const response = await fetchClient(API_ROUTE_PROJECTS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || "Failed to create project")
  }
  return response.json()
}

async function updateProjectInApi(id: string, name: string): Promise<Project> {
  const response = await fetchClient(`${API_ROUTE_PROJECTS}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || "Failed to update project")
  }
  return response.json()
}

async function deleteProjectFromApi(id: string): Promise<void> {
  const response = await fetchClient(`${API_ROUTE_PROJECTS}/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || "Failed to delete project")
  }
}

export async function getCachedProjects(): Promise<Project[]> {
  const projects = await readFromIndexedDB<Project[]>("projects")
  return Array.isArray(projects) ? projects.flat() : []
}

export async function syncProjects(): Promise<Project[]> {
  try {
    const freshProjects = await fetchProjectsFromApi()

    const cachedProjects = await getCachedProjects()
    const keysToDelete = cachedProjects.map((p) => p.id)

    if (keysToDelete.length > 0) {
      await deleteFromIndexedDB("projects", keysToDelete)
    }

    if (freshProjects.length > 0) {
      await writeToIndexedDB("projects", freshProjects)
    }

    return freshProjects
  } catch (error) {
    console.error("Failed to sync projects, will return cached data.", error)
    return getCachedProjects()
  }
}

export async function createNewProject(name: string): Promise<Project> {
  const newProject = await createProjectInApi(name)
  await writeToIndexedDB("projects", newProject)
  return newProject
}

export async function updateProject(
  id: string,
  name: string
): Promise<Project> {
  const updatedProject = await updateProjectInApi(id, name)
  await writeToIndexedDB("projects", updatedProject)
  return updatedProject
}

export async function deleteProject(id: string): Promise<void> {
  await deleteProjectFromApi(id)
  await deleteFromIndexedDB("projects", id)
}
