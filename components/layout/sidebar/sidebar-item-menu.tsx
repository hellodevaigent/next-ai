import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useBreakpoint } from "@/lib/hooks/use-breakpoint"
import { useChats } from "@/lib/store/chat-store/chats/provider"
import { useChatSession } from "@/lib/store/chat-store/session/provider"
import { Chat } from "@/lib/store/chat-store/types"
import { cn } from "@/lib/utils"
import { DotsThree, PencilSimple, Star, Trash } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { DialogDeleteChat } from "../../chat/dialog-delete-chat"
import { useMessages } from "@/lib/store/chat-store/messages/provider"

type SidebarItemMenuProps = {
  chat: Chat
  onStartEditing: () => void
  onMenuOpenChange?: (open: boolean) => void
  onFavoriteToggle?: () => void
}

export function SidebarItemMenu({
  chat,
  onStartEditing,
  onMenuOpenChange,
  onFavoriteToggle,
}: SidebarItemMenuProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const { deleteMessages } = useMessages()
  const { deleteChat, favorites, toggleFavorite } = useChats()
  const { chatId } = useChatSession()
  const isMobile = useBreakpoint(768)
  const isFavorite = favorites.includes(chat.id)

  const handleConfirmDelete = async () => {
    const isCurrentChat = chat.id === chatId
    
    if (isCurrentChat) {
      router.push("/")
      
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    await deleteMessages(chat.id)
    await deleteChat(chat.id, chatId!, () => {
      if (!isCurrentChat) {
        router.push("/")
      }
    })
  }

  const handleMenuOpenChange = (open: boolean) => {
    setIsMenuOpen(open)
    onMenuOpenChange?.(open)
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsMenuOpen(false)
    onMenuOpenChange?.(false)
    onFavoriteToggle?.()

    await toggleFavorite(chat.id)
  }

  return (
    <>
      <DropdownMenu
        open={isMenuOpen}
        modal={isMobile ? true : false}
        onOpenChange={handleMenuOpenChange}
      >
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex size-7 cursor-pointer items-center justify-center rounded-md p-1 transition-colors duration-150",
              isMenuOpen ? "bg-secondary" : "hover:bg-secondary"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <DotsThree size={18} className="text-primary" weight="bold" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleToggleFavorite}
          >
            <Star
              size={16}
              className="mr-2"
              weight={isFavorite ? "fill" : "regular"}
            />
            {isFavorite ? "Unfavorite" : "Favorite"}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onStartEditing()
            }}
          >
            <PencilSimple size={16} className="mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            variant="destructive"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsDeleteDialogOpen(true)
            }}
          >
            <Trash size={16} className="mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogDeleteChat
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        chatTitle={chat.title || "Untitled chat"}
        onConfirmDelete={handleConfirmDelete}
      />
    </>
  )
}
