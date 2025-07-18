import type { Chat, Chats } from "@/lib/store/chat-store/types"
import { readFromIndexedDB, writeToIndexedDB } from "@/lib/store/persist"
import { isSupabaseEnabled } from "@/lib/supabase/config"
import { MODEL_DEFAULT } from "../../../config"
import { fetchClient } from "../../../fetch"
import { API_ROUTE_CHATS, API_ROUTE_UPDATE_CHAT_MODEL, API_ROUTE_CREATE_CHAT } from "../../../routes"

export async function getChatsForUserInDb(): Promise<Chats[]> {
  const response = await fetchClient(API_ROUTE_CHATS)
  const data = await response.json()

  return data
}

export async function updateChatTitleInDb(id: string, title: string) {
  const response = await fetchClient(API_ROUTE_CHATS, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, title }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update chat")
  }
}

export async function deleteChatInDb(id: string) {
  const response = await fetchClient(API_ROUTE_CHATS, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to delete chat")
  }
}

export async function createChatInDb(
  title: string,
  model: string,
  systemPrompt: string
): Promise<string | null> {
  const response = await fetchClient(API_ROUTE_CHATS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, model, systemPrompt }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create chat")
  }

  const data = await response.json()
  return data.id
}

export async function fetchAndCacheChats(): Promise<Chats[]> {
  if (!isSupabaseEnabled) {
    return await getCachedChats()
  }

  const data = await getChatsForUserInDb()

  if (data.length > 0) {
    await writeToIndexedDB("chats", data)
  }

  return data
}

export async function getCachedChats(): Promise<Chats[]> {
  const all = await readFromIndexedDB<Chats>("chats")
  return (all as Chats[]).sort(
    (a, b) => +new Date(b.created_at || "") - +new Date(a.created_at || "")
  )
}

export async function updateChatTitle(
  id: string,
  title: string
): Promise<void> {
  await updateChatTitleInDb(id, title)
  const all = await getCachedChats()
  const updated = (all as Chats[]).map((c) =>
    c.id === id ? { ...c, title } : c
  )
  await writeToIndexedDB("chats", updated)
}

export async function deleteChat(id: string): Promise<void> {
  await deleteChatInDb(id)
  const all = await getCachedChats()
  await writeToIndexedDB(
    "chats",
    (all as Chats[]).filter((c) => c.id !== id)
  )
}

export async function getChat(chatId: string): Promise<Chat | null> {
  const all = await readFromIndexedDB<Chat>("chats")
  return (all as Chat[]).find((c) => c.id === chatId) || null
}

export async function createChat(
  userId: string,
  title: string,
  model: string,
  systemPrompt: string
): Promise<string> {
  const id = await createChatInDb(title, model, systemPrompt)
  const finalId = id ?? crypto.randomUUID()

  await writeToIndexedDB("chats", {
    id: finalId,
    title,
    model,
    user_id: userId,
    system_prompt: systemPrompt,
    created_at: new Date().toISOString(),
  })

  return finalId
}

export async function updateChatModel(chatId: string, model: string) {
  try {
    const res = await fetchClient(API_ROUTE_UPDATE_CHAT_MODEL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, model }),
    })
    const responseData = await res.json()

    if (!res.ok) {
      throw new Error(
        responseData.error ||
          `Failed to update chat model: ${res.status} ${res.statusText}`
      )
    }

    const all = await getCachedChats()
    const updated = (all as Chats[]).map((c) =>
      c.id === chatId ? { ...c, model } : c
    )
    await writeToIndexedDB("chats", updated)

    return responseData
  } catch (error) {
    console.error("Error updating chat model:", error)
    throw error
  }
}

export async function createNewChat(
  userId: string,
  title?: string,
  model?: string,
  isAuthenticated?: boolean,
  projectId?: string
): Promise<Chats> {
  try {
    const payload: {
      userId: string
      title: string
      model: string
      isAuthenticated?: boolean
      projectId?: string
    } = {
      userId,
      title: title || "New Chat",
      model: model || MODEL_DEFAULT,
      isAuthenticated,
    }

    if (projectId) {
      payload.projectId = projectId
    }

    const res = await fetchClient(API_ROUTE_CREATE_CHAT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const responseData = await res.json()

    if (!res.ok || !responseData.chat) {
      throw new Error(responseData.error || "Failed to create chat")
    }

    const chat: Chats = {
      id: responseData.chat.id,
      title: responseData.chat.title,
      created_at: responseData.chat.created_at,
      model: responseData.chat.model,
      user_id: responseData.chat.user_id,
      public: responseData.chat.public,
      updated_at: responseData.chat.updated_at,
      project_id: responseData.chat.project_id || null,
    }

    await writeToIndexedDB("chats", chat)
    return chat
  } catch (error) {
    console.error("Error creating new chat:", error)
    throw error
  }
}
