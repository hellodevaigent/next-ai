"use client"

import { useEffect } from "react"
import { SettingsContent } from "@/components/layout/settings/settings-content"
import { useBreakpoint } from "@/lib/hooks/use-breakpoint"
import { useUser } from "@/lib/user-store/provider"
import { useRouter } from "next/navigation"
import { LoaderScreen } from "@/components/common/Loader"

export default function SettingsPage() {
  const isMobile = useBreakpoint(768)
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  // Show loading state while checking user or redirecting
  if (!user) {
    return <LoaderScreen />
  }

  return (
    <div className="@container/main relative">
      {isMobile ? <SettingsContent isMobile /> : <SettingsContent />}
    </div>
  )
}