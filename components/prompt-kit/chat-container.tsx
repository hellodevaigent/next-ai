"use client"

import { useScrollToBottom } from "@/lib/hooks/use-scroll-bottom"
import { cn } from "@/lib/utils"
import { createContext, useContext } from "react"
import CustomScrollbar from "../common/custom-scrollbar"

type ScrollContextType = {
  isAtBottom: boolean
  scrollToBottom: (behavior?: ScrollBehavior) => void
  shouldAutoScroll: boolean
  forceScrollToNewMessage: () => void
  handleMessageCountChange: (newMessageCount: number) => void
}

const ScrollContext = createContext<ScrollContextType | null>(null)

export function useScrollContext() {
  const context = useContext(ScrollContext)
  if (!context) {
    throw new Error("useScrollContext must be used within a ChatContainerRoot")
  }
  return context
}

export type ChatContainerRootProps = {
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLDivElement>

export type ChatContainerContentProps = {
  children: React.ReactNode
  className?: string
  ref?: React.RefObject<HTMLDivElement>
} & React.HTMLAttributes<HTMLDivElement>

export type ChatContainerScrollAnchorProps = {
  className?: string
  ref?: React.RefObject<HTMLDivElement>
} & React.HTMLAttributes<HTMLDivElement>

function ChatContainerRoot({
  children,
  className,
  ...props
}: ChatContainerRootProps) {
  const { 
    containerRef, 
    isAtBottom, 
    scrollToBottom, 
    shouldAutoScroll, 
    forceScrollToNewMessage,
    handleMessageCountChange 
  } = useScrollToBottom()

  return (
    
    <ScrollContext.Provider value={{ 
      isAtBottom, 
      scrollToBottom, 
      shouldAutoScroll, 
      forceScrollToNewMessage,
      handleMessageCountChange 
    }}>
      <div
        ref={containerRef}
        className={cn("flex hidden-scrollbar", className)}
        role="log"
        {...props}
      >
        {children}
      </div>
      <CustomScrollbar
        containerRef={containerRef}
        className="!right-[2.5px]"
      />
    </ScrollContext.Provider>
  )
}

function ChatContainerContent({
  children,
  className,
  ...props
}: ChatContainerContentProps) {
  return (
    <div

      className={cn("flex w-full flex-col", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function ChatContainerScrollAnchor({
  className,
  ...props
}: ChatContainerScrollAnchorProps) {
  return (
    <div
      className={cn("h-px w-full shrink-0 scroll-mt-4", className)}
      aria-hidden="true"
      {...props}
    />
  )
}

export { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor }