import { APP_NAME } from "@/lib/config"
import { isSupabaseEnabled } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: {
  home: Metadata
  settings: Metadata
  projects: Metadata
} = {
  home: {
    title: APP_NAME,
    description:
      "Zola is the open-source interface for AI chat. Multi-model, BYOK-ready, and fully self-hostable. Use Claude, OpenAI, Gemini, local models, and more, all in one place.",
  },
  settings: {
    title: "Settings",
    description: "....",
  },
  projects: {
    title: "projects",
    description: "....",
  },
}

export async function generateChatMetadata({
  params,
}: {
  params: Promise<{ chatId: string }>
}): Promise<Metadata> {
  if (!isSupabaseEnabled) {
    return {
      title: "Chat",
    }
  }

  const { chatId } = await params
  const supabase = await createClient()

  if (!supabase) {
    return notFound()
  }

  const { data: chat } = await supabase
    .from("chats")
    .select("title")
    .eq("id", chatId)
    .single()

  if (!chat || !chat.title) {
    return {
      title: "Chat",
      description: `A conversation in ${APP_NAME}.`,
    }
  }

  const title = chat.title
  const description = `A conversation about "${title}" in ${APP_NAME}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

export async function generateProjectMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>
}): Promise<Metadata> {
  const { projectId } = await params

  if (!isSupabaseEnabled) {
    return {
      title: "Project",
    }
  }

  const supabase = await createClient()
  if (!supabase) {
    return {
      title: "Project",
    }
  }

  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single()

  const title = `Project | ${project?.name}` || "Project"
  const description = `View project ${title} on Zola.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  }
}
