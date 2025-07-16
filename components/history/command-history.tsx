// "use client"

// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip"
// import { useChatPreview } from "@/lib/hooks/use-chat-preview"
// import { useKeyShortcut } from "@/lib/hooks/use-key-shortcut"
// import { useChatSession } from "@/lib/store/chat-store/session/provider"
// import type { Chats } from "@/lib/store/chat-store/types"
// import { useChatSearchHistory } from "@/lib/store/chat-store/use-chat"
// import { useUserPreferences } from "@/lib/store/user-preference-store/provider"
// import { cn } from "@/lib/utils"
// import {
//   ChatTeardropDots,
//   MagnifyingGlass,
//   MagnifyingGlassIcon,
//   Trash,
// } from "@phosphor-icons/react"
// import { DialogTrigger } from "@radix-ui/react-dialog"
// import { XIcon } from "lucide-react"
// import { useRouter } from "next/navigation"
// import { lazy, memo, useCallback, useMemo, useRef, useState } from "react"
// import { formatDate, groupChatsByDate } from "./utils"

// const ChatFullPreviewPanel = lazy(() =>
//   import("./chat-preview-panel").then((module) => ({
//     default: module.ChatPreviewPanel,
//   }))
// )

// type CommandHistoryProps = {
//   chatHistory: Chats[]
//   trigger?: React.ReactNode
//   isOpen?: boolean
//   setIsOpen?: (open: boolean) => void
//   onOpenChange?: (open: boolean) => void
//   hasPopover?: boolean
//   isDialog?: boolean
//   className?: string
// }

// type CommandItemRowProps = {
//   chat: Chats
//   isSearchItem?: boolean
//   isCurrentChat?: boolean
// }

// // Constants
// const INITIAL_RENDER_COUNT = 20
// const LOAD_MORE_COUNT = 20

// // Memoized components
// const CommandItemRow = memo<CommandItemRowProps>(
//   ({ chat, isSearchItem = false, isCurrentChat = false }) => {
//     const formattedDate = useMemo(
//       () => formatDate(chat.created_at),
//       [chat.created_at]
//     )
//     const chatTitle = useMemo(
//       () => chat?.title || (isSearchItem ? "Untitled Search" : "Untitled Chat"),
//       [chat.title, isSearchItem]
//     )

//     return (
//       <>
//         <div className="flex min-w-0 flex-1 items-center gap-2">
//           {isSearchItem ? (
//             <MagnifyingGlass className="text-muted-foreground h-4 w-4 flex-shrink-0" />
//           ) : (
//             <ChatTeardropDots className="text-muted-foreground h-4 w-4 flex-shrink-0" />
//           )}
//           <span className="line-clamp-1 text-sm font-normal">{chatTitle}</span>
//           {isCurrentChat && !isSearchItem && (
//             <Badge variant="outline">current</Badge>
//           )}
//         </div>

//         <div className="relative flex min-w-[140px] flex-shrink-0 items-center justify-end">
//           <div className="text-muted-foreground mr-2 text-xs">
//             {formattedDate}
//           </div>
//         </div>
//       </>
//     )
//   }
// )

// CommandItemRow.displayName = "CommandItemRow"

// const ChatItem = memo<{
//   chat: Chats
//   isSearchItem?: boolean
//   chatItemProps: any
// }>(({ chat, isSearchItem = false, chatItemProps }) => {
//   const {
//     handleSelectChat,
//     selectedChatId,
//     preferences,
//     currentChatId,
//     onChatHover,
//   } = chatItemProps

//   const isCurrentChat = chat.id === currentChatId
//   const isSelected = chat.id === selectedChatId

//   const handleClick = useCallback(() => {
//     handleSelectChat(chat)
//   }, [chat, handleSelectChat])

//   const handleMouseEnter = useCallback(() => {
//     if (!isSearchItem) {
//       onChatHover?.(chat.id)
//     }
//   }, [chat.id, isSearchItem, onChatHover])

//   return (
//     <div
//       key={chat.id}
//       className={cn(
//         "group flex w-full cursor-pointer items-center justify-between rounded-md py-2",
//         isSelected && preferences.showConversationPreviews && "bg-accent/50",
//         "hover:bg-accent/50 pl-2"
//       )}
//       onClick={handleClick}
//       onMouseEnter={handleMouseEnter}
//     >
//       <CommandItemRow
//         chat={chat}
//         isSearchItem={isSearchItem}
//         isCurrentChat={isCurrentChat}
//       />
//     </div>
//   )
// })

// ChatItem.displayName = "ChatItem"

// const VirtualizedChatList = memo<{
//   chats: Chats[]
//   renderCount: number
//   isSearchItem?: boolean
//   chatItemProps: any
// }>(({ chats, renderCount, isSearchItem = false, chatItemProps }) => {
//   const visibleChats = useMemo(
//     () => chats.slice(0, renderCount),
//     [chats, renderCount]
//   )

//   return (
//     <>
//       {visibleChats.map((chat) => (
//         <ChatItem
//           key={chat.id}
//           chat={chat}
//           isSearchItem={isSearchItem}
//           chatItemProps={chatItemProps}
//         />
//       ))}
//     </>
//   )
// })

// VirtualizedChatList.displayName = "VirtualizedChatList"

// const ChatPreviewPanel = memo<{
//   chatId: string | null
//   onHover: (isHovering: boolean) => void
//   messages: any[]
//   isLoading: boolean
//   error: any
// }>(({ chatId, onHover, messages, isLoading, error }) => {
//   const handleMouseEnter = useCallback(() => onHover(true), [onHover])
//   const handleMouseLeave = useCallback(() => onHover(false), [onHover])

//   return (
//     <div
//       className="bg-background h-full w-full p-4"
//       onMouseEnter={handleMouseEnter}
//       onMouseLeave={handleMouseLeave}
//     >
//       {!chatId ? (
//         <div className="text-muted-foreground text-center">
//           Hover over a chat to see preview
//         </div>
//       ) : isLoading ? (
//         <div className="text-muted-foreground text-center">
//           Loading preview...
//         </div>
//       ) : error ? (
//         <div className="text-destructive text-center">
//           Error loading preview
//         </div>
//       ) : (
//         <div className="space-y-2">
//           {messages.map((message, index) => (
//             <div key={index} className="text-sm">
//               <div className="font-medium">{message.role}</div>
//               <div className="text-muted-foreground line-clamp-3">
//                 {message.content}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// })

// ChatPreviewPanel.displayName = "ChatPreviewPanel"

// // New component for the main content
// const CommandHistoryContent = memo<{
//   chatHistory: Chats[]
//   isDialog?: boolean
//   onClose?: () => void
// }>(({ chatHistory, isDialog = true, onClose }) => {
//   const { chatId } = useChatSession()
//   const router = useRouter()
//   const { preferences } = useUserPreferences()
//   const hasPrefetchedRef = useRef(false)

//   const [searchQuery, setSearchQuery] = useState("")
//   const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
//   const [hoveredChatId, setHoveredChatId] = useState<string | null>(null)
//   const [isPreviewPanelHovered, setIsPreviewPanelHovered] = useState(false)
//   const [renderCount, setRenderCount] = useState(INITIAL_RENDER_COUNT)
//   const [searchRenderCount, setSearchRenderCount] = useState(INITIAL_RENDER_COUNT)

//   const { messages, isLoading, error, fetchPreview, clearPreview } = useChatPreview()
//   const {
//     searchHistory,
//     saveSearch,
//     clearHistory,
//     isLoading: isLoadingHistory,
//   } = useChatSearchHistory()

//   // Prefetch optimization
//   if (!hasPrefetchedRef.current) {
//     const recentChats = chatHistory.slice(0, 10)
//     recentChats.forEach((chat) => {
//       router.prefetch(`/c/${chat.id}`)
//     })
//     hasPrefetchedRef.current = true
//   }

//   const handleChatHover = useCallback(
//     (chatId: string | null) => {
//       if (!preferences.showConversationPreviews) return

//       setHoveredChatId(chatId)

//       if (chatId) {
//         fetchPreview(chatId)
//       }
//     },
//     [preferences.showConversationPreviews, fetchPreview]
//   )

//   const handlePreviewHover = useCallback(
//     (isHovering: boolean) => {
//       if (!preferences.showConversationPreviews) return

//       setIsPreviewPanelHovered(isHovering)

//       if (!isHovering && !hoveredChatId) {
//         setHoveredChatId(null)
//       }
//     },
//     [preferences.showConversationPreviews, hoveredChatId]
//   )

//   const convertSearchToChat = useCallback((searchItem: any): Chats => {
//     return {
//       id: `search-${searchItem.id}`,
//       title: searchItem.query,
//       created_at: new Date(searchItem.timestamp).toISOString(),
//       updated_at: new Date(searchItem.timestamp).toISOString(),
//       user_id: "",
//       model: null,
//       project_id: null,
//       public: false,
//     }
//   }, [])

//   const filteredChat = useMemo(() => {
//     const query = searchQuery.toLowerCase()
//     return query
//       ? chatHistory.filter((chat) =>
//           (chat.title || "").toLowerCase().includes(query)
//         )
//       : chatHistory
//   }, [chatHistory, searchQuery])

//   const groupedChats = useMemo(
//     () => groupChatsByDate(chatHistory, searchQuery),
//     [chatHistory, searchQuery]
//   )

//   const handleSelectChat = useCallback(
//     (chat: Chats) => {
//       if (chat.id.startsWith("search-")) {
//         const searchQuery = chat.title || ""
//         setSearchQuery(searchQuery)
//         return
//       }

//       if (preferences.showConversationPreviews) {
//         setSelectedChatId(chat.id)
//       }

//       if (isDialog && onClose) {
//         onClose()
//       }

//       if (searchQuery.trim()) {
//         saveSearch(searchQuery.trim())
//       }
//       router.push(`/c/${chat.id}`)
//     },
//     [
//       preferences.showConversationPreviews,
//       searchQuery,
//       saveSearch,
//       router,
//       isDialog,
//       onClose,
//     ]
//   )

//   const activePreviewChatId =
//     hoveredChatId || (isPreviewPanelHovered ? hoveredChatId : null)
//   const showRecentSearches =
//     searchQuery === "" && !isLoadingHistory && searchHistory.length > 0

//   // Show preview only in dialog mode
//   const showPreview = isDialog && preferences.showConversationPreviews

//   // Optimized chat item props
//   const chatItemProps = useMemo(
//     () => ({
//       handleSelectChat,
//       selectedChatId,
//       preferences,
//       currentChatId: chatId,
//       onChatHover: handleChatHover,
//     }),
//     [handleSelectChat, selectedChatId, preferences, chatId, handleChatHover]
//   )

//   const handleLoadMore = useCallback(() => {
//     if (searchQuery) {
//       setSearchRenderCount((prev) => prev + LOAD_MORE_COUNT)
//     } else {
//       setRenderCount((prev) => prev + LOAD_MORE_COUNT)
//     }
//   }, [searchQuery])

//   const hasMore = useMemo(() => {
//     if (searchQuery) {
//       return searchRenderCount < filteredChat.length
//     }
//     return renderCount < chatHistory.length
//   }, [
//     searchQuery,
//     searchRenderCount,
//     filteredChat.length,
//     renderCount,
//     chatHistory.length,
//   ])

//   return (
//     <>
//       {/* Search Input */}
//       <div className="relative">
//         <Input
//           placeholder="Search history..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className={cn(
//             "focus:!border-border !bg-popover !h-10 pl-9 focus:!ring-0",
//             isDialog ? "!rounded-none !border-x-0 !border-t-0" : "rounded-md border"
//           )}
//         />
//         <MagnifyingGlassIcon className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
//         {isDialog && onClose && (
//           <span
//             onClick={onClose}
//             className="text-muted-foreground absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer"
//           >
//             <XIcon className="h-4 w-4" />
//           </span>
//         )}
//       </div>

//       {/* Content */}
//       <div className={cn(
//         "flex flex-1 overflow-y-auto",
//         isDialog ? "h-[calc(100%_-_40px)] scrollbar-history" : "h-full"
//       )}>
//         <div
//           className={cn(
//             "flex-1 overflow-y-auto px-2 py-3",
//             isDialog ? "my-1" : "",
//             showPreview ? "w-1/2" : "w-full"
//           )}
//         >
//           {showRecentSearches && (
//             <div className="space-y-1">
//               <div className="flex items-center justify-between px-2">
//                 <h3 className="text-muted-foreground text-sm font-medium">
//                   Recent Searches
//                 </h3>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => clearHistory()}
//                   className="text-muted-foreground hover:text-destructive h-6 cursor-pointer !bg-transparent !px-0 text-xs"
//                 >
//                   <Trash className="h-3 w-3" />
//                   Clear
//                 </Button>
//               </div>
//               <div className="space-y-1">
//                 <VirtualizedChatList
//                   chats={searchHistory.map(convertSearchToChat)}
//                   renderCount={searchRenderCount}
//                   isSearchItem={true}
//                   chatItemProps={chatItemProps}
//                 />
//               </div>
//             </div>
//           )}

//           {filteredChat.length === 0 && !showRecentSearches ? (
//             <div className="text-muted-foreground py-8 text-center">
//               No chat history found.
//             </div>
//           ) : searchQuery ? (
//             <div className="space-y-1">
//               <VirtualizedChatList
//                 chats={filteredChat}
//                 renderCount={searchRenderCount}
//                 isSearchItem={false}
//                 chatItemProps={chatItemProps}
//               />
//               {hasMore && (
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={handleLoadMore}
//                   className="mt-2 w-full"
//                 >
//                   Load More
//                 </Button>
//               )}
//             </div>
//           ) : (
//             !showRecentSearches && (
//               <div className="space-y-4">
//                 {groupedChats?.map((group) => (
//                   <div key={group.name} className="space-y-1">
//                     <h3 className="text-muted-foreground px-2 text-sm font-medium">
//                       {group.name}
//                     </h3>
//                     <div className="space-y-1">
//                       <VirtualizedChatList
//                         chats={group.chats}
//                         renderCount={renderCount}
//                         isSearchItem={false}
//                         chatItemProps={chatItemProps}
//                       />
//                     </div>
//                   </div>
//                 ))}
//                 {hasMore && (
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={handleLoadMore}
//                     className="w-full"
//                   >
//                     Load More
//                   </Button>
//                 )}
//               </div>
//             )
//           )}
//         </div>

//         {/* Preview Panel - Only show in dialog mode */}
//         {showPreview && (
//           <div className="w-1/2 border-l">
//             <ChatPreviewPanel
//               chatId={activePreviewChatId}
//               onHover={handlePreviewHover}
//               messages={messages}
//               isLoading={isLoading}
//               error={error}
//             />
//           </div>
//         )}
//       </div>
//     </>
//   )
// })

// CommandHistoryContent.displayName = "CommandHistoryContent"

// export function CommandHistory({
//   chatHistory,
//   trigger,
//   isOpen = false,
//   setIsOpen,
//   onOpenChange,
//   hasPopover = true,
//   isDialog = true,
//   className,
// }: CommandHistoryProps) {
//   const [internalIsOpen, setInternalIsOpen] = useState(isOpen)
//   const actualIsOpen = setIsOpen ? isOpen : internalIsOpen
//   const actualSetIsOpen = setIsOpen || setInternalIsOpen

//   const handleOpenChange = useCallback(
//     (open: boolean) => {
//       actualSetIsOpen(open)
//       onOpenChange?.(open)
//     },
//     [actualSetIsOpen, onOpenChange]
//   )

//   const handleClose = useCallback(() => {
//     handleOpenChange(false)
//   }, [handleOpenChange])

//   useKeyShortcut(
//     (e: KeyboardEvent) => e.key === "k" && (e.metaKey || e.ctrlKey),
//     () => {
//       if (isDialog) {
//         handleOpenChange(!actualIsOpen)
//       }
//     }
//   )

//   // If not dialog mode, render content directly
//   if (!isDialog) {
//     return (
//       <div className={cn("flex flex-col h-full", className)}>
//         <CommandHistoryContent
//           chatHistory={chatHistory}
//           isDialog={false}
//         />
//       </div>
//     )
//   }

//   // Dialog mode
//   return (
//     <Dialog open={actualIsOpen} onOpenChange={handleOpenChange}>
//       {hasPopover && trigger ? (
//         <Tooltip>
//           <TooltipTrigger asChild>
//             <DialogTrigger asChild>{trigger}</DialogTrigger>
//           </TooltipTrigger>
//           <TooltipContent>History ⌘+K</TooltipContent>
//         </Tooltip>
//       ) : (
//         trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>
//       )}

//       <DialogContent
//         className={cn(
//           "!block h-[500px] !gap-[unset] overflow-hidden p-0",
//           "w-full !max-w-3xl"
//         )}
//         hasCloseButton={false}
//       >
//         <DialogHeader className="sr-only">
//           <DialogTitle>Chat History</DialogTitle>
//           <DialogDescription>
//             Search through your past conversations
//           </DialogDescription>
//         </DialogHeader>

//         <CommandHistoryContent
//           chatHistory={chatHistory}
//           isDialog={true}
//           onClose={handleClose}
//         />
//       </DialogContent>
//     </Dialog>
//   )
// }