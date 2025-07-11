import {
  ChatContainerContent,
  useScrollContext,
} from "@/components/prompt-kit/chat-container"
import { Loader } from "@/components/prompt-kit/loader"
import { ScrollButton } from "@/components/prompt-kit/scroll-button"
import { useUserPreferences } from "@/lib/user-preference-store/provider"
import { useEffect, useRef } from "react"
import { ConversationProps } from "./conversation"
import { Message } from "./message"
import { useContainerDistance } from "./use-distance"

export function ConversationContent({
  messages,
  status = "ready",
  onDelete,
  onEdit,
  onReload,
}: ConversationProps) {
  const { preferences } = useUserPreferences()
  const hasSidebar = preferences.layout === "sidebar"
  
  const { containerRef, isOverflowing, checkContainerOverflow } = useContainerDistance()
  
  const initialMessageCount = useRef(messages.length)

  useEffect(() => {
    const timer = setTimeout(() => {
      checkContainerOverflow()
    }, 100)

    return () => clearTimeout(timer)
  }, [messages, checkContainerOverflow])

  return (
    <ChatContainerContent
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={`flex w-full flex-col items-center pb-4 ${hasSidebar ? "pt-22 md:pt-12" : "pt-22"}`}
      style={{
        scrollbarGutter: "stable both-edges",
        scrollbarWidth: "none",
      }}
    >
      {messages?.map((message, index) => {
        const isLast = index === messages.length - 1 && status !== "submitted"
        const hasScrollAnchor =
          isLast && messages.length > initialMessageCount.current

        return (
          <Message
            key={message.id}
            id={message.id}
            variant={message.role}
            attachments={message.experimental_attachments}
            isLast={isLast}
            onDelete={onDelete}
            onEdit={onEdit}
            onReload={onReload}
            hasScrollAnchor={hasScrollAnchor}
            parts={message.parts}
            status={status}
            showHoverState={false}
          >
            {message.content}
          </Message>
        )
      })}
      {status === "submitted" &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && (
          <div className="group min-h-scroll-anchor flex w-full max-w-3xl flex-col items-start gap-2 px-4 pb-2 md:px-6">
            <Loader />
          </div>
        )}
      {isOverflowing && (
        <div className="fixed bottom-[140px] flex w-full max-w-3xl flex-1 items-end justify-end gap-4 px-4 pb-2 md:px-6">
          <ScrollButton className="absolute top-[-50px] right-[30px]" />
        </div>
      )}
    </ChatContainerContent>
  )
}
