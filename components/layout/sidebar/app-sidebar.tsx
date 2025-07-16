"use client"

import { SidebarChatSkeleton } from "@/components/skeleton/sidebar-skeleton"
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { APP_NAME } from "@/lib/config"
import { useBreakpoint } from "@/lib/hooks/use-breakpoint"
import { useChats } from "@/lib/store/chat-store/chats/provider"
import { Chats } from "@/lib/store/chat-store/types"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  MagnifyingGlass,
  NotePencilIcon,
} from "@phosphor-icons/react"
import { FolderPlusIcon } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { lazy, memo, Suspense, useCallback, useMemo, useState } from "react"
import { HistoryTrigger } from "../../history/history-trigger"
import { HeaderSidebarTrigger } from "../header-sidebar-trigger"
import { SidebarList } from "./sidebar-list"

// Lazy load heavy components
const HistoryContent = lazy(() =>
  import("../../history/history-content").then((module) => ({
    default: module.HistoryContent,
  }))
)

const UserMenuSidebar = lazy(() =>
  import("./user-menu-sidebar").then((module) => ({
    default: module.UserMenuSidebar,
  }))
)

// Types
interface NavigationButtonsProps {
  open: boolean
  setOpenMobile: (open: boolean) => void
  router: ReturnType<typeof useRouter>
  isMobile: boolean
  handleSearchClick: () => void
}

interface ChatContentProps {
  isLoading: boolean
  hasChats: boolean
  chats: Chats[]
  favorites: string[]
  currentChatId: string
  open: boolean
}

// Memoize navigation buttons
const NavigationButtons = memo<NavigationButtonsProps>(
  ({ open, setOpenMobile, router, isMobile, handleSearchClick }) => (
    <div className="bg-sidebar sticky top-0 z-40 flex w-full flex-col items-start gap-0 border-b p-2">
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
            "flex w-full items-center justify-between gap-2 text-nowrap transition-opacity duration-300",
            open ? "opacity-100" : "md:opacity-0"
          )}
        >
          New Chat
          <span className="text-muted-foreground ml-auto text-xs opacity-0 transition-opacity duration-150 group-hover/new-chat:opacity-100">
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
              "flex w-full items-center justify-between gap-2 text-nowrap transition-opacity duration-300",
              open ? "opacity-100" : "md:opacity-0"
            )}
          >
            <span>Search</span>
            <div className="text-muted-foreground ml-auto text-xs opacity-0 transition-opacity duration-150 group-hover/search:opacity-100">
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
                "flex w-full items-center justify-between gap-2 text-nowrap transition-opacity duration-300",
                open ? "opacity-100" : "md:opacity-0"
              )}
            >
              <span>Search</span>
              <div className="text-muted-foreground ml-auto text-xs opacity-0 transition-opacity duration-150 group-hover/search:opacity-100">
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
          className={cn(
            "flex w-full items-center justify-between gap-2 text-nowrap transition-opacity duration-300",
            open ? "opacity-100" : "md:opacity-0"
          )}
        >
          Project
          <span className="text-muted-foreground ml-auto text-xs opacity-0 transition-opacity duration-150 group-hover/new-chat:opacity-100">
            ⌘⇧U
          </span>
        </span>
      </button>
    </div>
  )
)

NavigationButtons.displayName = "NavigationButtons"

// Memoize chat content
const ChatContent = memo<ChatContentProps>(
  ({ isLoading, hasChats, chats, favorites, currentChatId, open }) => {
    // Separate chats into favorites and recent
    const { favoriteChats, recentChats } = useMemo(() => {
      const favoriteChats = chats.filter((chat) => favorites.includes(chat.id))
      const recentChats = chats.filter((chat) => !favorites.includes(chat.id))
      return { favoriteChats, recentChats }
    }, [chats, favorites])

    if (isLoading) {
      return <SidebarChatSkeleton />
    }

    if (hasChats) {
      return (
        <div className={cn("w-full px-2", open ? "block" : "hidden")}>
          {/* Starred/Favorite chats */}
          <SidebarList
            title="Starred"
            items={favoriteChats}
            currentChatId={currentChatId}
          />

          {/* Recent chats */}
          <SidebarList
            title="Recent"
            items={recentChats}
            currentChatId={currentChatId}
          />
        </div>
      )
    }

    return (
      <ul className="mt-3 flex w-full min-w-0 flex-col gap-0.5">
        <div className="border-border mx-2 h-16 content-center rounded-lg border px-8 text-center text-xs text-gray-500">
          You haven't created any chats yet.
        </div>
      </ul>
    )
  }
)

ChatContent.displayName = "ChatContent"

// Loading fallback component
const LoadingFallback = memo(() => (
  <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
))

LoadingFallback.displayName = "LoadingFallback"

// History loading fallback
const HistoryLoadingFallback = memo(() => (
  <div className="p-4 text-center text-sm text-gray-500">
    Loading history...
  </div>
))

HistoryLoadingFallback.displayName = "HistoryLoadingFallback"

export function AppSidebar() {
  const { open, setOpenMobile } = useSidebar()
  const { chats, isLoading, favorites } = useChats()
  const params = useParams()
  const currentChatId = params.chatId
  const isMobile = useBreakpoint(768)
  const router = useRouter()

  const [showHistory, setShowHistory] = useState<boolean>(false)

  // Memoize computed values
  const hasChats = useMemo((): boolean => chats.length > 0, [chats.length])

  // Memoize callbacks
  const handleBackToSidebar = useCallback((): void => {
    setShowHistory(false)
  }, [])

  const handleSearchClick = useCallback((): void => {
    if (isMobile) {
      setShowHistory(true)
    }
  }, [isMobile])

  // Memoize main content
  const mainContent = useMemo(
    () => (
      <div>
        <NavigationButtons
          open={open}
          setOpenMobile={setOpenMobile}
          router={router}
          isMobile={isMobile}
          handleSearchClick={handleSearchClick}
        />

        <div
          className={cn(
            !isMobile &&
              "scrollbar-sidebar overflow-y-auto md:block md:h-[calc(100vh_-_233px)] md:mask-b-from-95% md:mask-b-to-100% md:pt-1.5"
          )}
        >
          <ChatContent
            isLoading={isLoading}
            hasChats={hasChats}
            chats={chats}
            favorites={favorites}
            currentChatId={currentChatId as string}
            open={open}
          />
        </div>
      </div>
    ),
    [
      open,
      setOpenMobile,
      router,
      isMobile,
      handleSearchClick,
      isLoading,
      hasChats,
      chats,
      favorites,
      currentChatId,
    ]
  )

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="overflow-hidden border-none"
    >
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
              "pointer-events-auto mr-2 inline-flex items-center text-xl font-medium tracking-tight transition-opacity duration-200",
              open ? "opacity-100" : "opacity-0"
            )}
            onClick={() => setOpenMobile(false)}
          >
            {APP_NAME}
          </Link>
        </div>
      </SidebarHeader>

      <div
        className={cn(
          "relative flex-1 overflow-hidden",
          isMobile ? "scrollbar-sidebar overflow-y-auto" : ""
        )}
      >
        <div
          className={cn(
            "absolute inset-0 w-full transition-transform duration-300 ease-in-out",
            showHistory && isMobile ? "-translate-x-full" : "translate-x-0"
          )}
        >
          {mainContent}
        </div>

        {isMobile && (
          <div
            className={cn(
              "scrollbar-sidebar absolute inset-0 flex h-full w-full flex-col overflow-y-auto transition-transform duration-300 ease-in-out",
              showHistory ? "translate-x-0" : "translate-x-full"
            )}
          >
            <Suspense fallback={<HistoryLoadingFallback />}>
              <HistoryContent chatHistory={chats} isDialog={false} classInput="!border-none !rounded-none" />
            </Suspense>
          </div>
        )}
      </div>

      {!showHistory && (
        <SidebarFooter className="p-2">
          <Suspense fallback={<LoadingFallback />}>
            <UserMenuSidebar />
          </Suspense>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
