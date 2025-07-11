"use client"

import { SettingsContent } from "@/components/layout/settings/settings-content"
import { useBreakpoint } from "@/lib/hooks/use-breakpoint"

export default function SettingsPage() {
  const isMobile = useBreakpoint(768)
  return (
    <div className="@container/main relative">
      {/* <div className="w-full h-full mx-auto max-w-3xl"> */}
        {isMobile ? (
          <SettingsContent isMobile />
        ) : (
          <SettingsContent />
        )}
      {/* </div> */}
    </div>
  )
}
