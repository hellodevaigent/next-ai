import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChats } from "@/lib/chat-store/chats/provider"
import { useMessages } from "@/lib/chat-store/messages/provider"
import { useChatSession } from "@/lib/chat-store/session/provider"
import { Chats } from "@/lib/chat-store/types"
import {
  Check,
  MagnifyingGlass,
  PencilSimple,
  TrashSimple,
  X,
} from "@phosphor-icons/react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { formatDate, groupChatsByDate } from "./utils"

export function SimpleHistory() {
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const params = useParams<{ chatId: string }>()
  const router = useRouter()

  const { chats, updateTitle, deleteChat } = useChats()
  const { deleteMessages } = useMessages()
  const { chatId } = useChatSession()

  const handleEdit = useCallback((chat: Chats) => {
    setEditingId(chat.id)
    setEditTitle(chat.title || "")
  }, [])

  const handleSaveEdit = useCallback(
    async (id: string) => {
      setEditingId(null)
      await updateTitle(id, editTitle)
    },
    [editTitle, updateTitle]
  )

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditTitle("")
  }, [])

  const handleDelete = useCallback((id: string) => {
    setDeletingId(id)
  }, [])

  const handleConfirmDelete = useCallback(
    async (id: string) => {
      setDeletingId(null)
      if (id === chatId) {
        router.push("/")
      }
      await deleteMessages()
      await deleteChat(id, chatId!, () => router.push("/"))
    },
    [chatId, deleteMessages, deleteChat, router]
  )

  const handleCancelDelete = useCallback(() => {
    setDeletingId(null)
  }, [])

  // Memoize filtered chats to avoid recalculating on every render
  const filteredChat = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return query
      ? chats.filter((chat) =>
          (chat.title || "").toLowerCase().includes(query)
        )
      : chats
  }, [chats, searchQuery])

  // Group chats by time periods - memoized to avoid recalculation
  const groupedChats = useMemo(
    () => groupChatsByDate(chats, searchQuery),
    [chats, searchQuery]
  )

  // Render chat item
  const renderChatItem = useCallback(
    (chat: Chats) => (
      <div key={chat.id}>
        <div className="space-y-1.5">
          {editingId === chat.id ? (
            <div className="bg-accent flex items-center justify-between rounded-lg px-2 py-2.5">
              <form
                className="flex w-full items-center justify-between"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSaveEdit(chat.id)
                }}
              >
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="h-8 flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleSaveEdit(chat.id)
                    }
                  }}
                />
                <div className="ml-2 flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    type="submit"
                  >
                    <Check className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    type="button"
                    onClick={handleCancelEdit}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </form>
            </div>
          ) : deletingId === chat.id ? (
            <div className="bg-accent flex items-center justify-between rounded-lg px-2 py-2.5">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleConfirmDelete(chat.id)
                }}
                className="flex w-full items-center justify-between"
              >
                <div className="flex flex-1 items-center">
                  <span className="text-base font-normal">{chat.title}</span>
                  <input
                    type="text"
                    className="sr-only"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault()
                        handleCancelDelete()
                      } else if (e.key === "Enter") {
                        e.preventDefault()
                        handleConfirmDelete(chat.id)
                      }
                    }}
                  />
                </div>
                <div className="ml-2 flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive size-8"
                    type="submit"
                  >
                    <Check className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive size-8"
                    onClick={handleCancelDelete}
                    type="button"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="group flex items-center justify-between rounded-lg px-2 py-1.5">
              <Link
                href={`/c/${chat.id}`}
                key={chat.id}
                className="flex flex-1 flex-col items-start"
                prefetch
              >
                <span className="line-clamp-1 text-base font-normal">
                  {chat.title || "Untitled Chat"}
                </span>
                <span className="mr-2 text-xs font-normal text-gray-500">
                  {formatDate(chat?.created_at)}
                </span>
              </Link>
              <div className="flex items-center">
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground size-8"
                    onClick={(e) => {
                      e.preventDefault()
                      handleEdit(chat)
                    }}
                    type="button"
                  >
                    <PencilSimple className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive size-8"
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete(chat.id)
                    }}
                    type="button"
                  >
                    <TrashSimple className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    [
      params.chatId,
      editingId,
      deletingId,
      editTitle,
      handleSaveEdit,
      handleCancelEdit,
      handleConfirmDelete,
      handleCancelDelete,
      handleEdit,
      handleDelete,
    ]
  )

  return (
    <>
      <div className="border-b bg-sidebar p-4 pb-3 sticky top-0">
        <div className="relative">
          <Input
            placeholder="Search chats..."
            className="rounded-lg py-1.5 pl-8 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <MagnifyingGlass className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 transform text-gray-400" />
        </div>
      </div>

      <div className="flex-1">
        <div className="flex flex-col space-y-6 px-2 pt-4 pb-8">
          {filteredChat.length === 0 ? (
            <div className="text-muted-foreground py-4 text-center text-sm">
              No chat history found.
            </div>
          ) : searchQuery ? (
            // When searching, display a flat list without grouping
            <div className="space-y-2">
              {filteredChat.map((chat) => renderChatItem(chat))}
            </div>
          ) : (
            // When not searching, display grouped by date
            groupedChats?.map((group) => (
              <div key={group.name} className="space-y-0.5">
                <h3 className="text-muted-foreground pl-2 text-sm font-medium">
                  {group.name}
                </h3>
                <div className="space-y-2">
                  {group.chats.map((chat) => renderChatItem(chat))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}