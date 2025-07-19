import { toast } from "@/components/ui/toast"
import { Message } from "@ai-sdk/react"
import { useCallback } from "react"
import { clearMessagesByTimestampForChat } from "../store/chat-store/messages/api"

type UseChatOperationsProps = {
  chatId: string | null
  messages: Message[]
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void
}

export function useChatOperations({
  chatId,
  messages,
  setMessages,
}: UseChatOperationsProps) {

  const deleteMessageState = async (messageId: string, targetChatId?: string) => {
    const chatToDelete = targetChatId || chatId
    if (!chatToDelete) return

    try {
      if (chatToDelete === chatId) {
        setMessages((prevMessages) => {
          const targetMessage = prevMessages.find(msg => msg.id === messageId)
          
          if (!targetMessage) {
            return prevMessages
          }
          
          const targetIndex = prevMessages.findIndex(msg => msg.id === messageId)
          const filteredMessages = prevMessages.slice(0, targetIndex)          
          return filteredMessages
        })
      }
    } catch (error) {
      console.error("❌ Delete failed:", error)
      throw error
    }
  }

  const deleteMessageDB = async (timestamp: string, targetChatId?: string) => {
    const chatToDelete = targetChatId || chatId
    if (!chatToDelete) return

    try {
      const isoTimestamp = new Date(timestamp).toISOString()
      
      await clearMessagesByTimestampForChat(chatToDelete, isoTimestamp)
    } catch (error) {
      console.error("Failed to delete messages from timestamp:", error)
      toast({ title: "Failed to delete messages", status: "error" })
      throw error
    }
  }

  const deleteMessages = useCallback(async (
    criteria: { messageId: string } | { timestamp: string },
    targetChatId?: string
  ) => {
    const chatToDelete = targetChatId || chatId
    if (!chatToDelete) return

    try {
      // Handle deletion by message ID
      if ('messageId' in criteria) {
        if (chatToDelete === chatId) {
          setMessages((prevMessages) => {
            const targetIndex = prevMessages.findIndex(msg => msg.id === criteria.messageId)
            if (targetIndex === -1) return prevMessages
            return prevMessages.slice(0, targetIndex)
          })
        }
      }
      
      // Handle deletion by timestamp
      else if ('timestamp' in criteria) {
        const isoTimestamp = new Date(criteria.timestamp).toISOString()
        await clearMessagesByTimestampForChat(chatToDelete, isoTimestamp)
        
        if (chatToDelete === chatId) {
          const targetTimestamp = new Date(isoTimestamp)
          setMessages((prevMessages) => {
            return prevMessages.filter(msg => {
              const messageTimestamp = new Date(msg.createdAt || 0)
              return messageTimestamp < targetTimestamp
            })
          })
        }
      }
      
    } catch (error) {
      console.error("❌ Delete failed:", error)
      toast({ title: "Failed to delete messages", status: "error" })
      throw error
    }
  }, [chatId, setMessages])

  const handleEdit = useCallback(
    (id: string, newText: string) => {
      setMessages(
        messages.map((message) =>
          message.id === id ? { ...message, content: newText } : message
        )
      )
    },
    [messages, setMessages]
  )

  return {
    deleteMessages,
    deleteMessageState,
    deleteMessageDB,
    handleEdit,
  }
}