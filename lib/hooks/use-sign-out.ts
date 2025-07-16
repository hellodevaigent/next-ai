import { toast } from "@/components/ui/toast"
import { useChats } from "@/lib/store/chat-store/chats/provider"
import { useMessages } from "@/lib/store/chat-store/messages/provider"
import { clearAllIndexedDBStores } from "@/lib/store/chat-store/persist"
import { useUser } from "@/lib/store/user-store/provider"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function useSignOut() {
  const { signOut } = useUser()
  const { resetChats } = useChats()
  const { resetMessages } = useMessages()
  const router = useRouter()

  const handleSignOut = useCallback(async () => {
    try {
      await resetMessages()
      await resetChats()
      await signOut()
      await clearAllIndexedDBStores()
      router.push("/")
    } catch (e) {
      console.error("Sign out failed:", e)
      toast({ title: "Failed to sign out", status: "error" })
    }
  }, [signOut, resetChats, resetMessages, router])

  return { handleSignOut }
}