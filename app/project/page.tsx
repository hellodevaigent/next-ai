import { LayoutApp } from "@/components/layout/layout-app"
import { SidebarProject } from "@/components/layout/sidebar/sidebar-project"
import { MessagesProvider } from "@/lib/chat-store/messages/provider"
import { isSupabaseEnabled } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

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
        <SidebarProject />
      </LayoutApp>
    </MessagesProvider>
  )
}
