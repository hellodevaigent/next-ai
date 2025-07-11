import { ChatContainerRoot } from "@/components/prompt-kit/chat-container"
import { Message as MessageType } from "@ai-sdk/react"
import { ConversationContent } from "./conversation-content"

export type ConversationProps = {
  messages: MessageType[]
  status?: "streaming" | "ready" | "submitted" | "error"
  loading?: boolean
  onEdit: (id: string, newText: string) => void
  onReload: () => void
}

export function Conversation({
  messages,
  status = "ready",
  loading,
  onEdit,
  onReload,
}: ConversationProps) {
  if (!messages || messages.length === 0)
    return <div className="h-full w-full"></div>

  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden">
      <ChatContainerRoot className="relative w-full">
        <ConversationContent
          messages={messages}
          status={status}
          loading={loading}
          onEdit={onEdit}
          onReload={onReload}
        />
      </ChatContainerRoot>
    </div>
  )
}
