import { useBreakpoint } from "@/hooks/use-breakpoint"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useChats } from "@/lib/chat-store/chats/provider"
import { useMessages } from "@/lib/chat-store/messages/provider"
import { useChatSession } from "@/lib/chat-store/session/provider"
import { Chat } from "@/lib/chat-store/types"
import { DotsThree, PencilSimple, Trash } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { DialogDeleteChat } from "./dialog-delete-chat"
import { cn } from "@/lib/utils"

type SidebarItemMenuProps = {
  chat: Chat
  onStartEditing: () => void
  onMenuOpenChange?: (open: boolean) => void
}

export function SidebarItemMenu({
  chat,
  onStartEditing,
  onMenuOpenChange,
}: SidebarItemMenuProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const { deleteMessages } = useMessages()
  const { deleteChat } = useChats()
  const { chatId } = useChatSession()
  const isMobile = useBreakpoint(768)

  const handleConfirmDelete = async () => {
    await deleteMessages()
    await deleteChat(chat.id, chatId!, () => router.push("/"))
  }

  const handleMenuOpenChange = (open: boolean) => {
    setIsMenuOpen(open)
    onMenuOpenChange?.(open)
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
              "flex size-7 items-center justify-center rounded-md p-1 transition-colors duration-150 cursor-pointer",
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
