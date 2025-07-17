import { toast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile } from "@/lib/user/types"

export async function fetchUserProfile(
  id: string
): Promise<UserProfile | null> {
  const supabase = createClient()
  if (!supabase) return null

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single()

  if (userError) {
    console.error("Failed to fetch user from 'users' table:", userError)
  }

  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData.user) {
    console.error("Failed to fetch user from auth:", authError)
    return null
  }

  // Don't return anonymous users
  if (userData?.anonymous) return null

  return {
    ...(userData || {}),
    id: authData.user.id,
    email: authData.user.email || "",
    profile_image: authData.user.user_metadata?.avatar_url || null,
    display_name: authData.user.user_metadata?.name || "",
  } as UserProfile
}

export async function updateUserProfile(
  id: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false

  const { error } = await supabase.from("users").update(updates).eq("id", id)

  if (error) {
    console.error("Failed to update user:", error)
    return false
  }

  return true
}

export async function signOutUser(): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) {
    toast({
      title: "Sign out is not supported in this deployment",
      status: "info",
    })
    return false
  }

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error("Failed to sign out:", error)
    return false
  }

  return true
}

export function subscribeToUserUpdates(
  userId: string,
  onUpdate: (newData: Partial<UserProfile>) => void
) {
  const supabase = createClient()
  if (!supabase) return () => {}

  const channel = supabase
    .channel(`public:users:id=eq.${userId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "users",
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        onUpdate(payload.new as Partial<UserProfile>)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
