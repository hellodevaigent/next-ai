"use client"

import { AppInfoTrigger } from "@/components/app-info/app-info-trigger"
import { HistoryTrigger } from "@/components/history/history-trigger"
import { ZolaIcon } from "@/components/icons/zola"
import { ButtonNewChat } from "@/components/layout/button-new-chat"
import { UserMenu } from "@/components/layout/user-menu"
import { Button } from "@/components/ui/button"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { APP_NAME } from "@/lib/config"
import { useTitleStore } from "@/lib/title-store"
import { useUserPreferences } from "@/lib/user-preference-store/provider"
import { useUser } from "@/lib/user-store/provider"
import { Info } from "@phosphor-icons/react"
import { AlignLeft } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "../skeleton/skeleton"
import { useSidebar } from "../ui/sidebar"
import { DialogPublish } from "./dialog-publish"
import { HeaderSidebarTrigger } from "./header-sidebar-trigger"

export function Header({ hasSidebar }: { hasSidebar: boolean }) {
  const isMobile = useBreakpoint(768)
  const { user } = useUser()
  const { toggleSidebar } = useSidebar()
  const { title, isLoading } = useTitleStore()
  const { preferences } = useUserPreferences()
  const isMultiModelEnabled = preferences.multiModelEnabled

  const isLoggedIn = !!user

  return (
    <header className="h-app-header pointer-events-none sticky top-0 right-0 left-0 z-50 border-b">
      <div className="relative mx-auto flex h-full max-w-full items-center justify-between bg-transparent px-4 lg:bg-transparent">
        <div className="flex flex-1 items-center justify-between">
          <div className="-ml-0.5 flex flex-1 items-center gap-2">
            <div className="flex flex-1 items-center gap-2">
              {isMobile && (
                <button
                  type="button"
                  onClick={() => toggleSidebar()}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted pointer-events-auto inline-flex items-center justify-center rounded-md bg-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <AlignLeft className="size-4" />
                </button>
              )}
              {isLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <>
                  <span className="text-muted-foreground/30 w-4 min-w-4 text-center text-lg select-none md:hidden">
                    /
                  </span>
                  <h1 className="w-38 truncate text-nowrap capitalize md:ml-3">
                    {title}
                  </h1>
                </>
              )}
            </div>
          </div>
          <div />
          {!isLoggedIn ? (
            <div className="pointer-events-auto flex flex-1 items-center justify-end gap-4">
              <AppInfoTrigger
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-background hover:bg-muted text-muted-foreground h-8 w-8 rounded-full"
                    aria-label={`About ${APP_NAME}`}
                  >
                    <Info className="size-4" />
                  </Button>
                }
              />
              <Link
                href="/auth"
                className="font-base text-muted-foreground hover:text-foreground text-base transition-colors"
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="pointer-events-auto flex flex-1 items-center justify-end gap-2">
              {!isMultiModelEnabled && <DialogPublish />}
              <ButtonNewChat />
              {!hasSidebar && <HistoryTrigger hasSidebar={hasSidebar} />}
              <UserMenu />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
