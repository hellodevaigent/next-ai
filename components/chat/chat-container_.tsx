// "use client"

// import { ChatInput } from "@/components/chat-input/chat-input"
// import { Conversation } from "@/components/chat/conversation"
// import { useChatDraft } from "@/lib/hooks/use-chat-draft"
// import { useChatLoading } from "@/lib/hooks/use-chat-loading"
// import { useChats } from "@/lib/store/chat-store/chats/provider"
// import { useMessages } from "@/lib/store/chat-store/messages/provider"
// import { useChatSession } from "@/lib/store/chat-store/session/provider"
// import { SYSTEM_PROMPT_DEFAULT } from "@/lib/config"
// import { useModel } from "@/lib/hooks/use-model"
// import { useTitle } from "@/lib/hooks/use-title"
// import { useUserPreferences } from "@/lib/store/user-preference-store/provider"
// import { useUser } from "@/lib/store/user-store/provider"
// import { cn } from "@/lib/utils"
// import { AnimatePresence, motion } from "motion/react"
// import dynamic from "next/dynamic"
// import { redirect } from "next/navigation"
// import { useMemo, useState } from "react"
// import { useChatCore } from "../../lib/hooks/use-chat-core"
// import { useChatOperations } from "../../lib/hooks/use-chat-operations"
// import { useFileUpload } from "../../lib/hooks/use-file-upload"
// import { ConversationSkeleton } from "../skeleton/conversation"

// const FeedbackWidget = dynamic(
//   () => import("./feedback-widget").then((mod) => mod.FeedbackWidget),
//   { ssr: false }
// )

// const DialogAuth = dynamic(
//   () => import("./dialog-auth").then((mod) => mod.DialogAuth),
//   { ssr: false }
// )

// export function ChatContainer() {
//   const { chatId } = useChatSession()
//   const {
//     createNewChat,
//     getChatById,
//     updateChatModel,
//     bumpChat,
//     isLoading: isChatsLoading,
//   } = useChats()

//   useTitle(chatId || null)

//   const currentChat = useMemo(
//     () => (chatId ? getChatById(chatId) : null),
//     [chatId, getChatById]
//   )

//   const {
//     messages: initialMessages,
//     cacheAndAddMessage,
//     isLoading: isLoadingInitialMessages,
//   } = useMessages()

//   const { user } = useUser()
//   const { preferences } = useUserPreferences()
//   const { draftValue, clearDraft } = useChatDraft(chatId)

//   // File upload functionality
//   const {
//     files,
//     setFiles,
//     handleFileUploads,
//     createOptimisticAttachments,
//     cleanupOptimisticAttachments,
//     handleFileUpload,
//     handleFileRemove,
//   } = useFileUpload("CHAT_ATTACHMENTS")

//   // Model selection
//   const { selectedModel, handleModelChange } = useModel({
//     currentChat: currentChat || null,
//     user,
//     updateChatModel,
//     chatId,
//   })

//   // State to pass between hooks
//   const [hasDialogAuth, setHasDialogAuth] = useState(false)
//   const isAuthenticated = useMemo(() => !!user?.id, [user?.id])
//   const systemPrompt = useMemo(
//     () => user?.system_prompt || SYSTEM_PROMPT_DEFAULT,
//     [user?.system_prompt]
//   )

//   // Chat operations (utils + handlers) - created first
//   const { checkLimitsAndNotify, ensureChatExists, handleDelete, handleEdit } =
//     useChatOperations({
//       isAuthenticated,
//       chatId,
//       messages: initialMessages,
//       selectedModel,
//       systemPrompt,
//       createNewChat,
//       setHasDialogAuth,
//       setMessages: () => {},
//       setInput: () => {},
//     })

//   // Core chat functionality (initialization + state + actions)
//   const {
//     messages,
//     input,
//     status,
//     stop,
//     hasSentFirstMessageRef,
//     isSubmitting,
//     enableSearch,
//     setEnableSearch,
//     submit,
//     handleSuggestion,
//     handleReload,
//     handleInputChange,
//   } = useChatCore({
//     initialMessages,
//     draftValue,
//     cacheAndAddMessage,
//     chatId,
//     user,
//     files,
//     createOptimisticAttachments,
//     setFiles,
//     checkLimitsAndNotify,
//     cleanupOptimisticAttachments,
//     ensureChatExists,
//     handleFileUploads,
//     selectedModel,
//     clearDraft,
//     bumpChat,
//   })

//   const { shouldShowLoading } = useChatLoading(
//     chatId,
//     isLoadingInitialMessages,
//     initialMessages.length > 0
//   )

//   // Memoize the conversation props to prevent unnecessary rerenders
//   const conversationProps = useMemo(
//     () => ({
//       messages,
//       status,
//       onDelete: handleDelete,
//       onEdit: handleEdit,
//       onReload: handleReload,
//     }),
//     [messages, status, handleDelete, handleEdit, handleReload]
//   )

//   // Memoize the chat input props
//   const chatInputProps = useMemo(
//     () => ({
//       value: input,
//       onSuggestion: handleSuggestion,
//       onValueChange: handleInputChange,
//       onSend: submit,
//       isSubmitting,
//       files,
//       onFileUpload: handleFileUpload,
//       onFileRemove: handleFileRemove,
//       hasSuggestions:
//         preferences.promptSuggestions && !chatId && messages.length === 0,
//       onSelectModel: handleModelChange,
//       selectedModel,
//       isUserAuthenticated: isAuthenticated,
//       stop,
//       status,
//       setEnableSearch,
//       enableSearch,
//     }),
//     [
//       input,
//       handleSuggestion,
//       handleInputChange,
//       submit,
//       isSubmitting,
//       files,
//       handleFileUpload,
//       handleFileRemove,
//       preferences.promptSuggestions,
//       chatId,
//       messages.length,
//       handleModelChange,
//       selectedModel,
//       isAuthenticated,
//       stop,
//       status,
//       setEnableSearch,
//       enableSearch,
//     ]
//   )

//   // Handle redirect for invalid chatId - only redirect if we're certain the chat doesn't exist
//   // and we're not in a transient state during chat creation
//   if (
//     chatId &&
//     !isChatsLoading &&
//     !currentChat &&
//     !isSubmitting &&
//     status === "ready" &&
//     messages.length === 0 &&
//     !hasSentFirstMessageRef.current
//   ) {
//     return redirect("/")
//   }

//   const showOnboarding = !chatId && messages.length === 0

//   const shouldShowSkeleton =
//     shouldShowLoading &&
//     messages.length === 0 &&
//     !isSubmitting &&
//     !showOnboarding

//   return (
//     <div
//       className={cn(
//         "@container/main relative -mt-[56px] flex h-full flex-col items-center justify-end md:justify-center"
//       )}
//     >
//       <DialogAuth open={hasDialogAuth} setOpen={setHasDialogAuth} />

//       <AnimatePresence initial={false} mode="popLayout">
//         {showOnboarding ? (
//           <motion.div
//             key="onboarding"
//             className="absolute bottom-[60%] mx-auto max-w-[50rem] md:relative md:bottom-auto"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             layout="position"
//             layoutId="onboarding"
//             transition={{
//               layout: {
//                 duration: 0,
//               },
//             }}
//           >
//             <h1 className="mb-6 text-3xl font-medium tracking-tight">
//               What&apos;s on your mind?
//             </h1>
//           </motion.div>
//         ) : shouldShowSkeleton ? (
//           <ConversationSkeleton key="skeleton" />
//         ) : (
//           <Conversation key="conversation" {...conversationProps} />
//         )}
//       </AnimatePresence>

//       <motion.div
//         className={cn(
//           "relative inset-x-0 bottom-0 z-50 mx-auto w-full max-w-3xl"
//         )}
//         layout="position"
//         layoutId="chat-input-container"
//         transition={{
//           layout: {
//             duration: messages.length === 1 ? 0.3 : 0,
//           },
//         }}
//       >
//         <ChatInput {...chatInputProps} />
//       </motion.div>

//       <FeedbackWidget authUserId={user?.id} />
//     </div>
//   )
// }
