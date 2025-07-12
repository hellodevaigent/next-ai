"use client"

import { groupChatsByDate } from "@/components/history/utils"
import { SidebarChatSkeleton } from "@/components/skeleton/SidebarSkeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { useChats } from "@/lib/chat-store/chats/provider"
import { APP_NAME } from "@/lib/config"
import { cn } from "@/lib/utils"
import {
  ChatTeardropText,
  GithubLogo,
  MagnifyingGlass,
  NotePencilIcon,
  X,
} from "@phosphor-icons/react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useMemo } from "react"
import { HistoryTrigger } from "../../history/history-trigger"
import { HeaderSidebarTrigger } from "../header-sidebar-trigger"
import { SidebarList } from "./sidebar-list"
import { SidebarProject } from "./sidebar-project"

export function AppSidebar() {
  const params = useParams<{ chatId: string }>()
  const { setOpenMobile, open } = useSidebar()
  const { chats, isLoading } = useChats()
  const currentChatId = params.chatId

  const groupedChats = useMemo(() => {
    const result = groupChatsByDate(chats, "")
    return result
  }, [chats])
  const hasChats = chats.length > 0
  const router = useRouter()

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border">
      <SidebarHeader>
        <div className="h-[49px] flex items-center justify-between px-2">
          <HeaderSidebarTrigger />
          <Link
            href="/"
            className={cn(
              "pointer-events-auto inline-flex items-center pr-2 text-xl font-medium tracking-tight duration-200",
              open ? "opacity-100" : "opacity-0"
            )}
          >
            {APP_NAME}
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-hidden mask-t-from-98% mask-t-to-100% mask-b-from-98% mask-b-to-100%">
        <>
          <div className="mt-2.5 flex w-full flex-col items-start gap-0 space-y-0.25 px-2">
            <button
              className="hover:bg-accent/80 hover:text-foreground text-primary group/new-chat relative inline-flex w-full cursor-pointer items-center rounded-md bg-transparent p-2 text-sm text-nowrap transition-colors"
              type="button"
              onClick={() => {
                router.push("/")
                setOpenMobile(false)
              }}
            >
              <span className="mr-2">
                <NotePencilIcon size={18} />
              </span>
              <span
                className={`flex w-full items-center justify-between gap-2 duration-350 ${open ? "opacity-100" : "md:opacity-0"}`}
              >
                New Chat
                <span className="text-muted-foreground ml-auto text-xs opacity-0 duration-150 group-hover/new-chat:opacity-100">
                  ⌘⇧U
                </span>
              </span>
            </button>
            <HistoryTrigger
              classNameTrigger="group/search bg-transparent hover:bg-accent/80 hover:text-foreground text-primary relative inline-flex w-full items-center rounded-md p-2 text-sm transition-colors text-nowrap cursor-pointer"
              icon={
                <div className="mr-2">
                  <MagnifyingGlass size={18} />
                </div>
              }
              label={
                <div
                  className={cn(
                    "flex w-full items-center justify-between gap-2 duration-350",
                    open ? "opacity-100" : "md:opacity-0"
                  )}
                >
                  <span>Search</span>
                  <div className="text-muted-foreground ml-auto text-xs opacity-0 duration-150 group-hover/search:opacity-100">
                    ⌘+K
                  </div>
                </div>
              }
              hasPopover={false}
            />
          </div>
          <div className="border-border space-y-0.25 border-t px-2 pt-2">
            <SidebarProject />
          </div>
          <div className="border-border space-y-0.25 border-t px-2 pt-1">
            {isLoading ? (
              <div className="h-full">
                <SidebarChatSkeleton />
              </div>
            ) : hasChats ? (
              <ScrollArea className="flex h-[calc(100vh_-_350px)] [&>div>div]:!block [&>div>div]:space-y-3">
                <div
                  className={`duration-350 ${open ? "opacity-100" : "md:opacity-0"}`}
                >
                  {groupedChats?.map((group) => (
                    <SidebarList
                      key={group.name}
                      title={group.name}
                      items={group.chats}
                      currentChatId={currentChatId}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <ul className="mt-3 flex w-full min-w-0 flex-col gap-0.5">
                <div className="border-border mx-2 h-16 content-center rounded-lg border px-8 text-center text-xs text-gray-500">
                  You haven't created any chats yet.
                </div>
              </ul>
            )}
          </div>
        </>
      </SidebarContent>
      <SidebarFooter className="mb-2 px-2"></SidebarFooter>
    </Sidebar>
  )
}
