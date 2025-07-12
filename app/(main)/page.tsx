import type { Metadata } from "next";
import { ChatContainer } from "@/components/chat/chat-container"
import { metadata as meta } from "@/lib/metadata";

export const metadata: Metadata = meta.home;
export const dynamic = "force-dynamic"

export default function Home() {
  return (
    <ChatContainer />
  )
}
