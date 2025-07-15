"use client"

import { useKeyShortcut } from "@/hooks/use-key-shortcut"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { SquarePen } from "lucide-react"

export function ButtonNewChat() {
  const pathname = usePathname()
  const router = useRouter()

  useKeyShortcut(
    (e) => (e.key === "u" || e.key === "U") && e.metaKey && e.shiftKey,
    () => router.push("/")
  )

  if (["/", "/projects", "/settings"].includes(pathname)) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground hover:bg-muted bg-background rounded-full p-1.25 transition-colors border"
          prefetch
          aria-label="New Chat"
        >
          <SquarePen className="size-4"/>
        </Link>
      </TooltipTrigger>
      <TooltipContent>New Chat ⌘⇧U</TooltipContent>
    </Tooltip>
  )
}
