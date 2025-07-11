import { useCallback, useEffect, useRef, useState } from "react"

export function useScrollToBottom() {
  const [isAtBottom, setIsAtBottom] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const shouldAutoScrollRef = useRef(true)
  const lastScrollTopRef = useRef(0)
  const lastMessageCountRef = useRef(0)
  const forceScrollOnNewMessageRef = useRef(false)

  const getScrollableElement = useCallback(() => {
    return viewportRef.current || containerRef.current
  }, [])

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const container = getScrollableElement()
    if (!container) return

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    })
    shouldAutoScrollRef.current = true
  }, [getScrollableElement])

  const checkIfAtBottom = useCallback(() => {
    const container = getScrollableElement()
    if (!container) return false

    const threshold = 100
    const isAtBottom = 
      container.scrollHeight - container.scrollTop - container.clientHeight <= threshold

    return isAtBottom
  }, [getScrollableElement])

  const handleScroll = useCallback(() => {
    const container = getScrollableElement()
    if (!container) return

    const currentScrollTop = container.scrollTop
    const isScrollingUp = currentScrollTop < lastScrollTopRef.current
    const atBottom = checkIfAtBottom()

    if (isScrollingUp && !atBottom) {
      shouldAutoScrollRef.current = false
    }

    if (atBottom) {
      shouldAutoScrollRef.current = true
    }

    setIsAtBottom(atBottom)
    lastScrollTopRef.current = currentScrollTop
  }, [checkIfAtBottom, getScrollableElement])

  const forceScrollToNewMessage = useCallback(() => {
    forceScrollOnNewMessageRef.current = true
    shouldAutoScrollRef.current = true
    scrollToBottom("smooth")
  }, [scrollToBottom])

  const handleMessageCountChange = useCallback((newMessageCount: number) => {
    const previousCount = lastMessageCountRef.current
    lastMessageCountRef.current = newMessageCount

    if (newMessageCount > previousCount && !isAtBottom) {
      forceScrollToNewMessage()
    }
  }, [isAtBottom, forceScrollToNewMessage])

  useEffect(() => {
    const container = getScrollableElement()
    if (!container) return

    container.addEventListener("scroll", handleScroll, { passive: true })
    
    handleScroll()

    return () => {
      container.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll, getScrollableElement])

  useEffect(() => {
    if (shouldAutoScrollRef.current || forceScrollOnNewMessageRef.current) {
      const timer = setTimeout(() => {
        scrollToBottom("smooth")
        forceScrollOnNewMessageRef.current = false
      }, 100)

      return () => clearTimeout(timer)
    }
  })

  return {
    containerRef,
    viewportRef,
    isAtBottom,
    scrollToBottom,
    shouldAutoScroll: shouldAutoScrollRef.current,
    forceScrollToNewMessage,
    handleMessageCountChange,
  }
}