import { ChatContainerRoot } from "@/components/prompt-kit/chat-container"
import { Message as MessageType } from "@ai-sdk/react"
import { ConversationContent } from "./conversation-content"

export type ConversationProps = {
  messages: MessageType[]
  status?: "streaming" | "ready" | "submitted" | "error"
  onEdit: (id: string, newText: string) => void
  onReload: () => void
  isLoading?: boolean
}

export function Conversation({
  messages,
  status = "ready",
  onEdit,
  onReload,
  isLoading
}: ConversationProps) {
  if (!messages || messages.length === 0)
    return <div className="h-full w-full"></div>

  return (
    <ChatContainerRoot>
      <ConversationContent
        messages={messages}
        status={status}
        onEdit={onEdit}
        onReload={onReload}
        isLoading={isLoading}
      />
    </ChatContainerRoot>
  )
}
