"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useKeyShortcut } from "@/lib/hooks/use-key-shortcut"
import { useIsPathExcluded } from "@/lib/hooks/use-path-check"
import { NotePencil } from "@phosphor-icons/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function ButtonNewChat() {
  const router = useRouter()
  const isExcluded = useIsPathExcluded(["/", "/projects", "/settings"])

  useKeyShortcut(
    (e) => (e.key === "u" || e.key === "U") && e.metaKey && e.shiftKey,
    () => router.push("/")
  )

  if (isExcluded) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground hover:bg-muted bg-background pointer-events-auto rounded-full border p-1.5 transition-colors"
          prefetch
          aria-label="New Chat"
        >
          <NotePencil size={18} />
        </Link>
      </TooltipTrigger>
      <TooltipContent>New Chat ⌘⇧U</TooltipContent>
    </Tooltip>
  )
}
