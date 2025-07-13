import { Chat } from "@/lib/chat-store/types"
import { SidebarItem } from "./sidebar-item"

type SidebarListProps = {
  title: string
  items: Chat[]
  currentChatId: string
}

export function SidebarList({ title, items, currentChatId }: SidebarListProps) {
  return (
    <div className="space-y-0.5">
      {items.map((chat) => (
        <SidebarItem key={chat.id} chat={chat} currentChatId={currentChatId} />
      ))}
    </div>
  )
}
