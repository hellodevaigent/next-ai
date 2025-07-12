"use client"

import {
  ChatContainerContent,
  useScrollContext,
} from "@/components/prompt-kit/chat-container"
import { ScrollButton } from "@/components/prompt-kit/scroll-button"
import { useUserPreferences } from "@/lib/user-preference-store/provider"
import { useEffect, useRef } from "react"
import { Message } from "../chat/message"
import { MultiConversationProps } from "./multi-conversation"
import { ResponsesRow } from "./responses-row"
import { cn } from "@/lib/utils"
import { useContainerDistance } from "../chat/use-distance"

export function MultiConversationContent({
  messageGroups,
  groupResponses,
}: MultiConversationProps) {
  const { handleMessageCountChange } = useScrollContext()
  const { preferences } = useUserPreferences()
  const hasSidebar = preferences.layout === "sidebar"

  const { containerRef, isOverflowing, checkContainerOverflow } = useContainerDistance()

  const previousGroupsLengthRef = useRef(messageGroups.length)

  useEffect(() => {
    const currentLength = messageGroups.length
    const previousLength = previousGroupsLengthRef.current

    if (currentLength > previousLength) {
      handleMessageCountChange(currentLength)
    }

    previousGroupsLengthRef.current = currentLength
  }, [messageGroups, handleMessageCountChange])

  useEffect(() => {
    const timer = setTimeout(() => {
      checkContainerOverflow()
    }, 100)

    return () => clearTimeout(timer)
  }, [messageGroups, checkContainerOverflow])

  return (
    <ChatContainerContent
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={cn(
        "flex w-full flex-col items-center",
        hasSidebar ? "pt-22 md:pt-12" : "pt-22"
      )}
      style={{
        scrollbarGutter: "stable both-edges",
        scrollbarWidth: "none",
      }}
    >
      {messageGroups.map((group, groupIndex) => {
        const isLastGroup = groupIndex === messageGroups.length - 1

        return (
          <div
            key={group.userMessage.id || groupIndex}
            className={`mx-auto w-full max-w-3xl space-y-3 ${isLastGroup ? "pb-8" : ""}`}
          >
            <Message
              id={group.userMessage.id}
              variant="user"
              attachments={group.userMessage.experimental_attachments}
              onEdit={() => {}}
              onReload={() => {}}
              parts={
                group.userMessage.parts || [
                  { type: "text", text: group.userMessage.content },
                ]
              }
              status="ready"
            >
              {group.userMessage.content}
            </Message>
            <div className="px-6">
              <ResponsesRow
                group={group}
                responses={
                  (groupResponses && groupResponses[groupIndex]) ||
                  group.responses
                }
              />
            </div>
          </div>
        )
      })}

      {isOverflowing && (
        <div className="fixed bottom-[140px] flex w-full max-w-3xl flex-1 items-end justify-end gap-4 px-4 pb-2 md:px-6">
          <ScrollButton className="absolute top-[-50px] right-[30px]" />
        </div>
      )}
    </ChatContainerContent>
  )
}
