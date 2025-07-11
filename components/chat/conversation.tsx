import { ChatContainerRoot } from "@/components/prompt-kit/chat-container"
import { Message as MessageType } from "@ai-sdk/react"
import { ConversationContent } from "./conversation-content"

export type ConversationProps = {
  messages: MessageType[]
  status?: "streaming" | "ready" | "submitted" | "error"
  onDelete: (id: string) => void
  onEdit: (id: string, newText: string) => void
  onReload: () => void
}

export function Conversation({
  messages,
  status = "ready",
  onDelete,
  onEdit,
  onReload,
}: ConversationProps) {
  if (!messages || messages.length === 0)
    return <div className="h-full w-full"></div>

  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden">
      {/* <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 mx-auto flex w-full flex-col justify-center">
        <div className="h-app-header bg-background flex w-full lg:hidden lg:h-0" />
        <div className="h-app-header bg-background flex w-full mask-b-from-4% mask-b-to-100% lg:hidden" />
      </div> */}
      <ChatContainerRoot className="relative w-full">
        <ConversationContent
          messages={messages}
          status={status}
          onDelete={onDelete}
          onEdit={onEdit}
          onReload={onReload}
        />
      </ChatContainerRoot>
    </div>
  )
}
