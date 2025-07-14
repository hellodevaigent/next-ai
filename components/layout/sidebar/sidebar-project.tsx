"use client"

import { FolderPlusIcon } from "@phosphor-icons/react"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { DialogCreateProject } from "./dialog-create-project"
import { SidebarProjectItem } from "./sidebar-project-item"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useTitle } from "@/lib/hooks/use-title"

type Project = {
  id: string
  name: string
  user_id: string
  created_at: string
}

export function SidebarProject() {
  useTitle(null, "Projects")
  const { open } = useSidebar()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
    <>
      <button
        className="hover:bg-accent/80 hover:text-foreground text-primary group/new-chat relative inline-flex w-full items-center rounded-md bg-transparent px-2 py-2 text-sm transition-colors"
        type="button"
        onClick={() => setIsDialogOpen(true)}
      >
        <span className="mr-2">
          <FolderPlusIcon size={18} />
        </span>
        <span
          className={cn(
            "lex items-center gap-2 duration-350 text-nowrap",
            open ? "opacity-100" : "md:opacity-0"
          )}
        >
          New project
        </span>
      </button>

      {isLoading
        ? null
        : projects.map((project) => (
            <SidebarProjectItem key={project.id} project={project} />
          ))}

      <DialogCreateProject isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </>
  )
}
