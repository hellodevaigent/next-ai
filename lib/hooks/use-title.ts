"use client";

import { useEffect } from "react";
import { useTitleStore } from "@/lib/title-store";
import { getChat } from "../chat-store/chats/api";

export function useTitle(chatId?: string | null, title?: string) {
  const { setTitle, setLoading } = useTitleStore();

  useEffect(() => {
    if (title) {
      setTitle(title);
      return;
    }

    if (!chatId) {
      setTitle(null);
      setLoading(false);
      return;
    }

    const fetchTitle = async () => {
      setLoading(true);
      
      try {
        const chat = await getChat(chatId);
        setTitle(chat?.title || null);
      } catch (error) {
        console.error("Failed to fetch chat title:", error);
        setTitle(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTitle();
  }, [chatId ?? null, title, setTitle, setLoading]);

  useEffect(() => {
    return () => {
      setTitle(null);
      setLoading(false);
    };
  }, [setTitle, setLoading]);

  return null;
}