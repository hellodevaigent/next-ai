"use client"

import { useKeyShortcut } from "@/lib/hooks/use-key-shortcut"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { NotePencilIcon } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useRouteVisibility } from "@/utils/route-visibility"

export function ButtonNewChat() {
  const router = useRouter()

  useKeyShortcut(
    (e) => (e.key === "u" || e.key === "U") && e.metaKey && e.shiftKey,
    () => router.push("/")
  )

  const { shouldHide } = useRouteVisibility({
    exact: ['/', '/settings'],
  })

  if (shouldHide()) {
    return null
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground hover:bg-muted bg-background rounded-full p-1.5 transition-colors"
          prefetch
          aria-label="New Chat"
        >
          <NotePencilIcon size={24} />
        </Link>
      </TooltipTrigger>
      <TooltipContent>New Chat ⌘⇧U</TooltipContent>
    </Tooltip>
  )
}
