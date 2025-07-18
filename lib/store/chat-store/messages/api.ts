import { isSupabaseEnabled } from "@/lib/supabase/config"
import type { Message as MessageAISDK } from "ai"
import { readFromIndexedDB, writeToIndexedDB } from "../../persist"
import { fetchClient } from "@/lib/fetch"
import { API_ROUTE_CONVERSATION } from "@/lib/routes"

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

  return await response.json()
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
  messageId: string,
) {
  if (!isSupabaseEnabled) return

  const response = await fetchClient(`${API_ROUTE_CONVERSATION}/${chatId}?messageId=${messageId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete messages from anchor")
  }
}

// LocalIndxedDB
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
