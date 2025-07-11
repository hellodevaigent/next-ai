import {
  ChatContainerContent,
  useScrollContext,
} from "@/components/prompt-kit/chat-container"
import { Loader } from "@/components/prompt-kit/loader"
import { ScrollButton } from "@/components/prompt-kit/scroll-button"
import { useUserPreferences } from "@/lib/user-preference-store/provider"
import { useEffect, useRef, useState } from "react"
import { Message } from "./message"
import { ConversationProps } from "./conversation"
import { useContainerDistance } from "./use-distance"

export function ConversationContent({
  messages,
  status = "ready",
  onDelete,
  onEdit,
  onReload,
}: ConversationProps) {
  const { handleMessageCountChange } = useScrollContext()
  const { preferences } = useUserPreferences()
  const hasSidebar = preferences.layout === "sidebar"

  const initialMessageCount = useRef(messages.length)
  const previousMessagesLengthRef = useRef(messages.length)
  const [shouldEnableScrollAnchor, setShouldEnableScrollAnchor] = useState(false)

  const { containerRef, isOverflowing, checkContainerOverflow } = useContainerDistance()

  useEffect(() => {
    const currentLength = messages.length
    const previousLength = previousMessagesLengthRef.current

    if (currentLength > previousLength) {
      const newMessage = messages[currentLength - 1]

      if (newMessage && newMessage.role === "user") {
        // Reset scroll anchor state ketika ada pesan baru
        setShouldEnableScrollAnchor(false)
        handleMessageCountChange(currentLength)
      }
    }

    previousMessagesLengthRef.current = currentLength
  }, [messages, handleMessageCountChange])

  useEffect(() => {
    const timer = setTimeout(() => {
      checkContainerOverflow()
      // Update scroll anchor state setelah container overflow di-check
      setShouldEnableScrollAnchor(isOverflowing)
    }, 100)

    return () => clearTimeout(timer)
  }, [messages, checkContainerOverflow, isOverflowing])

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
        // Gunakan state yang lebih reliable untuk scroll anchor
        const hasScrollAnchor = isLast && 
          messages.length > initialMessageCount.current && 
          shouldEnableScrollAnchor

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