"use client"

import { Header } from "@/components/layout/header"
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar"

export function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex h-screen w-full overflow-hidden">
      <AppSidebar />
      <main className="@container relative flex h-full w-full flex-col">
        <Header />
        {children}
      </main>
    </div>
  )
}