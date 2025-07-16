"use client"

import XIcon from "@/components/icons/x"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUser } from "@/lib/store/user-store/provider"
import { GithubLogoIcon } from "@phosphor-icons/react"
import { UserIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { AppInfoTrigger } from "../app-info/app-info-trigger"
import { FeedbackTrigger } from "../feedback/feedback-trigger"
import { useIsPathExcluded } from "@/lib/hooks/use-path-check"

export function UserMenu() {
  const { user } = useUser()
  const isExcluded = useIsPathExcluded(["/settings"])

  const [isMenuOpen, setMenuOpen] = useState(false)

  if (!user || isExcluded) return null
  
  return (
    // fix shadcn/ui / radix bug when dialog into dropdown menu
    <DropdownMenu open={isMenuOpen} onOpenChange={setMenuOpen} modal={false}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger>
            <Avatar className="!size-7 bg-background hover:bg-muted">
              <AvatarImage className="!size-7" src={user?.profile_image ?? undefined} />
              <AvatarFallback className="!size-7">{user?.display_name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Profile</TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        className="w-56"
        align="end"
        sideOffset={8}
        forceMount
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          setMenuOpen(false)
        }}
      >
        <DropdownMenuItem className="flex flex-col items-start gap-0 no-underline hover:bg-transparent focus:bg-transparent">
          <span>{user?.display_name}</span>
          <span className="text-muted-foreground max-w-full truncate">
            {user?.email}
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex w-full items-center">
            <UserIcon className="size-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <FeedbackTrigger />
        <AppInfoTrigger />
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a
            href="https://x.com/zoladotchat"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <XIcon className="size-4 p-0.5" />
            <span>@zoladotchat</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href="https://github.com/ibelick/zola"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <GithubLogoIcon className="size-4" />
            <span>GitHub</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
