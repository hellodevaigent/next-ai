"use client"

import { Header } from "@/components/layout/header"
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar"
import { cn } from "@/lib/utils"

export function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex h-dvh w-full overflow-hidden">
      <AppSidebar />
      <main className={cn(
        "@container relative h-dvh w-0 flex-shrink flex-grow overflow-hidden",
        "md:border-y md:border-r md:border-border md:h-[calc(100%_-_56px)] md:top-[56px] md:right-[11px] md:ml-[11px] md:rounded-r-xl md:rounded-br-xl"
      )}>
        <Header />
        {children}
      </main>
    </div>
  )
}