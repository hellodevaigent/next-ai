"use client"

import { DialogDeleteProject } from "@/components/project/dialog-delete-project"
import { useSidebar } from "@/components/ui/sidebar"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import useClickOutside from "@/hooks/use-click-outside"
import { fetchClient } from "@/lib/fetch"
import { useTitle } from "@/lib/hooks/use-title"
import { cn } from "@/lib/utils"
import {
  Check,
  DotsThree,
  FolderIcon,
  FolderPlusIcon,
  PencilSimple,
  Trash,
  X,
} from "@phosphor-icons/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useMemo, useRef, useState } from "react"
import { ProjectCardSkeleton } from "../skeleton/project"
import { DialogCreateProject } from "./dialog-create-project"

type Project = {
  id: string
  name: string
  user_id: string
  created_at: string
}

export function ProjectContent() {
  useTitle(null, "Projects")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const isMobile = useBreakpoint(768)

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects")
      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }
      return response.json()
    },
  })

  return (
    <div className="flex flex-col justify-start px-4 py-6">
      <div className="w-full">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
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

          {isLoading ? (
            <ProjectCardSkeleton count={9} />
          ) : (
            projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                pathname={pathname}
                queryClient={queryClient}
                isMobile={isMobile}
              />
            ))
          )}
        </div>
      </div>

      <DialogCreateProject isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </div>
  )
}

type ProjectCardProps = {
  project: Project
  index: number
  pathname: string
  queryClient: any
  isMobile: boolean
}

function ProjectCard({ project, queryClient, isMobile }: ProjectCardProps) {
  const { setOpenMobile: setOpenSidebarMobile } = useSidebar()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(project.name || "")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const lastProjectNameRef = useRef(project.name)
  const containerRef = useRef<HTMLDivElement | null>(null)

  if (!isEditing && lastProjectNameRef.current !== project.name) {
    lastProjectNameRef.current = project.name
    setEditName(project.name || "")
  }

  const updateProjectMutation = useMutation({
    mutationFn: async ({
      projectId,
      name,
    }: {
      projectId: string
      name: string
    }) => {
      const response = await fetchClient(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update project")
      }

      return response.json()
    },
    onMutate: async ({ projectId, name }) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] })
      await queryClient.cancelQueries({ queryKey: ["project", projectId] })

      const previousProjects = queryClient.getQueryData(["projects"])
      const previousProject = queryClient.getQueryData(["project", projectId])

      queryClient.setQueryData(["projects"], (old: Project[] | undefined) => {
        if (!old) return old
        return old.map((p: Project) =>
          p.id === projectId ? { ...p, name } : p
        )
      })

      queryClient.setQueryData(
        ["project", projectId],
        (old: Project | undefined) => {
          if (!old) return old
          return { ...old, name }
        }
      )

      return { previousProjects, previousProject, projectId }
    },
    onError: (err, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(["projects"], context.previousProjects)
      }
      if (context?.previousProject) {
        queryClient.setQueryData(
          ["project", context.projectId],
          context.previousProject
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["project", project.id] })
    },
  })

  const handleStartEditing = useCallback(() => {
    setIsEditing(true)
    setEditName(project.name || "")
    setIsMenuOpen(false)

    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    })
  }, [project.name])

  const handleSave = useCallback(async () => {
    if (editName.trim() !== project.name) {
      updateProjectMutation.mutate({
        projectId: project.id,
        name: editName.trim(),
      })
    }
    setIsEditing(false)
    setIsMenuOpen(false)
  }, [project.id, project.name, editName, updateProjectMutation])

  const handleCancel = useCallback(() => {
    setEditName(project.name || "")
    setIsEditing(false)
    setIsMenuOpen(false)
  }, [project.name])

  const handleDeleteClick = useCallback(() => {
    setIsDeleteDialogOpen(true)
    setIsMenuOpen(false)
  }, [])

  const handleMenuToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsMenuOpen(!isMenuOpen)
    },
    [isMenuOpen]
  )

  const handleClickOutside = useCallback(() => {
    if (isEditing) {
      handleSave()
    } else if (isMenuOpen) {
      setIsMenuOpen(false)
    }
  }, [isEditing, isMenuOpen, handleSave])

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
      if (isEditing || isMenuOpen) {
        e.stopPropagation()
      }
    },
    [isEditing, isMenuOpen]
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
    if (!isEditing && !isMenuOpen) {
      setOpenSidebarMobile(false)
      router.push(`/p/${project.id}`)
    }
  }, [isEditing, isMenuOpen, project.id, router, setOpenSidebarMobile])

  const handleMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const displayName = useMemo(
    () => project.name || "Untitled Project",
    [project.name]
  )

  const CloseComponent = ({ is }: { is: boolean }) => (
    <div
      className={cn(
        "absolute top-1.5 right-1.5 z-20 transition-opacity duration-200",
        isMobile
          ? "opacity-100"
          : !is
            ? "opacity-0 group-hover:opacity-100"
            : "opacity-100"
      )}
      onClick={handleMenuClick}
    >
      <button
        className={cn(
          "flex size-6.5 items-center justify-center rounded-md p-1 transition-colors duration-150",
          isMenuOpen ? "bg-secondary" : "hover:bg-secondary"
        )}
        onClick={handleMenuToggle}
      >
        {!is ? (
          <DotsThree size={16} className="text-primary" weight="bold" />
        ) : (
          <X size={14} className="text-primary" weight="bold" />
        )}
      </button>
    </div>
  )

  return (
    <div
      className="group border-border bg-card hover:bg-accent/5 relative h-28 rounded-lg border-2 transition-all duration-300 hover:shadow-md"
      onClick={handleContainerClick}
      ref={containerRef}
    >
      <div className="from-primary/5 absolute inset-0 rounded-lg bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="border-primary/20 absolute top-0 left-0 h-3 w-3 rounded-tl-lg border-t-2 border-l-2" />
      <div className="border-primary/20 absolute top-0 right-0 h-3 w-3 rounded-tr-lg border-t-2 border-r-2" />
      <div className="border-primary/20 absolute bottom-0 left-0 h-3 w-3 rounded-bl-lg border-b-2 border-l-2" />
      <div className="border-primary/20 absolute right-0 bottom-0 h-3 w-3 rounded-br-lg border-r-2 border-b-2" />

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
      ) : isMenuOpen ? (
        <>
          <div className="relative z-10 flex h-full flex-col items-center justify-center p-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleStartEditing()
              }}
              className="hover:bg-accent flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors"
            >
              <PencilSimple size={16} />
              Rename
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteClick()
              }}
              className="text-destructive hover:bg-destructive/10 flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors"
            >
              <Trash size={16} />
              Delete
            </button>
          </div>
          <CloseComponent is />
        </>
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

          <CloseComponent is={false} />
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
