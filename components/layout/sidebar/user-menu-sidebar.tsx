"use client"

import XIcon from "@/components/icons/x"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownPortal } from "@/components/ui/dropdown-portal"
import { useSidebar } from "@/components/ui/sidebar"
import { useBreakpoint } from "@/lib/hooks/use-breakpoint"
import { useDropdown } from "@/lib/hooks/use-dropdown"
import { useSignOut } from "@/lib/hooks/use-sign-out"
import { useUser } from "@/lib/store/user-store/provider"
import { cn } from "@/lib/utils"
import { GithubLogoIcon } from "@phosphor-icons/react"
import { LogOut, UserIcon } from "lucide-react"
import Link from "next/link"
import { useCallback, useMemo } from "react"

export function UserMenuSidebar() {
  const { user } = useUser()
  const { open, setOpenMobile } = useSidebar()
  const isMobile = useBreakpoint(768)
  const { handleSignOut } = useSignOut()

  const { isOpen, position, mounted, triggerRef, menuRef, toggle, close } =
    useDropdown({
      placement: isMobile ? "top" : open ? "top" : "right",
      offset: isMobile ? 12 : open ? 0 : 10,
    })

  const handleToggle = useCallback(() => {
    const customHeight = isMobile ? 213 : 220
    const customWidth = open ? undefined : 224
    toggle(customWidth, customHeight)
  }, [toggle, open])

  const avatarSize = useMemo(() => (open ? "" : "!size-7"), [open])

  const handleMenuClose = () => {
    close()
    setOpenMobile(false)
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        ref={triggerRef as React.RefObject<HTMLButtonElement>}
        onClick={handleToggle}
        className={cn(
          "text-primary relative inline-flex w-full items-center gap-2 rounded-md bg-transparent p-1 text-sm transition-all duration-300",
          isOpen ? "bg-accent/50 ring-border ring-1" : "",
          open ? "hover:bg-accent/80 hover:text-foreground" : ""
        )}
      >
        <Avatar
          className={cn(
            "bg-background hover:bg-muted transition-all",
            avatarSize
          )}
        >
          <AvatarImage
            className={cn("transition-all", avatarSize)}
            src={user?.profile_image ?? undefined}
          />
          <AvatarFallback className={cn("transition-all", avatarSize)}>
            {user?.display_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <span
          className={cn(
            "flex w-full items-center justify-between gap-2 text-nowrap duration-200",
            open ? "opacity-100" : "md:opacity-0"
          )}
        >
          <span className="flex flex-col items-start text-sm">
            <span>{user?.display_name}</span>
            <span className="text-muted-foreground -mt-[2px] max-w-full truncate text-xs">
              {user?.email}
            </span>
          </span>
        </span>
      </button>

      <DropdownPortal
        ref={menuRef}
        isOpen={isOpen}
        mounted={mounted}
        position={position}
      >
        <div className="flex flex-col items-start gap-0 px-2 py-1.5 text-sm">
          <span>{user?.display_name}</span>
          <span className="text-muted-foreground max-w-full truncate">
            {user?.email}
          </span>
        </div>

        <div className="bg-border my-1 h-px" />

        <div className="px-1">
          <Link
            href="/settings"
            className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none"
            onClick={handleMenuClose}
          >
            <UserIcon className="size-4" />
            <span>Settings</span>
          </Link>
        </div>

        <div className="bg-border my-1 h-px" />

        <div className="px-1">
          <a
            href="https://x.com/zoladotchat"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none"
            onClick={handleMenuClose}
          >
            <XIcon className="size-4 p-0.5" />
            <span>@zoladotchat</span>
          </a>

          <a
            href="https://github.com/ibelick/zola"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none"
            onClick={handleMenuClose}
          >
            <GithubLogoIcon className="size-4" />
            <span>GitHub</span>
          </a>
        </div>

        <div className="bg-border my-1 h-px" />

        <div className="px-1 pb-1">
          <button
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-red-500 outline-none hover:bg-red-200"
            onClick={() => {
              handleMenuClose()
              handleSignOut()
            }}
          >
            <LogOut className="size-5 p-0.5" />
            <span>Logout</span>
          </button>
        </div>
      </DropdownPortal>
    </div>
  )
}