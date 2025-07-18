import { toast } from "@/components/ui/toast"
import { fetchClient } from "@/lib/fetch"
import { API_ROUTE_SIGN_OUT, API_ROUTE_USERS } from "@/lib/routes"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile } from "@/lib/user/types"

export async function fetchUserProfile(): Promise<UserProfile | null> {
  const response = await fetchClient(API_ROUTE_USERS)

  try {
    if (!response.ok) {
      const error = await response.json()
      console.error("Failed to fetch user profile:", error)
      return null
    }

    const data = await response.json()
    return data.profile
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

export async function updateUserProfile(
  updates: Partial<UserProfile>
): Promise<boolean> {
  try {
    const response = await fetchClient(API_ROUTE_USERS, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Failed to update user profile:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error updating user profile:", error)
    return false
  }
}

export async function signOutUser(): Promise<boolean> {
  try {
    const response = await fetchClient(API_ROUTE_SIGN_OUT, {
      method: "POST",
    })

    if (!response.ok) {
      const error = await response.json()

      if (error.error === "Sign out is not supported in this deployment") {
        toast({
          title: "Sign out is not supported in this deployment",
          status: "info",
        })
        return false
      }

      console.error("Failed to sign out:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error signing out:", error)
    return false
  }
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
