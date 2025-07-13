"use client"

import { groupChatsByDate } from "@/components/history/utils"
import { SidebarChatSkeleton } from "@/components/skeleton/sidebar-skeleton"
import {
  Sidebar,
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
import { FolderPlusIcon } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useMemo } from "react"
import { HistoryTrigger } from "../../history/history-trigger"
import { HeaderSidebarTrigger } from "../header-sidebar-trigger"
import { SidebarList } from "./sidebar-list"

export function AppSidebar() {
  const { open, setOpenMobile } = useSidebar()
  const { chats, isLoading } = useChats()
  const params = useParams<{ chatId: string }>()
  const currentChatId = params.chatId

  const groupedChats = useMemo(() => {
    const result = groupChatsByDate(chats, "")
    return result
  }, [chats])
  const hasChats = chats.length > 0
  const router = useRouter()

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-none">
      <SidebarHeader className="h-app-header border-b">
        <div className="flex items-center justify-between">
          <HeaderSidebarTrigger className="p-2" />
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
              className={`flex w-full items-center justify-between gap-2 text-nowrap duration-350 ${open ? "opacity-100" : "md:opacity-0"}`}
            >
              New Chat
              <span className="text-muted-foreground ml-auto text-xs opacity-0 duration-150 group-hover/new-chat:opacity-100">
                ⌘⇧U
              </span>
            </span>
          </button>
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
          <button
            className="hover:bg-accent/80 hover:text-foreground text-primary group/new-chat relative inline-flex w-full items-center rounded-md bg-transparent px-2 py-2 text-sm transition-colors"
            type="button"
            onClick={() => {
              setOpenMobile(false)
              router.push("/project")
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
            "scrollbar-sidebar pt-3 block h-[calc(100vh_-_233px)] mask-b-from-98% mask-b-to-100%",
            open ? "overflow-y-auto" : "overflow-hidden"
          )}
        >
          {isLoading ? (
            <SidebarChatSkeleton />
          ) : hasChats ? (
            <div className={cn("w-full px-2", open ? "block" : "hidden")}>
              <div className="block bg-sidebar sticky -top-[13px] z-10 w-full p-2 text-xs text-nowrap">
                <span className="opacity-50">Recents</span>
              </div>
              {groupedChats?.map((group) => (
                <SidebarList
                  key={group.name}
                  title={group.name}
                  items={group.chats}
                  currentChatId={currentChatId}
                />
              ))}
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
      <SidebarFooter className="p-2">
        <button
          className="hover:bg-accent/80 hover:text-foreground text-primary group/new-chat relative inline-flex w-full items-center rounded-md bg-transparent px-2 py-2 text-sm transition-colors"
          type="button"
          onClick={() => router.push("/")}
        >
          <span className="mr-2">
            <NotePencilIcon size={18} />
          </span>
          <span
            className={`flex w-full items-center justify-between gap-2 text-nowrap duration-350 ${open ? "opacity-100" : "md:opacity-0"}`}
          >
            New Chat
            <span className="text-muted-foreground ml-auto text-xs opacity-0 duration-150 group-hover/new-chat:opacity-100">
              ⌘⇧U
            </span>
          </span>
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
