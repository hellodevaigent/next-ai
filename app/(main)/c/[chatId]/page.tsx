import type { Metadata } from "next"
import { ChatContainer } from "@/components/chat/chat-container"
import { generateChatMetadata } from "@/lib/metadata"
import { isSupabaseEnabled } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

type Props = {
  params: Promise<{ chatId: string }>
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  return generateChatMetadata({ params })
}

export default async function ChatPage() {
  if (isSupabaseEnabled) {
    const supabase = await createClient();
    if (supabase) {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        redirect("/");
      }
    }
  }

  return <ChatContainer />;
}