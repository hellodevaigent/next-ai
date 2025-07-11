"use client"

import { useSidebar } from "@/components/ui/sidebar"
import { FolderPlusIcon } from "@phosphor-icons/react"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { DialogCreateProject } from "./dialog-create-project"
import { SidebarProjectItem } from "./sidebar-project-item"

type Project = {
  id: string
  name: string
  user_id: string
  created_at: string
}

export function SidebarProject() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { open } = useSidebar()

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
        className="hover:bg-accent/80 hover:text-foreground text-primary group/new-chat relative inline-flex w-full items-center rounded-md bg-transparent p-2 text-sm text-nowrap transition-colors cursor-pointer"
        type="button"
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="mr-2">
          <FolderPlusIcon size={18} />
        </div>
        <div
          className={`flex items-center gap-2 duration-350 ${open ? "opacity-100" : "md:opacity-0"}`}
        >
          New project
        </div>
      </button>

      {isLoading ? null : (
        <div className="space-y-1">
          {projects.map((project) => (
            <SidebarProjectItem key={project.id} project={project} />
          ))}
        </div>
      )}

      <DialogCreateProject isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </>
  )
}
