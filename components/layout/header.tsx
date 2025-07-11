"use client"

import Link from "next/link"
import { HistoryTrigger } from "@/components/history/history-trigger"
import { AppInfoTrigger } from "@/components/layout/app-info/app-info-trigger"
import { ButtonNewChat } from "@/components/layout/button-new-chat"
import { UserMenu } from "@/components/layout/user-menu"
import { useBreakpoint } from "@/lib/hooks/use-breakpoint"
import { ZolaIcon } from "@/components/icons/zola"
import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/lib/config"
import { useUserPreferences } from "@/lib/user-preference-store/provider"
import { useUser } from "@/lib/user-store/provider"
import { Info } from "@phosphor-icons/react"
import { DialogPublish } from "./dialog-publish"
import { HeaderSidebarTrigger } from "./header-sidebar-trigger"
import { DialogConnectWallet } from "./dialog-connect-wallet"
import { useSidebar } from "@/components/ui/sidebar"

export function Header({ hasSidebar }: { hasSidebar: boolean }) {
  const isMobile = useBreakpoint(768)
  const { user } = useUser()
  const { open } = useSidebar()
  const { preferences } = useUserPreferences()
  const isMultiModelEnabled = preferences.multiModelEnabled

  const isLoggedIn = !!user

  return (
    <header className={`h-app-header backdrop-blur-md pointer-events-none border-b border-border fixed top-0 right-0 left-0 z-50 ${hasSidebar? 'md:border-none' : ''}`}>
      <div className={`relative mx-auto flex h-full max-w-full items-center justify-between  pr-2.5 ${hasSidebar ? "pl-2 md:pl-2 md:pr-3 lg:pl-2 lg:pr-3.5" : "pl-4 md:pr-3 md:pl-4"}`}>
        <div className="flex flex-1 items-center justify-between">
          <div className={`flex flex-1 items-center ${hasSidebar && "md:-ml-0.5"}`}>
            <div className="flex items-center gap-2 duration-250 justify-start  "
              style={{
                width: open ? isMobile ? 100 : 235 : 100
              }}
            >
              {hasSidebar && <HeaderSidebarTrigger />}
              <Link
                href="/"
                className="pointer-events-auto inline-flex items-center text-xl font-medium tracking-tight duration-250"
              >
                {APP_NAME}
              </Link>
            </div>
          </div>
          {!isLoggedIn ? (
            <div className="pointer-events-auto">
              <Link
                href="/auth"
                className="font-base text-muted-foreground hover:bg-muted inline-flex items-center gap-1 rounded-md px-3 pb-0.75 border border-border"
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="pointer-events-auto flex flex-1 items-center justify-end gap-2">
              {!isMultiModelEnabled && <DialogPublish />}
              <ButtonNewChat />
              {!hasSidebar && <HistoryTrigger hasSidebar={hasSidebar} />}
              <DialogConnectWallet
                onWalletVerified={() => console.log('Wallet verified')}
              />
              <UserMenu />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
