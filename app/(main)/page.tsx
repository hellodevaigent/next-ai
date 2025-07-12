import type { Metadata } from "next";
import { Chat } from "@/components/chat/chat"
import { metadata as meta } from "@/lib/metadata";

export const metadata: Metadata = meta.home;
export const dynamic = "force-dynamic"

export default function HomePage() {
  return (
    <Chat />
  )
}
