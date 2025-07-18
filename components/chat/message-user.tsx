"use client"

import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogImage,
  MorphingDialogTrigger,
} from "@/components/motion-primitives/morphing-dialog"
import { Message as MessageContainer } from "@/components/prompt-kit/message"
import { Button } from "@/components/ui/button"
import { useBreakpoint } from "@/lib/hooks/use-breakpoint"
import useClickOutside from "@/lib/hooks/use-click-outside"
import { useUser } from "@/lib/store/user-store/provider"
import { cn } from "@/lib/utils"
import { Message as MessageType } from "@ai-sdk/react"
import * as Avatar from "@radix-ui/react-avatar"
import Image from "next/image"
import { useRef, useState } from "react"

const getTextFromDataUrl = (dataUrl: string) => {
  const base64 = dataUrl.split(",")[1]
  return base64
}

export type MessageUserProps = {
  hasScrollAnchor?: boolean
  attachments?: MessageType["experimental_attachments"]
  children: string
  copied: boolean
  isLast?: boolean
  copyToClipboard: () => void
  onEdit: (id: string, newText: string) => Promise<void>
  onReload: () => void
  onDelete: (id: string) => void
  id: string
  className?: string
}

export function MessageUser({
  hasScrollAnchor,
  attachments,
  children,
  copied,
  copyToClipboard,
  onEdit,
  onReload,
  id,
  className,
  isLast,
}: MessageUserProps) {
  const { user } = useUser()
  const isMobile = useBreakpoint(768)

  const [editInput, setEditInput] = useState(children)
  const [isEditing, setIsEditing] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)

  useClickOutside(actionsRef, () => {
    if (showActions) {
      setShowActions(false)
    }
  })

  const handleEditCancel = (): void => {
    setIsEditing(false)
    setEditInput(children)
  }

  const handleSave = async () => {
    if (!onEdit || !id) return

    setIsEditing(false)

    try {
      await onEdit(id, editInput)
    } catch (error) {
      console.error('Failed to save message:', error)
    }
  }

  const toggleActions = (e: React.MouseEvent) => {
    if (!isMobile) return
    e.stopPropagation()
    setShowActions(!showActions)
  }

  const getGridCols = (count: number) => {
    const mobile = Math.min(count, 3)
    const tablet = Math.min(count, 4)
    const desktop = Math.min(count, 5)

    return cn(
      `grid-cols-${mobile}`,
      `sm:grid-cols-${tablet}`,
      `md:grid-cols-${desktop}`
    )
  }

  return (
    <MessageContainer
      className={cn(
        "flex w-full max-w-3xl flex-col items-start gap-0.5 px-4 pb-4",
        hasScrollAnchor && "min-h-scroll-anchor",
        className
      )}
    >
      {(attachments ?? []).length > 0 && (
        <div
          className={cn(
            "bg-sidebar mb-2 grid gap-2 rounded-md border p-2",
            getGridCols(attachments!.length)
          )}
        >
          {attachments?.map((attachment, index) =>
            attachment.contentType?.startsWith("image") ? (
              <MorphingDialog
                key={`${attachment.name}-${index}`}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 18,
                  mass: 0.3,
                }}
              >
                <MorphingDialogTrigger className="cursor-pointer">
                  <Image
                    className="size-26 rounded-md duration-200 hover:scale-95"
                    key={attachment.name}
                    src={attachment.url}
                    alt={attachment.name || "Attachment"}
                    width={160}
                    height={120}
                  />
                </MorphingDialogTrigger>
                <MorphingDialogContainer>
                  <MorphingDialogContent className="relative rounded-lg">
                    <MorphingDialogImage
                      src={attachment.url}
                      alt={attachment.name || ""}
                      className="max-h-[90vh] max-w-[90vw] object-contain"
                    />
                  </MorphingDialogContent>
                  <MorphingDialogClose className="text-primary" />
                </MorphingDialogContainer>
              </MorphingDialog>
            ) : attachment.contentType?.startsWith("text") ? (
              <div className="text-primary mb-3 h-24 w-40 overflow-hidden rounded-md border p-2 text-xs">
                {getTextFromDataUrl(attachment.url)}
              </div>
            ) : null
          )}
        </div>
      )}

      <div
        className="group bg-accent relative gap-2 rounded-lg py-2 pr-4 pl-2 break-words transition-all"
        onClick={toggleActions}
      >
        <div className="flex gap-2">
          <div className="shrink-0">
            <Avatar.Root className="bg-blackA1 inline-flex size-7 items-center justify-center overflow-hidden rounded-full align-middle select-none">
              <Avatar.Image
                className="size-full rounded-[inherit] object-cover"
                src={user?.profile_image ?? undefined}
                alt={user?.display_name}
                referrerPolicy="no-referrer"
              />
              <Avatar.Fallback className="bg-background-primary bg-accent-foreground text-accent text-text flex size-full items-center justify-center rounded-full border text-[12px] leading-1 font-medium">
                {user?.display_name?.charAt(0) ?? "A"}
              </Avatar.Fallback>
            </Avatar.Root>
          </div>

          {isEditing ? (
            <div className="grid flex-1 grid-cols-1 gap-2 py-0.5 text-[0.9375rem] leading-6 font-medium">
              <textarea
                className="w-full resize-none bg-transparent break-words whitespace-pre-wrap outline-none"
                value={editInput}
                onChange={(e) => setEditInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSave()
                  }
                  if (e.key === "Escape") {
                    handleEditCancel()
                  }
                }}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={handleEditCancel}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div
              data-testid="user-message"
              className="grid grid-cols-1 gap-2 py-0.5 text-[0.9375rem] leading-6 font-medium"
              ref={contentRef}
            >
              <p className="break-words whitespace-pre-wrap">{children}</p>
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute right-2 bottom-0">
          <div
            ref={actionsRef}
            className={cn(
              "bg-accent border-border pointer-events-auto min-w-max translate-x-1 translate-y-4 rounded-md border p-0.5 shadow-sm backdrop-blur-sm transition",
              showActions
                ? "translate-x-0.5 opacity-100"
                : "opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100",
              isEditing ? "hidden" : ""
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-stretch justify-between gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  copyToClipboard()
                }}
                className="-mt-[2px] flex cursor-pointer flex-row items-center gap-1.5 rounded-md p-1.5 py-1 text-xs transition select-auto active:scale-95"
                aria-label="Copy text"
              >
                {copied ? "copied" : "Copy"}
              </button>
              {isLast && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-background-primary flex flex-row items-center gap-1.5 rounded-md p-1.5 py-0.5 text-xs transition select-auto active:scale-95"
                  aria-label="Edit"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </MessageContainer>
  )
}
