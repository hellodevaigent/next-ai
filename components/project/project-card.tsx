"use client"

import { DialogDeleteProject } from "@/components/project/dialog-delete-project"
import { useSidebar } from "@/components/ui/sidebar"
import useClickOutside from "@/lib/hooks/use-click-outside"
import { useProjects } from "@/lib/store/project-store/provider"
import { cn } from "@/lib/utils"
import {
  Check,
  DotsThree,
  FolderIcon,
  PencilSimple,
  StarIcon,
  Trash,
  X,
} from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useRef, useState } from "react"
import { Project } from "./project-content"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ProjectCardProps = {
  project: Project
  index: number
  pathname: string
  isMobile: boolean
  isFavorite: boolean
  onToggleFavorite: (projectId: string) => void
}

export function ProjectCard({
  project,
  isMobile,
  isFavorite,
  onToggleFavorite,
}: ProjectCardProps) {
  const { updateProjectName } = useProjects()
  const { setOpenMobile: setOpenSidebarMobile } = useSidebar()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(project.name || "")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const lastProjectNameRef = useRef(project.name)
  const containerRef = useRef<HTMLDivElement | null>(null)

  if (!isEditing && lastProjectNameRef.current !== project.name) {
    lastProjectNameRef.current = project.name
    setEditName(project.name || "")
  }

  const handleStartEditing = useCallback(() => {
    setIsEditing(true)
    setEditName(project.name || "")
    setIsDropdownOpen(false)

    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    })
  }, [project.name])

  const handleSave = async () => {
    if (editName.trim() && editName.trim() !== project.name) {
      await updateProjectName(project.id, editName.trim())
    }
    setIsEditing(false)
  }

  const handleCancel = useCallback(() => {
    setEditName(project.name || "")
    setIsEditing(false)
  }, [project.name])

  const handleDeleteClick = useCallback(() => {
    setIsDeleteDialogOpen(true)
    setIsDropdownOpen(false)
  }, [])

  const handleFavoriteClick = useCallback(() => {
    onToggleFavorite(project.id)
    setIsDropdownOpen(false)
  }, [project.id, onToggleFavorite])

  const handleClickOutside = useCallback(() => {
    if (isEditing) {
      handleSave()
    }
  }, [isEditing, handleSave])

  useClickOutside(containerRef, handleClickOutside)

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditName(e.target.value)
    },
    []
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleSave()
      } else if (e.key === "Escape") {
        e.preventDefault()
        handleCancel()
      }
    },
    [handleSave, handleCancel]
  )

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if (isEditing || isDropdownOpen) {
        e.stopPropagation()
      }
    },
    [isEditing, isDropdownOpen]
  )

  const handleSaveClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      handleSave()
    },
    [handleSave]
  )

  const handleCancelClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      handleCancel()
    },
    [handleCancel]
  )

  const handleCardClick = useCallback(() => {
    if (!isEditing && !isDropdownOpen) {
      setOpenSidebarMobile(false)
      router.push(`/p/${project.id}`)
    }
  }, [isEditing, isDropdownOpen, project.id, router, setOpenSidebarMobile])

  const displayName = useMemo(
    () => project.name || "Untitled Project",
    [project.name]
  )

  return (
    <div
      className="group border-border bg-card hover:bg-accent/5 relative h-28 rounded-lg border-2 transition-all duration-300 hover:shadow-md"
      onClick={handleContainerClick}
      ref={containerRef}
    >
      <div className={cn(
        "from-primary/5 absolute inset-0 rounded-lg bg-gradient-to-br to-transparent transition-opacity duration-300 ",
        isDropdownOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )} />

      {/* Corner borders */}
      <div className="border-primary/20 absolute top-0 left-0 h-3 w-3 rounded-tl-lg border-t-2 border-l-2" />
      <div className="border-primary/20 absolute top-0 right-0 h-3 w-3 rounded-tr-lg border-t-2 border-r-2" />
      <div className="border-primary/20 absolute bottom-0 left-0 h-3 w-3 rounded-bl-lg border-b-2 border-l-2" />
      <div className="border-primary/20 absolute right-0 bottom-0 h-3 w-3 rounded-br-lg border-r-2 border-b-2" />

      {/* Favorite star - only show when favorited */}
      {isFavorite && (
        <div className="absolute top-1.5 left-1.5 z-20 flex size-6.5 items-center justify-center rounded-md bg-yellow-500/20 text-yellow-500">
          <StarIcon size={14} weight="fill" />
        </div>
      )}

      {isEditing ? (
        <div className="relative z-10 flex h-full flex-col items-center justify-center p-3">
          <input
            ref={inputRef}
            value={editName}
            onChange={handleInputChange}
            className="border-border w-full border-b bg-transparent pb-1 text-center text-sm focus:outline-none"
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <div className="absolute top-1.5 right-1.5 z-20 flex gap-1 transition-opacity duration-200">
            <button
              onClick={handleSaveClick}
              className="bg-primary/20 hover:bg-primary/30 flex size-6.5 items-center justify-center rounded-md transition-colors duration-150"
              type="button"
            >
              <Check size={14} weight="bold" />
            </button>
            <button
              onClick={handleCancelClick}
              className="bg-destructive/20 hover:bg-destructive/30 flex size-6.5 items-center justify-center rounded-md transition-colors duration-150"
              type="button"
            >
              <X size={14} weight="bold" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <button
            className="block h-full w-full cursor-pointer"
            onClick={handleCardClick}
            type="button"
          >
            <div className="relative z-10 flex h-full flex-col items-center justify-center p-3 text-center">
              <FolderIcon size={20} className="text-primary mb-2" />
              <span className="text-foreground line-clamp-2 text-sm leading-tight font-medium">
                {displayName}
              </span>
            </div>
          </button>

          {/* Dropdown Menu */}
          <div
            className={cn(
              "absolute top-1.5 right-1.5 z-20 transition-opacity duration-200",
              isMobile
                ? "opacity-100"
                : isDropdownOpen
                ? "opacity-100 bg-secondary rounded-md"
                : "opacity-0 group-hover:opacity-100"
            )}
          >
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex size-6.5 cursor-pointer items-center justify-center rounded-md p-1 transition-colors duration-150 hover:bg-secondary"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DotsThree size={16} className="text-primary" weight="bold" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={handleFavoriteClick}>
                  <StarIcon size={16} weight={isFavorite ? "fill" : "regular"} />
                  {isFavorite ? "Unfavorite" : "Favorite"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleStartEditing}>
                  <PencilSimple size={16} />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteClick}
                  variant="destructive"
                >
                  <Trash size={16} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}

      <DialogDeleteProject
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        project={project}
      />
    </div>
  )
}