import { cn } from "@/lib/utils"
import { forwardRef, ReactNode } from "react"
import { createPortal } from "react-dom"

interface DropdownPortalProps {
  children: ReactNode
  isOpen: boolean
  mounted: boolean
  position: {
    top: number
    left: number
    width: number
  }
  className?: string
  style?: React.CSSProperties
}

export const DropdownPortal = forwardRef<HTMLDivElement, DropdownPortalProps>(
  ({ children, isOpen, mounted, position, className, style }, ref) => {
    if (!isOpen || !mounted) return null

    return createPortal(
      <div
        ref={ref}
        className={cn(
          "bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 pointer-events-auto fixed rounded-md border shadow-md",
          className
        )}
        style={{
          top: position.top,
          left: position.left,
          width: position.width,
          zIndex: 50,
          ...style,
        }}
      >
        {children}
      </div>,
      document.body
    )
  }
)

DropdownPortal.displayName = "DropdownPortal"
