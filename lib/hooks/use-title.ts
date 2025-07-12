"use client";

import { useEffect, useState } from "react";
import { useTitleStore } from "@/lib/title-store";
import { getChat } from "../chat-store/chats/api";

export function useTitle(chatId: string | null) {
  const { setTitle } = useTitleStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!chatId) {
      setTitle(null);
      return;
    }

    const fetchTitle = async () => {
      setIsLoading(true);
      
      try {
        const chat = await getChat(chatId);
        setTitle(chat?.title || null);
      } catch (error) {
        console.error("Failed to fetch chat title:", error);
        setTitle(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTitle();
  }, [chatId, setTitle]);

  // Cleanup title when component unmounts
  useEffect(() => {
    return () => setTitle(null);
  }, [setTitle]);

  return { isLoading };
}