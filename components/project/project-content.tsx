"use client"

import { SearchBar } from "@/components/project/search-bar"
import { useBreakpoint } from "@/lib/hooks/use-breakpoint"
import { useProjectFavorites } from "@/lib/store/project-store/use-project"
import { useTitle } from "@/lib/hooks/use-title"
import { useProjects } from "@/lib/store/project-store/provider"
import { cn } from "@/lib/utils"
import { FolderIcon, FolderPlusIcon, StarIcon } from "@phosphor-icons/react"
import { usePathname } from "next/navigation"
import { useMemo, useState } from "react"
import { ProjectCardSkeleton } from "../skeleton/project"
import { DialogCreateProject } from "./dialog-create-project"
import { ProjectCard } from "./project-card"

export type Project = {
  id: string
  name: string
  user_id: string
  created_at: string
}

export function ProjectContent() {
  useTitle(null, "Projects")
  const { projects, isLoading } = useProjects()
  const { favorites, toggleFavorite } = useProjectFavorites()
  const pathname = usePathname()
  const isMobile = useBreakpoint(1024)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFavorites, setShowFavorites] = useState(false)

  const filteredProjects = useMemo(() => {
    let filtered = projects

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by favorites
    if (showFavorites) {
      filtered = filtered.filter((project) => favorites.includes(project.id))
    }

    // Sort projects: favorites first, then by creation date (newest first)
    return filtered.sort((a, b) => {
      const aIsFavorite = favorites.includes(a.id)
      const bIsFavorite = favorites.includes(b.id)

      // If one is favorite and other is not, favorite goes first
      if (aIsFavorite && !bIsFavorite) return -1
      if (!aIsFavorite && bIsFavorite) return 1

      // If both are favorites or both are not favorites, sort by creation date
      return (
        (b.created_at ? new Date(b.created_at).getTime() : 0) -
        (a.created_at ? new Date(a.created_at).getTime() : 0)
      )
    })
  }, [projects, searchQuery, showFavorites, favorites])

  const totalProjects = projects.length
  const totalFavorites = favorites.length

  return (
    <div className={cn("flex flex-col")}>
      {/* Header Section */}
      <div className="bg-background border-border sticky top-[56px] z-40 border-b px-4 py-4">
        <div className="flex flex-col gap-4 py-[2px]">
          {/* Search Bar */}
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search projects..."
            className="w-full"
          />

          {/* Stats and Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-muted-foreground text-sm">
                Total:{" "}
                <span className="text-foreground font-medium">
                  {totalProjects}
                </span>
              </div>
              <div className="text-muted-foreground text-sm">
                Favorites:{" "}
                <span className="text-foreground font-medium">
                  {totalFavorites}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={cn(
                "flex items-center gap-2 rounded-md p-1.75 text-sm font-medium transition-colors",
                showFavorites
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              <StarIcon size={16} weight={showFavorites ? "fill" : "regular"} />
            </button>
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="text-muted-foreground text-sm">
              Found {filteredProjects.length} project
              {filteredProjects.length !== 1 ? "s" : ""}
              {searchQuery && ` for "${searchQuery}"`}
            </div>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="h-full w-full flex-1 px-4 py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {/* Create New Project Card */}
          {filteredProjects.length > 0 && !showFavorites && (
            <div
              className="group border-muted-foreground/30 hover:border-primary/50 relative h-28 cursor-pointer rounded-lg border-2 border-dashed transition-all duration-300 hover:shadow-md"
              onClick={() => setIsDialogOpen(true)}
            >
              <div className="from-primary/5 absolute inset-0 rounded-lg bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="text-muted-foreground group-hover:text-primary flex h-full flex-col items-center justify-center transition-colors duration-300">
                <FolderPlusIcon size={24} className="mb-1" />
                <span className="text-sm font-medium">New Project</span>
              </div>
            </div>
          )}

          {/* Project Cards */}
          {isLoading ? (
            <ProjectCardSkeleton count={9} />
          ) : (
            filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project as Project}
                index={index}
                pathname={pathname}
                isMobile={isMobile}
                isFavorite={favorites.includes(project.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))
          )}
        </div>

        {/* Empty State */}
        {!isLoading && filteredProjects.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <FolderIcon size={48} className="text-muted-foreground mb-4" />
            <h3 className="mb-2 text-lg font-medium">
              {searchQuery
                ? "No projects found"
                : showFavorites
                  ? "No favorite projects"
                  : "No projects yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? `No projects match "${searchQuery}"`
                : showFavorites
                  ? "Mark some projects as favorites to see them here"
                  : "Create your first project to get started"}
            </p>
            {!searchQuery && !showFavorites && (
              <button
                onClick={() => setIsDialogOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
              >
                Create Project
              </button>
            )}
          </div>
        )}
      </div>

      <DialogCreateProject isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </div>
  )
}
