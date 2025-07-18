import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/prompt-kit/chat-container"
import { Loader } from "@/components/prompt-kit/loader"
import { ScrollButton } from "@/components/prompt-kit/scroll-button"
import { Message as MessageType } from "@ai-sdk/react"
import { useMemo, useRef } from "react"
import { Message } from "./message"

type ConversationProps = {
  messages: MessageType[]
  status?: "streaming" | "ready" | "submitted" | "error"
  onDelete: (id: string) => void
  onEdit: (id: string, newText: string) => Promise<void>
  onReload: () => void
  isSubmitting?: boolean
}

export function Conversation({
  messages,
  status = "ready",
  isSubmitting,
  onDelete,
  onEdit,
  onReload,
}: ConversationProps) {
  const initialMessageCount = useRef(messages.length)

  const lastUserMessageIndex = useMemo(() => {
    if (!messages) return -1
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        return i
      }
    }
    return -1
  }, [messages])

  if (!messages || messages.length === 0)
    return <div className="h-full w-full"></div>

  return (
    <div className="scrollbar-layout relative flex h-full w-full flex-col items-center overflow-x-hidden overflow-y-auto">
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 mx-auto flex w-full flex-col justify-center">
        <div className="h-app-header bg-background flex w-full" />
        <div className="h-app-header bg-background flex w-full mask-b-from-4% mask-b-to-100%" />
      </div>
      <ChatContainerRoot className="relative w-full">
        <ChatContainerContent
          className="flex w-full flex-col items-center pt-20 pb-4"
          style={{
            scrollbarGutter: "stable both-edges",
            scrollbarWidth: "none",
          }}
        >
          {messages?.map((message, index) => {
            const isLast =
              index === messages.length - 1 && status !== "submitted"
            const hasScrollAnchor =
              isLast && messages.length > initialMessageCount.current
            const showEditButton =
              message.role === "user" && index === lastUserMessageIndex

            return (
              <Message
                key={message.id}
                id={message.id}
                variant={message.role}
                attachments={message.experimental_attachments}
                isLast={isLast || showEditButton}
                onDelete={onDelete}
                onEdit={onEdit}
                onReload={onReload}
                hasScrollAnchor={hasScrollAnchor}
                parts={message.parts}
                status={status}
              >
                {message.content}
              </Message>
            )
          })}
          {isSubmitting && (
            <div className="group min-h-scroll-anchor flex w-full max-w-3xl flex-col items-start gap-2 px-6 pt-4 pb-2">
              <Loader />
            </div>
          )}
          {status === "submitted" &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && (
              <div className="group min-h-scroll-anchor flex w-full max-w-3xl flex-col items-start gap-2 px-6 pt-4 pb-2">
                <Loader />
              </div>
            )}
          <div className="absolute bottom-0 flex w-full max-w-3xl flex-1 items-end justify-end gap-4 px-6 pb-2">
            <ScrollButton className="absolute top-[-50px] right-[30px]" />
          </div>
        </ChatContainerContent>
      </ChatContainerRoot>
    </div>
  )
}
