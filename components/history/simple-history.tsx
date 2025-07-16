import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useChats } from "@/lib/store/chat-store/chats/provider"
import { useMessages } from "@/lib/store/chat-store/messages/provider"
import { useChatSession } from "@/lib/store/chat-store/session/provider"
import { Chats } from "@/lib/store/chat-store/types"
import {
  Check,
  MagnifyingGlass,
  PencilSimple,
  TrashSimple,
  X,
} from "@phosphor-icons/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useState, memo } from "react"
import { formatDate, groupChatsByDate } from "./utils"
import { useSidebar } from "../ui/sidebar"

// Types
interface ChatItemProps {
  chat: Chats
  editingId: string | null
  deletingId: string | null
  editTitle: string
  handleEdit: (chat: Chats) => void
  handleDelete: (id: string) => void
  handleSaveEdit: (id: string) => Promise<void>
  handleCancelEdit: () => void
  handleConfirmDelete: (id: string) => Promise<void>
  handleCancelDelete: () => void
  setEditTitle: (title: string) => void
  sidebarClose: (open: boolean) => void
}

interface ChatGroup {
  name: string
  chats: Chats[]
}

// Memoize ChatItem component
const ChatItem = memo<ChatItemProps>(({ 
  chat, 
  editingId, 
  deletingId, 
  editTitle, 
  handleEdit, 
  handleDelete, 
  handleSaveEdit, 
  handleCancelEdit, 
  handleConfirmDelete, 
  handleCancelDelete,
  setEditTitle,
  sidebarClose
}) => {
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    handleSaveEdit(chat.id)
  }, [chat.id, handleSaveEdit])

  const handleDeleteFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    handleConfirmDelete(chat.id)
  }, [chat.id, handleConfirmDelete])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditTitle(e.target.value)
  }, [setEditTitle])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSaveEdit(chat.id)
    }
  }, [chat.id, handleSaveEdit])

  const handleDeleteKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault()
      handleCancelDelete()
    } else if (e.key === "Enter") {
      e.preventDefault()
      handleConfirmDelete(chat.id)
    }
  }, [chat.id, handleCancelDelete, handleConfirmDelete])

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    handleEdit(chat)
  }, [chat, handleEdit])

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    handleDelete(chat.id)
  }, [chat.id, handleDelete])

  if (editingId === chat.id) {
    return (
      <div className="bg-accent flex items-center justify-between rounded-lg px-2 py-2.5">
        <form
          className="flex w-full items-center justify-between"
          onSubmit={handleFormSubmit}
        >
          <Input
            value={editTitle}
            onChange={handleInputChange}
            className="h-8 flex-1"
            autoFocus
            onKeyDown={handleKeyDown}
          />
          <div className="ml-2 flex gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8" type="submit">
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
    )
  }
  
  if (deletingId === chat.id) {
    return (
      <div className="bg-accent flex items-center justify-between rounded-lg px-2 py-2.5">
        <form
          onSubmit={handleDeleteFormSubmit}
          className="flex w-full items-center justify-between"
        >
          <div className="flex flex-1 items-center">
            <span className="text-base font-normal">{chat.title}</span>
            <input
              type="text"
              className="sr-only"
              autoFocus
              onKeyDown={handleDeleteKeyDown}
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
    )
  }
  
  return (
    <div className="group flex items-center justify-between rounded-lg px-2 py-1.5">
      <Link
        href={`/c/${chat.id}`}
        className="flex flex-1 flex-col items-start"
        prefetch={false}
        onClick={() => sidebarClose(false)}
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
            onClick={handleEditClick}
            type="button"
          >
            <PencilSimple className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-destructive size-8"
            onClick={handleDeleteClick}
            type="button"
          >
            <TrashSimple className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
})

ChatItem.displayName = "ChatItem"

// Empty state component
const EmptyState = memo(() => (
  <div className="text-muted-foreground py-4 text-center text-sm">
    No chat history found.
  </div>
))

EmptyState.displayName = "EmptyState"

// Search input component
const SearchInput = memo<{
  value: string
  onChange: (value: string) => void
}>(({ value, onChange }) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }, [onChange])

  return (
    <div className="border-b bg-sidebar p-4 pb-3 sticky top-0">
      <div className="relative">
        <Input
          placeholder="Search chats..."
          className="rounded-lg py-1.5 pl-8 text-sm"
          value={value}
          onChange={handleChange}
        />
        <MagnifyingGlass className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 transform text-gray-400" />
      </div>
    </div>
  )
})

SearchInput.displayName = "SearchInput"

export function SimpleHistory() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState<string>("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  
  const { setOpenMobile } = useSidebar()
  const { chats, updateTitle, deleteChat } = useChats()
  const { deleteMessages } = useMessages()
  const { chatId } = useChatSession()

  // Memoize callbacks
  const handleEdit = useCallback((chat: Chats): void => {
    setEditingId(chat.id)
    setEditTitle(chat.title || "")
  }, [])

  const handleSaveEdit = useCallback(
    async (id: string): Promise<void> => {
      setEditingId(null)
      await updateTitle(id, editTitle)
    },
    [editTitle, updateTitle]
  )

  const handleCancelEdit = useCallback((): void => {
    setEditingId(null)
    setEditTitle("")
  }, [])

  const handleDelete = useCallback((id: string): void => {
    setDeletingId(id)
  }, [])

  const handleConfirmDelete = useCallback(
    async (id: string): Promise<void> => {
      setDeletingId(null)
      if (id === chatId) {
        router.push("/")
      }
      await deleteMessages()
      await deleteChat(id, chatId!, () => router.push("/"))
    },
    [chatId, deleteMessages, deleteChat, router]
  )

  const handleCancelDelete = useCallback((): void => {
    setDeletingId(null)
  }, [])

  // Memoize filtered chats
  const filteredChat = useMemo((): Chats[] => {
    if (!searchQuery) return chats
    
    const query = searchQuery.toLowerCase()
    return chats.filter((chat) =>
      (chat.title || "").toLowerCase().includes(query)
    )
  }, [chats, searchQuery])

  // Memoize grouped chats
  const groupedChats = useMemo((): ChatGroup[] => {
    return groupChatsByDate(filteredChat, searchQuery) ?? []
  }, [filteredChat, searchQuery])

  // Limit initial render to improve performance
  const limitedChats = useMemo((): Chats[] => {
    return searchQuery ? filteredChat : filteredChat.slice(0, 50)
  }, [filteredChat, searchQuery])

  const renderChatItem = useCallback((chat: Chats) => (
    <ChatItem
      key={chat.id}
      chat={chat}
      editingId={editingId}
      deletingId={deletingId}
      editTitle={editTitle}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      handleSaveEdit={handleSaveEdit}
      handleCancelEdit={handleCancelEdit}
      handleConfirmDelete={handleConfirmDelete}
      handleCancelDelete={handleCancelDelete}
      setEditTitle={setEditTitle}
      sidebarClose={setOpenMobile}
    />
  ), [
    editingId,
    deletingId,
    editTitle,
    handleEdit,
    handleDelete,
    handleSaveEdit,
    handleCancelEdit,
    handleConfirmDelete,
    handleCancelDelete,
  ])

  return (
    <>
      <SearchInput value={searchQuery} onChange={setSearchQuery} />

      <div className="flex-1">
        <div className="flex flex-col space-y-6 px-2 pt-4 pb-8">
          {limitedChats.length === 0 ? (
            <EmptyState />
          ) : searchQuery ? (
            <div className="space-y-2">
              {limitedChats.map(renderChatItem)}
            </div>
          ) : (
            groupedChats?.map((group) => (
              <div key={group.name} className="space-y-0.5">
                <h3 className="text-muted-foreground pl-2 text-sm font-medium">
                  {group.name}
                </h3>
                <div className="space-y-2">
                  {group.chats.slice(0, 20).map(renderChatItem)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}