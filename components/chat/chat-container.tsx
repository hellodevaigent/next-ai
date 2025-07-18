"use client"

import { ChatInput } from "@/components/chat-input/chat-input"
import { Conversation } from "@/components/chat/conversation"
import { MODEL_DEFAULT } from "@/lib/config"
import { useChatDraft } from "@/lib/hooks/use-chat-draft"
import { useChatLoading } from "@/lib/hooks/use-chat-loading"
import { useTitle } from "@/lib/hooks/use-title"
import { useChats } from "@/lib/store/chat-store/chats/provider"
import { useMessages } from "@/lib/store/chat-store/messages/provider"
import { useChatSession } from "@/lib/store/chat-store/session/provider"
import { useUserPreferences } from "@/lib/store/user-preference-store/provider"
import { useUser } from "@/lib/store/user-store/provider"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "motion/react"
import { redirect } from "next/navigation"
import { lazy, memo, Suspense, useCallback, useMemo, useState } from "react"
import { useChatCore } from "../../lib/hooks/use-chat-core"
import { useFileUpload } from "../../lib/hooks/use-file-upload"
import { ConversationSkeleton } from "../skeleton/conversation"
import { toast } from "../ui/toast"

// Lazy load heavy components
const FeedbackWidget = lazy(() =>
  import("./feedback-widget").then((mod) => ({ default: mod.FeedbackWidget }))
)

const DialogAuth = lazy(() =>
  import("./dialog-auth").then((mod) => ({ default: mod.DialogAuth }))
)

// Types
interface OnboardingProps {
  showOnboarding: boolean
}

interface ChatInputContainerProps {
  chatInputProps: any
  messagesLength: number
}

interface ConversationContainerProps {
  showOnboarding: boolean
  shouldShowSkeleton: boolean
  conversationProps: any
}

// Memoized components
const OnboardingHeader = memo<OnboardingProps>(({ showOnboarding }) => {
  if (!showOnboarding) return null

  return (
    <motion.div
      key="onboarding"
      className="absolute bottom-[60%] mx-auto max-w-[50rem] md:relative md:bottom-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      layout="position"
      layoutId="onboarding"
      transition={{
        layout: {
          duration: 0,
        },
      }}
    >
      <h1 className="mb-6 text-3xl font-medium tracking-tight">
        What&apos;s on your mind?
      </h1>
    </motion.div>
  )
})

OnboardingHeader.displayName = "OnboardingHeader"

const ChatInputContainer = memo<ChatInputContainerProps>(
  ({ chatInputProps, messagesLength }) => (
    <motion.div
      className={cn(
        "relative inset-x-0 bottom-0 z-50 mx-auto w-full max-w-3xl"
      )}
      layout="position"
      layoutId="chat-input-container"
      transition={{
        layout: {
          duration: messagesLength === 1 ? 0.3 : 0,
        },
      }}
    >
      <ChatInput {...chatInputProps} />
    </motion.div>
  )
)

ChatInputContainer.displayName = "ChatInputContainer"

const ConversationContainer = memo<ConversationContainerProps>(
  ({ showOnboarding, shouldShowSkeleton, conversationProps }) => (
    <AnimatePresence initial={false} mode="popLayout">
      {showOnboarding ? (
        <OnboardingHeader showOnboarding={showOnboarding} />
      ) : shouldShowSkeleton ? (
        <ConversationSkeleton key="skeleton" />
      ) : (
        <Conversation key="conversation" {...conversationProps} />
      )}
    </AnimatePresence>
  )
)

ConversationContainer.displayName = "ConversationContainer"

// Fallback components for lazy loading
const FeedbackWidgetFallback = memo(() => <div className="h-0 w-0" />)
FeedbackWidgetFallback.displayName = "FeedbackWidgetFallback"

const DialogAuthFallback = memo(() => <div className="h-0 w-0" />)
DialogAuthFallback.displayName = "DialogAuthFallback"

export function ChatContainer() {
  const { chatId } = useChatSession()
  const {
    createNewChat,
    getChatById,
    updateChatModel,
    bumpChat,
    isLoading: isChatsLoading,
  } = useChats()

  useTitle(chatId || null)

  const currentChat = useMemo(
    () => (chatId ? getChatById(chatId) : null),
    [chatId, getChatById]
  )

  const handleModelChange = useCallback(
    async (newModel: string) => {
      if (chatId) {
        // Jika sudah ada chat, langsung perbarui di DB.
        // UI akan otomatis update ketika `currentChat` berubah.
        try {
          await updateChatModel(chatId, newModel)
        } catch (err) {
          toast({
            title: "Gagal memperbarui model",
            status: "error",
          })
        }
      } else {
        // Jika ini chat baru, cukup perbarui state lokal.
        setModelForNewChat(newModel)
      }
    },
    [chatId, updateChatModel]
  )

  const {
    messages: initialMessages,
    cacheAndAddMessage,
    isLoading: isLoadingInitialMessages,
  } = useMessages()

  const { user } = useUser()
  const { preferences } = useUserPreferences()
  const { draftValue, clearDraft } = useChatDraft(chatId)

  // File upload functionality
  const {
    files,
    setFiles,
    handleFileUploads,
    createOptimisticAttachments,
    cleanupOptimisticAttachments,
    handleFileUpload,
    handleFileRemove,
  } = useFileUpload("CHAT_ATTACHMENTS")

  // State to pass between hooks
  const [hasDialogAuth, setHasDialogAuth] = useState(false)

  // Memoize computed values
  const isAuthenticated = useMemo(() => !!user?.id, [user?.id])

  const [modelForNewChat, setModelForNewChat] = useState<string>(
    () => user?.favorite_models?.[0] || MODEL_DEFAULT
  )

  const selectedModel = useMemo(() => {
    if (currentChat?.model) {
      return currentChat.model
    }
    return modelForNewChat
  }, [currentChat, modelForNewChat])

  // Memoize callbacks for chat operations
  const setHasDialogAuthCallback = useCallback(
    (value: boolean) => setHasDialogAuth(value),
    []
  )

  // Core chat functionality (initialization + state + actions)
  const {
    messages,
    input,
    status,
    stop,
    hasSentFirstMessageRef,
    isSubmitting,
    enableSearch,
    setEnableSearch,
    submit,
    handleSuggestion,
    handleReload,
    handleInputChange,
  } = useChatCore({
    initialMessages,
    draftValue,
    cacheAndAddMessage,
    chatId,
    user,
    files,
    createOptimisticAttachments,
    setFiles,
    cleanupOptimisticAttachments,
    handleFileUploads,
    selectedModel,
    clearDraft,
    bumpChat,
    setHasDialogAuth: setHasDialogAuthCallback,
    createNewChat,
  })

  const { shouldShowLoading } = useChatLoading(
    chatId,
    isLoadingInitialMessages,
    initialMessages.length > 0
  )

  // Memoize the chat input props with better dependency tracking
  const chatInputProps = useMemo(
    () => ({
      value: input,
      onSuggestion: handleSuggestion,
      onValueChange: handleInputChange,
      onSend: submit,
      isSubmitting,
      files,
      onFileUpload: handleFileUpload,
      onFileRemove: handleFileRemove,
      hasSuggestions:
        preferences.promptSuggestions && !chatId && messages.length === 0,
      onSelectModel: handleModelChange,
      selectedModel,
      isUserAuthenticated: isAuthenticated,
      stop,
      status,
      setEnableSearch,
      enableSearch,
    }),
    [
      input,
      handleSuggestion,
      handleInputChange,
      submit,
      isSubmitting,
      files,
      handleFileUpload,
      handleFileRemove,
      preferences.promptSuggestions,
      chatId,
      messages.length,
      handleModelChange,
      selectedModel,
      isAuthenticated,
      stop,
      status,
      setEnableSearch,
      enableSearch,
    ]
  )

  // Memoize the conversation props to prevent unnecessary rerenders
  const conversationProps = useMemo(
    () => ({
      messages,
      status,
      isSubmitting,
      onDelete: () => {},
      onEdit: async () => {},
      onReload: handleReload,
    }),
    [messages, status, handleReload]
  )

  // Memoize conditional states
  const showOnboarding = useMemo(
    () => !chatId && messages.length === 0,
    [chatId, messages.length]
  )

  const shouldShowSkeleton = useMemo(
    () =>
      shouldShowLoading &&
      messages.length === 0 &&
      !isSubmitting &&
      !showOnboarding,
    [shouldShowLoading, messages.length, isSubmitting, showOnboarding]
  )

  // Handle redirect for invalid chatId - only redirect if we're certain the chat doesn't exist
  // and we're not in a transient state during chat creation
  const shouldRedirect = useMemo(
    () =>
      chatId &&
      !isChatsLoading &&
      !currentChat &&
      !isSubmitting &&
      status === "ready" &&
      messages.length === 0 &&
      !hasSentFirstMessageRef.current,
    [
      chatId,
      isChatsLoading,
      currentChat,
      isSubmitting,
      status,
      messages.length,
      hasSentFirstMessageRef,
    ]
  )

  if (shouldRedirect) {
    return redirect("/")
  }

  return (
    <div
      className={cn(
        "@container/main relative -mt-[56px] flex h-full flex-col items-center justify-end md:justify-center"
      )}
    >
      <Suspense fallback={<DialogAuthFallback />}>
        <DialogAuth open={hasDialogAuth} setOpen={setHasDialogAuth} />
      </Suspense>

      <ConversationContainer
        showOnboarding={showOnboarding}
        shouldShowSkeleton={shouldShowSkeleton}
        conversationProps={conversationProps}
      />

      <ChatInputContainer
        chatInputProps={chatInputProps}
        messagesLength={messages.length}
      />

      <Suspense fallback={<FeedbackWidgetFallback />}>
        <FeedbackWidget authUserId={user?.id} />
      </Suspense>
    </div>
  )
}
