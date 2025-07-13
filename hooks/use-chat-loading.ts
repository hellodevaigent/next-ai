import { useEffect, useState } from 'react'
import { useChats } from '@/lib/chat-store/chats/provider'

export function useChatLoading(
  chatId: string | null, 
  isLoadingMessages: boolean, 
  hasMessages: boolean
) {
  const { isChatLoaded, markChatAsLoaded } = useChats()
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null)

  useEffect(() => {
    if (!chatId) {
      setLoadingChatId(null)
      return
    }

    if (!isChatLoaded(chatId)) {
      setLoadingChatId(chatId)
    } else {
      setLoadingChatId(null)
    }
  }, [chatId, isChatLoaded])

  useEffect(() => {
    if (
      chatId &&
      loadingChatId === chatId &&
      !isLoadingMessages &&
      hasMessages
    ) {
      markChatAsLoaded(chatId)
      setLoadingChatId(null)
    }
  }, [chatId, loadingChatId, isLoadingMessages, hasMessages, markChatAsLoaded])

  const shouldShowLoading = Boolean(loadingChatId === chatId && isLoadingMessages)

  return {
    shouldShowLoading,
    isFirstLoad: chatId ? !isChatLoaded(chatId) : false
  }
}