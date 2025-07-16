"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useProjects } from "@/lib/store/project-store/provider"
import { Project } from "@/lib/store/project-store/types"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"

type DialogDeleteProjectProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  project: Project
}

export function DialogDeleteProject({ isOpen, setIsOpen, project }: DialogDeleteProjectProps) {
  const { deleteProject } = useProjects()
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const pathname = usePathname()


  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    await deleteProject(project.id)
    setIsDeleting(false)
    setIsOpen(false)

    if(pathname.includes(`/p/${project.id}`)) {
        router.push('/')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{project.name}"? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}