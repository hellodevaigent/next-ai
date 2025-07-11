import { ReactNode } from "react";
import { ChatsProvider } from "@/lib/chat-store/chats/provider";
import { MessagesProvider } from "@/lib/chat-store/messages/provider";
import { ModelProvider } from "@/lib/model-store/provider";
import { getUserProfile } from "@/lib/user/api";

export async function MainProviders({ children }: { children: ReactNode }) {
  const userProfile = await getUserProfile()

  return (
    <ModelProvider>
      <ChatsProvider userId={userProfile?.id}>
        <MessagesProvider>{children}</MessagesProvider>
      </ChatsProvider>
    </ModelProvider>
  );
}