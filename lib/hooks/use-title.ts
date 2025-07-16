"use client";

import { useEffect, useRef } from "react";
import { useTitleStore } from "@/lib/store/title-store";
import { getChat } from "../store/chat-store/chats/api";

const titleCache = new Map<string, string | null>();

export function useTitle(chatId?: string | null, title?: string) {
  const { setTitle, setLoading } = useTitleStore();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (title) {
      setTitle(title);
      if (chatId) {
        titleCache.set(chatId, title);
      }
      return;
    }

    if (!chatId) {
      setTitle(null);
      setLoading(false);
      return;
    }

    if (titleCache.has(chatId)) {
      const cachedTitle = titleCache.get(chatId);
      if (cachedTitle !== undefined) {
        setTitle(cachedTitle);
      } else {
        setTitle(null);
      }
      setLoading(false);
      return;
    }

    const fetchTitle = async () => {
      if (hasLoadedRef.current) return;
      
      setLoading(true);
      hasLoadedRef.current = true;
      
      try {
        const chat = await getChat(chatId);
        const fetchedTitle = chat?.title || null;
        
        setTitle(fetchedTitle);
        titleCache.set(chatId, fetchedTitle);
      } catch (error) {
        console.error("Failed to fetch chat title:", error);
        setTitle(null);
        titleCache.set(chatId, null);
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
      hasLoadedRef.current = false;
    };
  }, [setTitle, setLoading]);

  return null;
}