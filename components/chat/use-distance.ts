import { useRef, useState } from "react"

export function useContainerDistance() {
  const [isOverflowing, setIsOverflowing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const checkContainerOverflow = () => {
    if (!containerRef.current) return false

    const container = containerRef.current
    const containerHeight = container.clientHeight
    const scrollHeight = container.scrollHeight
    const scrollTop = container.scrollTop
    
    // Hitung jarak dari bottom
    const distanceFromBottom = scrollHeight - (scrollTop + containerHeight)
    
    // Log informasi container
    console.log('Container Info:', {
      containerHeight,
      scrollHeight,
      scrollTop,
      distanceFromBottom,
      isOverflowing: scrollHeight > containerHeight
    })
    
    // Return true jika content melebihi container
    const overflow = scrollHeight > containerHeight
    setIsOverflowing(overflow)
    
    return overflow
  }

  return {
    containerRef,
    isOverflowing,
    checkContainerOverflow
  }
}