"use client"

import { Header } from "@/components/layout/header"
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar"
import { useBreakpoint } from "@/lib/hooks/use-breakpoint"
import { useUserPreferences } from "@/lib/user-preference-store/provider"
import { cn } from "@/lib/utils"

export function LayoutApp({ children }: { children: React.ReactNode }) {
  const { preferences } = useUserPreferences()
  const isMobile = useBreakpoint(768)
  const hasSidebar = preferences.layout === "sidebar"

  return (
    <div className="bg-background flex h-dvh w-full overflow-hidden">
      {hasSidebar && <AppSidebar />}
      <main className={cn(
        "@container relative h-dvh w-0 flex-shrink flex-grow overflow-hidden",
        !isMobile && hasSidebar && "border-y border-r border-border md:h-[calc(100%_-_56px)] md:top-[56px] md:right-[11px] md:ml-2 md:rounded-tr-xl md:rounded-br-xl"
      )}>
        <Header hasSidebar={hasSidebar} />
        {children}
      </main>
    </div>
  )
}