import { LayoutApp } from "@/components/layout/layout-app"
import { SettingsContent } from "@/components/settings/settings-content"
import { MessagesProvider } from "@/lib/chat-store/messages/provider"
import { metadata as meta } from "@/lib/metadata"
import { isSupabaseEnabled } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"
import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = meta.settings

export default async function Page() {
  if (isSupabaseEnabled) {
    const supabase = await createClient()
    if (supabase) {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        redirect("/")
      }
    }
  }
  
  return (
    <MessagesProvider>
      <LayoutApp>
        <SettingsContent />
      </LayoutApp>
    </MessagesProvider>
  )
}
