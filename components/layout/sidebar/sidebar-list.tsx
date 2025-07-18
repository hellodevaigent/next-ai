import { Chat } from "@/lib/store/chat-store/types"
import { SidebarItem } from "./sidebar-item"

type SidebarListProps = {
  title: string
  items: Chat[]
  currentChatId: string
}

export function SidebarList({ title, items, currentChatId }: SidebarListProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <>
      <div className="bg-sidebar sticky top-[123px] md:-top-[10px] z-10 block w-full p-2 text-xs text-nowrap">
        <span className="opacity-50">{title}</span>
      </div>
      <div className="space-y-0.5 mb-4">
        {items.map((chat) => (
          <SidebarItem
            key={chat.id}
            chat={chat}
            currentChatId={currentChatId}
          />
        ))}
      </div>
    </>
  )
}