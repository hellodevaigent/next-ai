"use client"

import { useBreakpoint } from "@/lib/hooks/use-breakpoint"
import { useChats } from "@/lib/store/chat-store/chats/provider"
import { cn } from "@/lib/utils"
import { ListMagnifyingGlass } from "@phosphor-icons/react"
import { useState } from "react"
import { HistoryContent } from "./history-content"

type HistoryTriggerProps = {
  hasSidebar: boolean
  classNameTrigger?: string
  icon?: React.ReactNode
  label?: React.ReactNode | string
  hasPopover?: boolean
}

export function HistoryTrigger({
  hasSidebar,
  classNameTrigger,
  icon,
  label,
  hasPopover = true,
}: HistoryTriggerProps) {
  const isMobile = useBreakpoint(768)
  const [isOpen, setIsOpen] = useState(false)
  const { chats } = useChats()

  const defaultTrigger = (
    <button
      className={cn(
        "text-muted-foreground hover:text-foreground hover:bg-muted bg-background pointer-events-auto rounded-full border p-1.25 transition-colors",
        hasSidebar ? "hidden" : "block",
        classNameTrigger
      )}
      type="button"
      onClick={() => setIsOpen(true)}
      aria-label="Search"
      tabIndex={isMobile ? -1 : 0}
    >
      {icon || <ListMagnifyingGlass size={20} />}
      {label}
    </button>
  )

  return (
    <HistoryContent
      chatHistory={chats}
      trigger={defaultTrigger}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onOpenChange={setIsOpen}
      hasPopover={hasPopover}
    />
  )
}
