import React, { useCallback, useEffect, useRef, useState } from "react"

interface CustomScrollbarProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  className?: string
  showNavigationButtons?: boolean
}

const CustomScrollbar: React.FC<CustomScrollbarProps> = ({
  containerRef,
  className = "",
  showNavigationButtons = false,
}) => {
  const [scrollPos, setScrollPos] = useState(0)
  const [contentHeight, setContentHeight] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isTrackPressed, setIsTrackPressed] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [startScrollPos, setStartScrollPos] = useState(0)
  const thumbRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [trackHeight, setTrackHeight] = useState(0)
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const scrollDirectionRef = useRef<"up" | "down" | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const animationFrameRef = useRef<number | null>(null)

  const updateScrollInfo = useCallback(() => {
    if (!containerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    setScrollPos(scrollTop)
    setContentHeight(scrollHeight)
    setContainerHeight(clientHeight)

    if (trackRef.current) {
      const trackRect = trackRef.current.getBoundingClientRect()
      setTrackHeight(trackRect.height)
    }

    setIsVisible(scrollHeight > clientHeight)
  }, [containerRef])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!containerRef.current) return
      containerRef.current.scrollTop += e.deltaY
    },
    [containerRef]
  )
  
  const smoothScrollTo = useCallback(
    (targetScrollTop: number) => {
      if (!containerRef.current) return

      const startScrollTop = containerRef.current.scrollTop
      const distance = targetScrollTop - startScrollTop
      const duration = 300
      const startTime = performance.now()

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        const easeOut = 1 - Math.pow(1 - progress, 3)

        const currentScrollTop = startScrollTop + distance * easeOut

        if (containerRef.current) {
          containerRef.current.scrollTop = currentScrollTop
        }

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animateScroll)
        } else {
          animationFrameRef.current = null
        }
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      animationFrameRef.current = requestAnimationFrame(animateScroll)
    },
    [containerRef]
  )

  const handleScrollbarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (
        !containerRef.current ||
        !trackRef.current ||
        e.target === thumbRef.current
      ) {
        return
      }

      const trackRect = trackRef.current.getBoundingClientRect()
      const thumbHeight = Math.max(
        (containerHeight / contentHeight) * trackHeight,
        30
      )
      const clickPositionInTrack = e.clientY - trackRect.top - thumbHeight / 2
      const maxThumbPosition = trackHeight - thumbHeight
      const scrollRatio = Math.max(
        0,
        Math.min(1, clickPositionInTrack / maxThumbPosition)
      )
      const targetScrollTop = scrollRatio * (contentHeight - containerHeight)

      smoothScrollTo(targetScrollTop)
    },
    [containerRef, contentHeight, containerHeight, trackHeight, smoothScrollTo]
  )

  const handleTrackMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === thumbRef.current) return

      setIsTrackPressed(true)
      handleScrollbarClick(e)
    },
    [handleScrollbarClick]
  )

  const handleTrackMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isTrackPressed || !containerRef.current || !trackRef.current) return

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      const trackRect = trackRef.current.getBoundingClientRect()
      const thumbHeight = Math.max(
        (containerHeight / contentHeight) * trackHeight,
        30
      )
      const clickPositionInTrack = e.clientY - trackRect.top - thumbHeight / 2
      const maxThumbPosition = trackHeight - thumbHeight
      const scrollRatio = Math.max(
        0,
        Math.min(1, clickPositionInTrack / maxThumbPosition)
      )
      const targetScrollTop = scrollRatio * (contentHeight - containerHeight)

      containerRef.current.scrollTop = targetScrollTop
    },
    [isTrackPressed, containerRef, contentHeight, containerHeight, trackHeight]
  )

  const handleThumbMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
      setDragStartY(e.clientY)
      setStartScrollPos(scrollPos)

      document.body.style.cursor = "default"
      document.body.style.userSelect = "none"
    },
    [scrollPos]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const deltaY = e.clientY - dragStartY
      const thumbHeight = Math.max(
        (containerHeight / contentHeight) * trackHeight,
        30
      )
      const scrollableDist = contentHeight - containerHeight
      const trackScrollableDist = trackHeight - thumbHeight

      if (trackScrollableDist <= 0) return

      const scrollRatio = scrollableDist / trackScrollableDist
      const newScrollTop = startScrollPos + deltaY * scrollRatio

      containerRef.current.scrollTop = Math.max(
        0,
        Math.min(newScrollTop, scrollableDist)
      )
    },
    [
      isDragging,
      dragStartY,
      startScrollPos,
      contentHeight,
      containerHeight,
      trackHeight,
    ]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsTrackPressed(false)

    document.body.style.cursor = "default"
    document.body.style.userSelect = "auto"
  }, [])

  const startContinuousScroll = useCallback(
    (direction: "up" | "down") => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current)
      }

      scrollDirectionRef.current = direction

      const scroll = () => {
        if (!containerRef.current) return
        const scrollAmount = 20

        if (direction === "up") {
          containerRef.current.scrollTop = Math.max(
            0,
            containerRef.current.scrollTop - scrollAmount
          )
        } else {
          containerRef.current.scrollTop = Math.min(
            contentHeight - containerHeight,
            containerRef.current.scrollTop + scrollAmount
          )
        }
      }
      scroll()
      scrollIntervalRef.current = setInterval(scroll, 50)
    },
    [containerRef, contentHeight, containerHeight]
  )

  const stopContinuousScroll = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
    scrollDirectionRef.current = null
  }, [])

  const handleUpArrowClick = useCallback(() => {
    if (!containerRef.current) return
    const targetScrollTop = Math.max(0, scrollPos - 50)
    smoothScrollTo(targetScrollTop)
  }, [containerRef, scrollPos, smoothScrollTo])

  const handleDownArrowClick = useCallback(() => {
    if (!containerRef.current) return
    const targetScrollTop = Math.min(
      contentHeight - containerHeight,
      scrollPos + 50
    )
    smoothScrollTo(targetScrollTop)
  }, [containerRef, scrollPos, contentHeight, containerHeight, smoothScrollTo])

  useEffect(() => {
    const checkContentSize = () => {
      if (!containerRef.current) return
      const { scrollHeight, clientHeight } = containerRef.current
      setIsVisible(scrollHeight > clientHeight)
    }
    checkContentSize()
    const observer = new MutationObserver(checkContentSize)
    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
      })
    }
    const initialCheckTimeout = setTimeout(checkContentSize, 500)
    return () => {
      observer.disconnect()
      clearTimeout(initialCheckTimeout)
    }
  }, [containerRef])

  useEffect(() => {
    const handleScroll = () => updateScrollInfo()
    const handleResize = () => {
      updateScrollInfo()
      if (containerRef.current) {
        const { scrollHeight, clientHeight } = containerRef.current
        setIsVisible(scrollHeight > clientHeight)
      }
    }

    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e)
    const handleGlobalMouseUp = () => {
      handleMouseUp()
      stopContinuousScroll()
    }

    if (containerRef.current) {
      containerRef.current.addEventListener("scroll", handleScroll)
    }
    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleGlobalMouseMove)
    window.addEventListener("mouseup", handleGlobalMouseUp)
    window.addEventListener("mouseleave", handleGlobalMouseUp)

    updateScrollInfo()
    const initialUpdateTimeout = setTimeout(updateScrollInfo, 200)

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener("scroll", handleScroll)
      }
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleGlobalMouseMove)
      window.removeEventListener("mouseup", handleGlobalMouseUp)
      window.removeEventListener("mouseleave", handleGlobalMouseUp)

      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      clearTimeout(initialUpdateTimeout)
    }
  }, [
    containerRef,
    updateScrollInfo,
    handleMouseMove,
    handleMouseUp,
    stopContinuousScroll,
  ])

  const scrollThumbSize = Math.max(
    containerHeight > 0 ? (containerHeight / contentHeight) * trackHeight : 0,
    30
  )
  const maxScrollThumbPos = trackHeight > 0 ? trackHeight - scrollThumbSize : 0
  const rawScrollThumbPos =
    contentHeight > containerHeight
      ? (scrollPos / (contentHeight - containerHeight)) *
        (trackHeight - scrollThumbSize)
      : 0
  const scrollThumbPos = Math.min(rawScrollThumbPos, maxScrollThumbPos)

  const widthClasses = "w-[7px]"
  const iconSize = "text-[7px] xl:text-[10px]"

  if (!isVisible) return null

  return (
    <div
      className={`custom-scrollbar-container ${widthClasses} max-md:!hidden ${className}`}
      onWheel={handleWheel}
    >
      {showNavigationButtons && (
        <button
          className={`${iconSize} text-gray-500`}
          onClick={handleUpArrowClick}
          onMouseDown={() => startContinuousScroll("up")}
          onMouseUp={stopContinuousScroll}
          onMouseLeave={stopContinuousScroll}
        >
          ▲
        </button>
      )}
      <div
        ref={trackRef}
        className={`custom-scroll-track ${widthClasses} `}
        onMouseDown={handleTrackMouseDown}
        onMouseMove={handleTrackMouseMove}
      >
        <div
          ref={thumbRef}
          className={`custom-scroll-thumb ${widthClasses} bg-accent/70 hover:bg-accent rounded-2xl transition-colors duration-150 ${isDragging ? "bg-accent" : ""}`}
          style={{ height: `${scrollThumbSize}px`, top: `${scrollThumbPos}px` }}
          onMouseDown={handleThumbMouseDown}
        />
      </div>
      {showNavigationButtons && (
        <button
          className={`${iconSize} text-gray-500`}
          onClick={handleDownArrowClick}
          onMouseDown={() => startContinuousScroll("down")}
          onMouseUp={stopContinuousScroll}
          onMouseLeave={stopContinuousScroll}
        >
          ▼
        </button>
      )}
    </div>
  )
}

export default CustomScrollbar
