"use client"

import { ChatContainerRoot } from "@/components/prompt-kit/chat-container"
import { Message as MessageType } from "@ai-sdk/react"
import { useEffect, useState } from "react"
import { MultiConversationContent } from "./multi-conversation-content"

export type GroupedMessage = {
  userMessage: MessageType
  responses: {
    model: string
    message: MessageType
    isLoading?: boolean
    provider: string
  }[]
  onDelete: (model: string, id: string) => void
  onEdit: (model: string, id: string, newText: string) => void
  onReload: (model: string) => void
}

export type MultiConversationProps = {
  messageGroups: GroupedMessage[]
  groupResponses?: Record<number, GroupedMessage["responses"]>
}

export function MultiModelConversation({
  messageGroups,
}: MultiConversationProps) {
  const [groupResponses, setGroupResponses] = useState<
    Record<number, GroupedMessage["responses"]>
  >(() => {
    const initial: Record<number, GroupedMessage["responses"]> = {}
    messageGroups.forEach((group, index) => {
      initial[index] = [...group.responses]
    })
    return initial
  })

  useEffect(() => {
    const updated: Record<number, GroupedMessage["responses"]> = {}
    messageGroups.forEach((group, index) => {
      updated[index] = [...group.responses]
    })
    setGroupResponses(updated)
  }, [messageGroups])

  if (!messageGroups || messageGroups.length === 0) {
    return <div className="h-full w-full"></div>
  }

  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden">
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          will-change: scroll-position;
          transform: translateZ(0);
        }
        .smooth-scroll {
          scroll-behavior: smooth;
        }
        .scrollbar-hide.active\\:cursor-grabbing:active {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
      `}</style>

      <ChatContainerRoot className="relative w-full">
        <MultiConversationContent
          messageGroups={messageGroups}
          groupResponses={groupResponses}
        />
      </ChatContainerRoot>
    </div>
  )
}
