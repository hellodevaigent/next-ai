import { APP_DOMAIN } from "@/lib/config"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Article from "./article"
import { API_ROUTE_SHARE } from "@/lib/routes"

export const dynamic = "force-dynamic"

// Type definitions
interface ChatData {
  chat: {
    id: string
    title: string
    created_at: string
    subtitle: string
  }
  messages: any[]
  metadata: {
    title: string
    description: string
    url: string
    openGraph: {
      title: string
      description: string
      type: string
      url: string
    }
    twitter: {
      card: string
      title: string
      description: string
    }
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chatId: string }>
}): Promise<Metadata> {
  try {
    const { chatId } = await params
    
    // Fetch data from API route
    const response = await fetch(`${APP_DOMAIN + API_ROUTE_SHARE}/${chatId}`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      return notFound()
    }

    const data: ChatData = await response.json()

    return {
      title: data.metadata.title,
      description: data.metadata.description,
      openGraph: data.metadata.openGraph,
      twitter: data.metadata.twitter,
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return notFound()
  }
}

export default async function ShareChat({
  params,
}: {
  params: Promise<{ chatId: string }>
}) {
  try {
    const { chatId } = await params
    
    // Fetch data from API route
    const response = await fetch(`${APP_DOMAIN + API_ROUTE_SHARE}/${chatId}`, {
      cache: 'no-store'
    })

    console.log(response)

    if (!response.ok) {
      return notFound()
    }

    const data: ChatData = await response.json()

    return (
      <Article
        messages={data.messages}
        date={data.chat.created_at}
        title={data.chat.title}
        subtitle={data.chat.subtitle}
      />
    )
  } catch (error) {
    console.error("Error fetching chat data:", error)
    return notFound()
  }
}