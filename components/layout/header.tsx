"use client"

import { HistoryTrigger } from "@/components/history/history-trigger"
import { ButtonNewChat } from "@/components/layout/button-new-chat"
import { APP_NAME } from "@/lib/config"
import { useBreakpoint } from "@/lib/hooks/use-breakpoint"
import { useIsPathExcluded } from "@/lib/hooks/use-path-check"
import { useTitleStore } from "@/lib/store/title-store"
import { useUser } from "@/lib/store/user-store/provider"
import { cn } from "@/lib/utils"
import { AlignLeft } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "../skeleton/skeleton"
import { useSidebar } from "../ui/sidebar"
import { DialogPublish } from "./dialog-publish"
import { UserMenu } from "./user-menu"
import { DialogConnectWallet } from "./dialog-connect-wallet"

export function Header({ hasSidebar }: { hasSidebar: boolean }) {
  const isMobile = useBreakpoint(768)
  const { user } = useUser()
  const { setOpenMobile } = useSidebar()
  const { title, isLoading } = useTitleStore()
  const isExcluded = useIsPathExcluded(["/"])

  const isLoggedIn = !!user

  return (
    <header className="h-app-header bg-background pointer-events-none sticky top-0 right-0 left-0 z-50 border-b">
      <div className="relative mx-auto flex h-full max-w-full items-center justify-between bg-transparent px-4 lg:bg-transparent">
        <div
          className={cn(
            "flex flex-1 items-center justify-between",
            hasSidebar && "md:pl-3"
          )}
        >
          <div className="-ml-0.5 flex flex-1 items-center gap-2">
            <div className="flex flex-1 items-center gap-2">
              {isMobile && hasSidebar && (
                <button
                  type="button"
                  onClick={() => setOpenMobile(true)}
                  className="text-muted-foreground hover:text-foreground pointer-events-auto mt-[2px] inline-flex items-center justify-center rounded-md bg-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <AlignLeft className="size-5" />
                </button>
              )}
              {!hasSidebar && (
                <Link
                  href="/"
                  className="pointer-events-auto inline-flex items-center text-xl font-medium tracking-tight transition-opacity duration-200"
                >
                  {APP_NAME}
                </Link>
              )}
              {!isExcluded && (
                <span className={cn(
                  "text-muted-foreground/30 w-4 min-w-4 text-center text-lg select-none ",
                  !hasSidebar ? "" : "md:hidden"
                )}>
                  /
                </span>
              )}
              {isLoading ? (
                <Skeleton className="h-4 w-28" />
              ) : (
                <h1 className="w-38 truncate text-nowrap capitalize">
                  {title}
                </h1>
              )}
            </div>
          </div>
          <div />
          {!isLoggedIn ? (
            <div className="pointer-events-auto flex flex-1 items-center justify-end gap-4">
              <Link
                href="/auth"
                className="font-base text-muted-foreground hover:text-foreground text-base transition-colors"
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="pointer-events-auto flex flex-1 items-center justify-end gap-2">
              <DialogConnectWallet
                onWalletVerified={() => console.log("Wallet verified")}
              />
              <DialogPublish />
              {!hasSidebar && <ButtonNewChat />}
              {!hasSidebar && <HistoryTrigger hasSidebar={hasSidebar} />}
              {!hasSidebar && <UserMenu />}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
