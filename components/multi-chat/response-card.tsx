"use client"

import { Loader } from "@/components/prompt-kit/loader"
import { getModelInfo } from "@/lib/models"
import { PROVIDERS } from "@/lib/providers"
import { Message as MessageType } from "@ai-sdk/react"
import { useState } from "react"
import { Message } from "../chat/message"

type GroupedMessage = {
  userMessage: MessageType
  responses: {
    model: string
    message: MessageType
    isLoading?: boolean
    provider: string
  }[]
  onDelete: (model: string, id: string) => void
  onEdit: (model: string, id: string, newText: string) => void
  onReload: (model: string) => void
}

type ResponseCardProps = {
  response: GroupedMessage["responses"][0]
  group: GroupedMessage
}

export function ResponseCard({ response, group }: ResponseCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const model = getModelInfo(response.model)
  const providerIcon = PROVIDERS.find((p) => p.id === model?.baseProviderId)

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-background pointer-events-auto relative rounded border p-3">
        <div className="text-muted-foreground mb-2 flex items-center gap-1">
          <span>
            {providerIcon?.icon && <providerIcon.icon className="size-4" />}
          </span>
          <span className="text-xs font-medium">{model?.name}</span>
        </div>

        {response.message ? (
          <Message
            id={response.message.id}
            variant="assistant"
            parts={
              response.message.parts || [
                { type: "text", text: response.message.content },
              ]
            }
            attachments={response.message.experimental_attachments}
            onDelete={() => group.onDelete(response.model, response.message.id)}
            onEdit={(id, newText) => group.onEdit(response.model, id, newText)}
            onReload={() => group.onReload(response.model)}
            status={response.isLoading ? "streaming" : "ready"}
            isLast={false}
            hasScrollAnchor={false}
            className="bg-transparent p-0 px-0"
            hoverState={isHovered}
          >
            {response.message.content}
          </Message>
        ) : response.isLoading ? (
          <div className="space-y-2">
            <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              assistant
            </div>
            <Loader />
          </div>
        ) : (
          <div className="text-muted-foreground text-sm italic">
            Waiting for response...
          </div>
        )}
      </div>
    </div>
  )
}