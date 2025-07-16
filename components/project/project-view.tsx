"use client"

import { ChatInput } from "@/components/chat-input/chat-input"
import { Conversation } from "@/components/chat/conversation"
import { ProjectChatItem } from "@/components/project/project-chat-item"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { useBreakpoint } from "@/lib/hooks/use-breakpoint"
import { useChats } from "@/lib/store/chat-store/chats/provider"
import { useMessages } from "@/lib/store/chat-store/messages/provider"
import { MESSAGE_MAX_LENGTH, SYSTEM_PROMPT_DEFAULT } from "@/lib/config"
import { Attachment } from "@/lib/file-handling"
import { useChatOperations } from "@/lib/hooks/use-chat-operations"
import { useFileUpload } from "@/lib/hooks/use-file-upload"
import { useModel } from "@/lib/hooks/use-model"
import { useTitle } from "@/lib/hooks/use-title"
import { API_ROUTE_CHAT } from "@/lib/routes"
import { useUser } from "@/lib/store/user-store/provider"
import { cn } from "@/lib/utils"
import { useChat } from "@ai-sdk/react"
import { ArrowLeftIcon, ChatCircleIcon } from "@phosphor-icons/react"
import { AnimatePresence, motion } from "motion/react"
import { usePathname } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import {
  ProjectChatMobileSkeleton,
  ProjectChatSkeleton,
} from "../skeleton/project"
import { Skeleton } from "../skeleton/skeleton"
import { useProjects } from "@/lib/store/project-store/provider"

type ProjectViewProps = {
  projectId: string
}

export function ProjectView({ projectId }: ProjectViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [enableSearch, setEnableSearch] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isViewAllOpen, setIsViewAllOpen] = useState(false)
  const { user } = useUser()
  const { createNewChat, bumpChat } = useChats()
  const { cacheAndAddMessage } = useMessages()
  const pathname = usePathname()
  const isMobileTablet = useBreakpoint(1024)
  const {
    files,
    setFiles,
    handleFileUploads,
    createOptimisticAttachments,
    cleanupOptimisticAttachments,
    handleFileUpload,
    handleFileRemove,
  } = useFileUpload()

  // Fetch project details
  const { getProjectById, isLoading } = useProjects()
  const project = getProjectById(projectId) 

  useTitle(null, `Project #${project?.name || ""}`)

  // Get chats from the chat store and filter for this project
  const { chats: allChats } = useChats()

  // Filter chats for this project
  const chats = allChats.filter((chat) => chat.project_id === projectId)

  // Split chats into displayed and remaining
  const displayedChats = chats.slice(0, 3)
  const hasMoreChats = chats.length > 3

  const isAuthenticated = useMemo(() => !!user?.id, [user?.id])

  // Handle errors directly in onError callback
  const handleError = useCallback((error: Error) => {
    let errorMsg = "Something went wrong."
    try {
      const parsed = JSON.parse(error.message)
      errorMsg = parsed.error || errorMsg
    } catch {
      errorMsg = error.message || errorMsg
    }
    toast({
      title: errorMsg,
      status: "error",
    })
  }, [])

  const {
    messages,
    input,
    handleSubmit,
    status,
    reload,
    stop,
    setMessages,
    setInput,
  } = useChat({
    id: `project-${projectId}-${currentChatId}`,
    api: API_ROUTE_CHAT,
    initialMessages: [],
    onFinish: cacheAndAddMessage,
    onError: handleError,
  })

  const { selectedModel, handleModelChange } = useModel({
    currentChat: null,
    user,
    updateChatModel: () => Promise.resolve(),
    chatId: null,
  })

  // Simplified ensureChatExists for authenticated project context
  const ensureChatExists = useCallback(
    async (userId: string) => {
      // If we already have a current chat ID, return it
      if (currentChatId) {
        return currentChatId
      }

      // Only create a new chat if we haven't started one yet
      if (messages.length === 0) {
        try {
          const newChat = await createNewChat(
            userId,
            input,
            selectedModel,
            true, // Always authenticated in this context
            SYSTEM_PROMPT_DEFAULT,
            projectId
          )

          if (!newChat) return null

          setCurrentChatId(newChat.id)
          // Redirect to the chat page as expected
          window.history.pushState(null, "", `/c/${newChat.id}`)
          return newChat.id
        } catch (err: unknown) {
          let errorMessage = "Something went wrong."
          try {
            const errorObj = err as { message?: string }
            if (errorObj.message) {
              const parsed = JSON.parse(errorObj.message)
              errorMessage = parsed.error || errorMessage
            }
          } catch {
            const errorObj = err as { message?: string }
            errorMessage = errorObj.message || errorMessage
          }
          toast({
            title: errorMessage,
            status: "error",
          })
          return null
        }
      }

      return currentChatId
    },
    [
      currentChatId,
      messages.length,
      createNewChat,
      input,
      selectedModel,
      projectId,
    ]
  )

  const { handleDelete, handleEdit } = useChatOperations({
    isAuthenticated: true, // Always authenticated in project context
    chatId: null,
    messages,
    selectedModel,
    systemPrompt: SYSTEM_PROMPT_DEFAULT,
    createNewChat,
    setHasDialogAuth: () => {}, // Not used in project context
    setMessages,
    setInput,
  })

  // Simple input change handler for project context (no draft saving needed)
  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value)
    },
    [setInput]
  )

  const submit = useCallback(async () => {
    setIsSubmitting(true)

    if (!user?.id) {
      setIsSubmitting(false)
      return
    }

    const optimisticId = `optimistic-${Date.now().toString()}`
    const optimisticAttachments =
      files.length > 0 ? createOptimisticAttachments(files) : []

    const optimisticMessage = {
      id: optimisticId,
      content: input,
      role: "user" as const,
      createdAt: new Date(),
      experimental_attachments:
        optimisticAttachments.length > 0 ? optimisticAttachments : undefined,
    }

    setMessages((prev) => [...prev, optimisticMessage])
    setInput("")

    const submittedFiles = [...files]
    setFiles([])

    try {
      const currentChatId = await ensureChatExists(user.id)
      if (!currentChatId) {
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
        cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
        return
      }

      if (input.length > MESSAGE_MAX_LENGTH) {
        toast({
          title: `The message you submitted was too long, please submit something shorter. (Max ${MESSAGE_MAX_LENGTH} characters)`,
          status: "error",
        })
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
        cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
        return
      }

      let attachments: Attachment[] | null = []
      if (submittedFiles.length > 0) {
        attachments = await handleFileUploads(user.id, currentChatId)
        if (attachments === null) {
          setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
          cleanupOptimisticAttachments(
            optimisticMessage.experimental_attachments
          )
          return
        }
      }

      const options = {
        body: {
          chatId: currentChatId,
          userId: user.id,
          model: selectedModel,
          isAuthenticated: true,
          systemPrompt: SYSTEM_PROMPT_DEFAULT,
          enableSearch,
        },
        experimental_attachments: attachments || undefined,
      }

      handleSubmit(undefined, options)
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
      cacheAndAddMessage(optimisticMessage)

      // Bump existing chats to top (non-blocking, after submit)
      if (messages.length > 0) {
        bumpChat(currentChatId)
      }
    } catch {
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
      toast({ title: "Failed to send message", status: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }, [
    user,
    files,
    createOptimisticAttachments,
    input,
    setMessages,
    setInput,
    setFiles,
    cleanupOptimisticAttachments,
    ensureChatExists,
    handleFileUploads,
    selectedModel,
    handleSubmit,
    cacheAndAddMessage,
    messages.length,
    bumpChat,
    enableSearch,
  ])

  const handleReload = useCallback(async () => {
    if (!user?.id) {
      return
    }

    const options = {
      body: {
        chatId: null,
        userId: user.id,
        model: selectedModel,
        isAuthenticated: true,
        systemPrompt: SYSTEM_PROMPT_DEFAULT,
      },
    }

    reload(options)
  }, [user, selectedModel, reload])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Memoize the conversation props to prevent unnecessary rerenders
  const conversationProps = useMemo(
    () => ({
      messages,
      status,
      onDelete: handleDelete,
      onEdit: handleEdit,
      onReload: handleReload,
    }),
    [messages, status, handleDelete, handleEdit, handleReload]
  )

  // Memoize the chat input props
  const chatInputProps = useMemo(
    () => ({
      value: input,
      onSuggestion: () => {},
      onValueChange: handleInputChange,
      onSend: submit,
      isSubmitting,
      files,
      onFileUpload: handleFileUpload,
      onFileRemove: handleFileRemove,
      hasSuggestions: false,
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
      handleInputChange,
      submit,
      isSubmitting,
      files,
      handleFileUpload,
      handleFileRemove,
      handleModelChange,
      selectedModel,
      isAuthenticated,
      stop,
      status,
      setEnableSearch,
      enableSearch,
    ]
  )

  const showOnboarding = pathname === `/p/${projectId}`

  const ChatList = ({
    chats: chatList,
    showViewAll = false,
  }: {
    chats: any[]
    showViewAll?: boolean
  }) => (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-muted-foreground text-sm font-medium">
          {chatList.length === 0 ? "No chats yet" : "Recent chats"}
        </h2>
        {showViewAll && hasMoreChats && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsViewAllOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            View All
          </Button>
        )}
      </div>
      {chatList.length > 0 && (
        <div className="space-y-2">
          {chatList.map((chat) => (
            <ProjectChatItem
              key={chat.id}
              chat={chat}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  )

  const AllChatsList = () => (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsViewAllOpen(false)}
            className="text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeftIcon size={16} className="mr-1" />
            Back
          </Button>
          <h2 className="text-muted-foreground text-sm font-medium">
            All chats ({chats.length})
          </h2>
        </div>
      </div>
      <div className="space-y-2">
        {chats.map((chat) => (
          <ProjectChatItem key={chat.id} chat={chat} formatDate={formatDate} />
        ))}
      </div>
    </div>
  )

  return (
    <div
      className={cn(
        "@container/main relative -mt-[56px] flex h-full flex-col items-center justify-end lg:justify-center",
        isMobileTablet ? "overflow-hidden" : ""
      )}
    >
      {/* Mobile/Tablet */}
      {isMobileTablet ? (
        <div className="relative flex h-full w-full">
          <motion.div
            className="flex h-full w-full flex-col items-center justify-end lg:justify-center"
            animate={{
              x: isViewAllOpen ? "-100%" : "0%",
            }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {showOnboarding ? (
                <motion.div
                  key="onboarding"
                  className="absolute bottom-[60%] mx-auto max-w-[50rem] lg:relative lg:bottom-auto"
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
                  <div className="mb-6 flex items-center justify-center gap-2">
                    <ChatCircleIcon
                      className="text-muted-foreground"
                      size={24}
                    />
                    {isLoading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <h1 className="text-center text-3xl font-medium tracking-tight">
                        {project?.name || ""}
                      </h1>
                    )}
                  </div>
                </motion.div>
              ) : (
                <Conversation key="conversation" {...conversationProps} />
              )}
            </AnimatePresence>

            {isLoading && <ProjectChatMobileSkeleton />}
            {showOnboarding && !isLoading && (
              <ChatList chats={displayedChats} showViewAll />
            )}

            <motion.div
              className={cn(
                "relative inset-x-0 bottom-0 z-50 mx-auto w-full max-w-3xl"
              )}
              layout="position"
              layoutId="chat-input-container"
              transition={{
                layout: {
                  duration: messages.length === 1 ? 0.3 : 0,
                },
              }}
            >
              <ChatInput {...chatInputProps} />
            </motion.div>
          </motion.div>

          <motion.div
            className="bg-background absolute mt-[56px] top-0 right-0 flex h-full w-full flex-col items-center justify-end lg:justify-center"
            initial={{ x: "100%" }}
            animate={{
              x: isViewAllOpen ? "0%" : "100%",
            }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
          >
            <AllChatsList />
          </motion.div>
        </div>
      ) : (
        /* Desktop */
        <AnimatePresence mode="wait">
          {!isViewAllOpen ? (
            <motion.div
              key="main-content"
              className="flex h-full w-full flex-col items-center justify-end lg:justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {showOnboarding ? (
                  <motion.div
                    key="onboarding"
                    className="absolute bottom-[60%] mx-auto max-w-[50rem] lg:relative lg:bottom-auto"
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
                    <div className="mb-6 flex items-center justify-center gap-2">
                      <ChatCircleIcon
                        className="text-muted-foreground"
                        size={24}
                      />
                      {isLoading ? (
                        <Skeleton className="h-8 w-24" />
                      ) : (
                        <h1 className="text-center text-3xl font-medium tracking-tight">
                          {project?.name || ""}
                        </h1>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <Conversation key="conversation" {...conversationProps} />
                )}
              </AnimatePresence>

              <motion.div
                className={cn(
                  "relative inset-x-0 bottom-0 z-50 mx-auto w-full max-w-3xl"
                )}
                layout="position"
                layoutId="chat-input-container"
                transition={{
                  layout: {
                    duration: messages.length === 1 ? 0.3 : 0,
                  },
                }}
              >
                <ChatInput {...chatInputProps} />
              </motion.div>

              {/* Desktop: Show chats below input */}
              {isLoading && <ProjectChatSkeleton />}
              {showOnboarding && !isLoading && (
                <ChatList chats={displayedChats} showViewAll />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="view-all-content"
              className="mt-[56px] flex h-full w-full flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AllChatsList />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
