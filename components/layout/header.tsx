"use client"

import { ButtonNewChat } from "@/components/layout/button-new-chat"
import { UserMenu } from "@/components/layout/user-menu"
import { useSidebar } from "@/components/ui/sidebar"
import { useBreakpoint } from "@/lib/hooks/use-breakpoint"
import { useTitleStore } from "@/lib/title-store"
import { useUserPreferences } from "@/lib/user-preference-store/provider"
import { useUser } from "@/lib/user-store/provider"
import Link from "next/link"
import SidebarIcon from "../icons/sidebar-icon"
import { DialogConnectWallet } from "./dialog-connect-wallet"
import { DialogPublish } from "./dialog-publish"
import { Skeleton } from "../skeleton/Skeleton"

export function Header() {
  const isMobile = useBreakpoint(768)
  const { user } = useUser()
  const { open, toggleSidebar } = useSidebar()
  const { title, isLoading } = useTitleStore()
  const { preferences } = useUserPreferences()

  const isMultiModelEnabled = preferences.multiModelEnabled

  const isLoggedIn = !!user

  return (
    <header className="h-[50px] border-border pointer-events-none sticky top-0 right-0 left-0 z-50 border-b md:border-none">
      <div className="relative mx-auto flex h-full max-w-full items-center justify-between px-3.5 md:pr-3 md:pl-2 lg:pr-3.5 lg:pl-2">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex flex-1 space-x-1 items-center md:-ml-0.5">
            {isMobile && (
              <button
                type="button"
                onClick={() => toggleSidebar()}
                className="pointer-events-auto text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center justify-center rounded-md bg-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <SidebarIcon open={open} className="size-4" />
              </button>
            )}
            <span className="text-muted-foreground/30 w-4 min-w-4 select-none text-center text-lg md:hidden">/</span>
            {isLoading ? (
              <Skeleton className="w-32 h-4" />
            ) : (
              <h1 className="w-38 truncate text-nowrap capitalize md:ml-3">
                {title}
              </h1>
            )}
          </div>
          {!isLoggedIn ? (
            <div className="pointer-events-auto">
              <Link
                href="/auth"
                className="font-base text-muted-foreground hover:bg-muted border-border inline-flex items-center gap-1 rounded-md border px-3 pb-0.75"
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="pointer-events-auto flex flex-1 items-center justify-end gap-2">
              {!isMultiModelEnabled && <DialogPublish />}
              <ButtonNewChat />
              <DialogConnectWallet
                onWalletVerified={() => console.log("Wallet verified")}
              />
              <UserMenu />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
