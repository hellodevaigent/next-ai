import type { Tables } from "@/types/database.types"
import type { UserPreferences } from "../store/user-preference-store/utils"

export type UserProfile = {
  profile_image: string
  display_name: string
  preferences?: UserPreferences
} & Tables<"users">
