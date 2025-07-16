import { ChatContainer } from "@/components/chat/chat-container"
import { LayoutApp } from "@/components/layout/layout-app"
import { MessagesProvider } from "@/lib/store/chat-store/messages/provider"

export const dynamic = "force-dynamic"

export default function Home() {
  return (
    <MessagesProvider>
      <LayoutApp>
        <ChatContainer />
      </LayoutApp>
    </MessagesProvider>
  )
}
