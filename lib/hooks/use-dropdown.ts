import { useCallback, useEffect, useRef, useState } from "react"

interface DropdownPosition {
  top: number
  left: number
  width: number
}

interface UseDropdownOptions {
  onStateChange?: (isOpen: boolean) => void
  closeOnOutsideClick?: boolean
  closeOnEscape?: boolean
  offset?: number
  menuHeight?: number | ((triggerRect: DOMRect) => number)
  menuWidth?: number | ((triggerRect: DOMRect) => number)
  placement?: 'bottom' | 'top' | 'right' | 'left' | 'auto'
}

export function useDropdown(options: UseDropdownOptions = {}) {
  const {
    onStateChange,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    offset = 4,
    menuHeight = 200,
    menuWidth = (triggerRect) => triggerRect.width,
    placement = 'auto',
  } = options

  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 224,
  })
  const [mounted, setMounted] = useState(false)
  
  const triggerRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Mount effect for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate menu position
  const calculatePosition = useCallback(
    (customWidth?: number, customHeight?: number) => {
      if (!triggerRef.current) return

      const triggerRect = triggerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      
      // Calculate menu dimensions
      const calculatedHeight = customHeight || 
        (typeof menuHeight === 'function' ? menuHeight(triggerRect) : menuHeight)
      const calculatedWidth = customWidth || 
        (typeof menuWidth === 'function' ? menuWidth(triggerRect) : menuWidth)

      let top = triggerRect.bottom + offset
      let left = triggerRect.left

      // Position logic based on placement prop
      switch (placement) {
        case 'top':
          top = triggerRect.top - calculatedHeight - offset
          break
        case 'bottom':
          top = triggerRect.bottom + offset
          break
        case 'right':
          left = triggerRect.right + offset
          top = triggerRect.top
          break
        case 'left':
          left = triggerRect.left - calculatedWidth - offset
          top = triggerRect.top
          break
        case 'auto':
        default:
          // Auto positioning logic
          if (triggerRect.bottom + calculatedHeight + offset > viewportHeight) {
            top = triggerRect.top - calculatedHeight - offset
          } else {
            top = triggerRect.bottom + offset
          }
          break
      }

      // Ensure menu stays within viewport bounds
      if (top < 8) top = 8
      if (top + calculatedHeight > viewportHeight - 8) {
        top = viewportHeight - calculatedHeight - 8
      }

      if (left < 8) left = 8
      if (left + calculatedWidth > viewportWidth - 8) {
        left = viewportWidth - calculatedWidth - 8
      }

      setPosition({ top, left, width: calculatedWidth })
    },
    [offset, menuHeight, menuWidth, placement]
  )

  // Toggle dropdown
  const toggle = useCallback(
    (customWidth?: number, customHeight?: number) => {
      if (!isOpen) {
        calculatePosition(customWidth, customHeight)
      }
      setIsOpen(!isOpen)
    },
    [isOpen, calculatePosition]
  )

  // Open dropdown
  const open = useCallback(
    (customWidth?: number, customHeight?: number) => {
      calculatePosition(customWidth, customHeight)
      setIsOpen(true)
    },
    [calculatePosition]
  )

  // Close dropdown
  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Handle clicks outside menu
  useEffect(() => {
    if (!closeOnOutsideClick || !isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, closeOnOutsideClick])

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, closeOnEscape])

  // Handle window resize
  useEffect(() => {
    if (!isOpen) return

    const handleResize = () => calculatePosition()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isOpen, calculatePosition])

  // Notify state change
  useEffect(() => {
    onStateChange?.(isOpen)
  }, [isOpen, onStateChange])

  return {
    isOpen,
    position,
    mounted,
    triggerRef,
    menuRef,
    toggle,
    open,
    close,
  }
}