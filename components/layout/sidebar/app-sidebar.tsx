"use client"

import { SidebarChatSkeleton } from "@/components/skeleton/sidebar-skeleton"
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { useChats } from "@/lib/chat-store/chats/provider"
import { APP_NAME } from "@/lib/config"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  MagnifyingGlass,
  NotePencilIcon,
} from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { FolderPlusIcon } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { HistoryTrigger } from "../../history/history-trigger"
import { SimpleHistory } from "../../history/simple-history"
import { HeaderSidebarTrigger } from "../header-sidebar-trigger"
import { SidebarList } from "./sidebar-list"
import { UserMenu } from "../user-menu"
import { UserMenuSidebar } from "./user-menu-sidebar"

export function AppSidebar() {
  const { open, setOpenMobile } = useSidebar()
  const { chats, isLoading } = useChats()
  const params = useParams<{ chatId: string }>()
  const currentChatId = params.chatId
  const isMobile = useBreakpoint(768)
  const [showHistory, setShowHistory] = useState(false)

  const hasChats = chats.length > 0
  const router = useRouter()

  const handleBackToSidebar = () => {
    setShowHistory(false)
  }

  const handleSearchClick = () => {
    if (isMobile) {
      setShowHistory(true)
    }
  }

  const mainContent = (
    <div>
      <div className="flex w-full flex-col items-start gap-0 border-b p-2">
        <button
          className="hover:bg-accent/80 hover:text-foreground text-primary group/new-chat relative inline-flex w-full items-center rounded-md bg-transparent px-2 py-2 text-sm transition-colors"
          type="button"
          onClick={() => {
            setOpenMobile(false)
            router.push("/")
          }}
        >
          <span className="mr-2">
            <NotePencilIcon size={18} />
          </span>
          <span
            className={cn(
              "flex w-full items-center justify-between gap-2 text-nowrap duration-350",
               open ? "opacity-100" : "md:opacity-0"
            )}
          >
            New Chat
            <span className="text-muted-foreground ml-auto text-xs opacity-0 duration-150 group-hover/new-chat:opacity-100">
              ⌘⇧U
            </span>
          </span>
        </button>

        {isMobile ? (
          <button
            className="hover:bg-accent/80 hover:text-foreground text-primary group/search relative inline-flex w-full items-center rounded-md bg-transparent px-2 py-2 text-sm transition-colors"
            type="button"
            onClick={handleSearchClick}
          >
            <span className="mr-2">
              <MagnifyingGlass size={18} />
            </span>
            <span
              className={cn(
                "flex w-full items-center justify-between gap-2 text-nowrap duration-350",
                open ? "opacity-100" : "md:opacity-0"
              )}
            >
              <span>Search</span>
              <div className="text-muted-foreground ml-auto text-xs opacity-0 duration-150 group-hover/search:opacity-100">
                ⌘+K
              </div>
            </span>
          </button>
        ) : (
          <HistoryTrigger
            hasSidebar={false}
            classNameTrigger="bg-transparent hover:bg-accent/80 hover:text-foreground text-primary relative inline-flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors group/search"
            icon={
              <span className="mr-2">
                <MagnifyingGlass size={18} />
              </span>
            }
            label={
              <span
                className={cn(
                  "flex w-full items-center justify-between gap-2 text-nowrap duration-350",
                  open ? "opacity-100" : "md:opacity-0"
                )}
              >
                <span>Search</span>
                <div className="text-muted-foreground ml-auto text-xs opacity-0 duration-150 group-hover/search:opacity-100">
                  ⌘+K
                </div>
              </span>
            }
            hasPopover={false}
          />
        )}

        <button
          className="hover:bg-accent/80 hover:text-foreground text-primary group/new-chat relative inline-flex w-full items-center rounded-md bg-transparent px-2 py-2 text-sm transition-colors"
          type="button"
          onClick={() => {
            setOpenMobile(false)
            router.push("/projects")
          }}
        >
          <span className="mr-2">
            <FolderPlusIcon size={18} />
          </span>
          <span
            className={`flex w-full items-center justify-between gap-2 text-nowrap duration-350 ${open ? "opacity-100" : "md:opacity-0"}`}
          >
            Project
            <span className="text-muted-foreground ml-auto text-xs opacity-0 duration-150 group-hover/new-chat:opacity-100">
              ⌘⇧U
            </span>
          </span>
        </button>
      </div>

      <div
        className={cn(
          "scrollbar-sidebar block h-[calc(100vh_-_233px)] mask-b-from-95% mask-b-to-100% pt-1.5",
          open ? "overflow-y-auto" : "overflow-hidden"
        )}
      >
        {isLoading ? (
          <SidebarChatSkeleton />
        ) : hasChats ? (
          <div className={cn("w-full px-2", open ? "block" : "hidden")}>
            <SidebarList
              title="Recents"
              items={chats}
              currentChatId={currentChatId}
            />
          </div>
        ) : (
          <ul className="mt-3 flex w-full min-w-0 flex-col gap-0.5">
            <div className="border-border mx-2 h-16 content-center rounded-lg border px-8 text-center text-xs text-gray-500">
              You haven't created any chats yet.
            </div>
          </ul>
        )}
      </div>
    </div>
  )

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-none overflow-hidden">
      <SidebarHeader className="h-app-header border-b">
        <div className="flex items-center justify-between">
          {showHistory && isMobile ? (
            <button
              className="hover:bg-accent/80 rounded-md p-2 transition-colors"
              onClick={handleBackToSidebar}
              aria-label="Back to sidebar"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <HeaderSidebarTrigger className="p-2" />
          )}
          <Link
            href="/"
            className={cn(
              "pointer-events-auto mr-2 inline-flex items-center text-xl font-medium tracking-tight duration-200",
              open ? "opacity-100" : "opacity-0"
            )}
            onClick={() => setOpenMobile(false)}
          >
            {APP_NAME}
          </Link>
        </div>
      </SidebarHeader>

      <div className="relative flex-1 overflow-hidden">
        <motion.div
          animate={{
            x: showHistory && isMobile ? "-100%" : "0%",
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 40,
            duration: 0.25,
          }}
          className="absolute inset-0 w-full"
        >
          {mainContent}
        </motion.div>

        {isMobile && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{
              x: showHistory ? "0%" : "100%",
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 40,
              duration: 0.25,
            }}
            className="scrollbar-sidebar flex h-full flex-col overflow-y-auto"
          >
            <SimpleHistory />
          </motion.div>
        )}
      </div>

      {!showHistory && (
        <SidebarFooter className="p-2">
          <UserMenuSidebar />
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
