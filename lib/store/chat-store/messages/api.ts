import { fetchClient } from "@/lib/fetch"
import { API_ROUTE_CONVERSATION } from "@/lib/routes"
import { isSupabaseEnabled } from "@/lib/supabase/config"
import type { Message as MessageAISDK } from "ai"
import { readFromIndexedDB, writeToIndexedDB } from "../../persist"

type ChatMessageEntry = {
  id: string
  messages: MessageAISDK[]
}

export async function getMessagesFromDb(
  chatId: string
): Promise<MessageAISDK[]> {
  // fallback to local cache only
  if (!isSupabaseEnabled) {
    const cached = await getCachedMessages(chatId)
    return cached
  }

  const response = await fetchClient(`${API_ROUTE_CONVERSATION}/${chatId}`)

  if (!response.ok) {
    throw new Error("Failed to fetch messages")
  }

  const data = await response.json()

  return data
}

async function insertMessageToDb(chatId: string, message: MessageAISDK) {
  if (!isSupabaseEnabled) return

  const response = await fetchClient(`${API_ROUTE_CONVERSATION}/${chatId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  })

  if (!response.ok) {
    throw new Error("Failed to insert message")
  }
}

async function insertMessagesToDb(chatId: string, messages: MessageAISDK[]) {
  if (!isSupabaseEnabled) return

  const response = await fetchClient(`${API_ROUTE_CONVERSATION}/${chatId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  })

  if (!response.ok) {
    throw new Error("Failed to insert messages")
  }
}

async function deleteMessagesFromDb(chatId: string) {
  if (!isSupabaseEnabled) return

  const response = await fetchClient(`${API_ROUTE_CONVERSATION}/${chatId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete messages")
  }
}

export async function deleteMessagesFromDbByMessageId(
  chatId: string,
  messageId: string
) {
  if (!isSupabaseEnabled) return

  try {
    const response = await fetchClient(
      `${API_ROUTE_CONVERSATION}/${chatId}?messageId=${messageId}`,
      {
        method: "DELETE",
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Delete messages API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to delete messages from anchor:", error)
    throw error
  }
}

export async function deleteMessagesFromDbByTimestamp(
  chatId: string,
  timestamp: string
) {
  if (!isSupabaseEnabled) return

  try {
    // Ensure timestamp is in ISO format
    const isoTimestamp = new Date(timestamp).toISOString()
    
    const response = await fetchClient(
      `${API_ROUTE_CONVERSATION}/${chatId}?timestamp=${encodeURIComponent(isoTimestamp)}`,
      {
        method: "DELETE",
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Delete messages API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to delete messages from timestamp:", error)
    throw error
  }
}

export async function getCachedMessages(
  chatId: string
): Promise<MessageAISDK[]> {
  const entry = await readFromIndexedDB<ChatMessageEntry>("messages", chatId)

  if (!entry || Array.isArray(entry)) return []

  return (entry.messages || []).sort(
    (a, b) => +new Date(a.createdAt || 0) - +new Date(b.createdAt || 0)
  )
}

export async function cacheMessages(
  chatId: string,
  messages: MessageAISDK[]
): Promise<void> {
  await writeToIndexedDB("messages", { id: chatId, messages })
}

export async function addMessage(
  chatId: string,
  message: MessageAISDK
): Promise<void> {
  await insertMessageToDb(chatId, message)
  const current = await getCachedMessages(chatId)
  const updated = [...current, message]

  await writeToIndexedDB("messages", { id: chatId, messages: updated })
}

export async function setMessages(
  chatId: string,
  messages: MessageAISDK[]
): Promise<void> {
  await insertMessagesToDb(chatId, messages)
  await writeToIndexedDB("messages", { id: chatId, messages })
}

export async function clearMessagesCache(chatId: string): Promise<void> {
  await writeToIndexedDB("messages", { id: chatId, messages: [] })
}

export async function clearMessagesForChat(chatId: string): Promise<void> {
  await deleteMessagesFromDb(chatId)
  await clearMessagesCache(chatId)
}

export async function clearMessagesByTimestampForChat(
  chatId: string,
  timestamp: string
): Promise<MessageAISDK[]> {  
  try {
    // Delete from database (Supabase) if enabled
    if (isSupabaseEnabled) {
      await deleteMessagesFromDbByTimestamp(chatId, timestamp)
    }
    
    // Get current cached messages from IndexedDB
    const currentMessages = await getCachedMessages(chatId)
    
    // Parse the provided timestamp
    const anchorTimestamp = new Date(timestamp)
    
    // Filter out messages with timestamp >= anchor timestamp
    const updatedMessages = currentMessages.filter(msg => {
      const messageTimestamp = new Date(msg.createdAt || 0)
      const shouldKeep = messageTimestamp < anchorTimestamp
      return shouldKeep
    })
        
    // Update IndexedDB with the filtered messages
    await writeToIndexedDB("messages", { id: chatId, messages: updatedMessages })
    
    // Return the updated messages so the UI can sync
    return updatedMessages
  } catch (error) {
    console.error("❌ Error in clearMessagesByTimestampForChat:", error)
    
    if (isSupabaseEnabled && error instanceof Error) {
      throw new Error(`Failed to delete messages: ${error.message}`)
    }
    
    if (!isSupabaseEnabled) {
      // Still return the filtered messages for cache-only mode
      const currentMessages = await getCachedMessages(chatId)
      const anchorTimestamp = new Date(timestamp)
      const updatedMessages = currentMessages.filter(msg => {
        const messageTimestamp = new Date(msg.createdAt || 0)
        return messageTimestamp < anchorTimestamp
      })
      await writeToIndexedDB("messages", { id: chatId, messages: updatedMessages })
      return updatedMessages
    }
    
    throw error
  }
}