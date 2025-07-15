"use client"

import { useSidebar } from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { cn } from "@/lib/utils"
import { SidebarSimpleIcon, XIcon } from "@phosphor-icons/react"

type HeaderSidebarTriggerProps = React.HTMLAttributes<HTMLButtonElement>

export function HeaderSidebarTrigger({
  className,
  ...props
}: HeaderSidebarTriggerProps) {
  const { toggleSidebar, open } = useSidebar()
  const isMobile = useBreakpoint(768)
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={toggleSidebar}
          className={cn(
            "pointer-events-auto cursor-pointer",
            "text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors",
            "inline-flex size-9 items-center justify-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
            className
          )}
          {...props}
        >
          {isMobile ? (
            <XIcon size={20} />
          ) : (
            <SidebarSimpleIcon size={20} />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{open ? "Close sidebar" : "Open sidebar"}</TooltipContent>
    </Tooltip>
  )
}
