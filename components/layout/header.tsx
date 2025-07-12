"use client"

import { ButtonNewChat } from "@/components/layout/button-new-chat"
import { UserMenu } from "@/components/layout/user-menu"
import { useSidebar } from "@/components/ui/sidebar"
import { APP_NAME } from "@/lib/config"
import { useBreakpoint } from "@/lib/hooks/use-breakpoint"
import { useUserPreferences } from "@/lib/user-preference-store/provider"
import { useUser } from "@/lib/user-store/provider"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { DialogConnectWallet } from "./dialog-connect-wallet"
import { DialogPublish } from "./dialog-publish"
import { HeaderSidebarTrigger } from "./header-sidebar-trigger"

export function Header() {
  const isMobile = useBreakpoint(768)
  const { user } = useUser()
  const { open } = useSidebar()
  const { preferences } = useUserPreferences()
  const isMultiModelEnabled = preferences.multiModelEnabled

  const isLoggedIn = !!user

  return (
    <header className="h-app-header border-border pointer-events-none sticky top-0 right-0 left-0 z-50 border-b max-md:backdrop-blur-md md:fixed md:border-none">
      <div className="relative mx-auto flex h-full max-w-full items-center justify-between pr-2.5 pl-2 md:pr-3 md:pl-2 lg:pr-3.5 lg:pl-2">
        <div className="flex flex-1 items-center justify-between">
          <div
            className="flex flex-1 items-center md:-ml-0.5"
          >
            <div
              className="flex items-center justify-start gap-2 duration-250"
              style={{
                width: open ? (isMobile ? 100 : 235) : 100,
              }}
            >
              <HeaderSidebarTrigger />
              <Link
                href="/"
                className={cn(
                  "pointer-events-auto inline-flex items-center text-xl font-medium tracking-tight duration-250",
                  open ? "opacity-100" : "opacity-0"
                )}
              >
                {APP_NAME}
              </Link>
            </div>
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
