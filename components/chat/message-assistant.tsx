import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/prompt-kit/message"
import useClickOutside from "@/lib/hooks/use-click-outside"
import { APP_NAME } from "@/lib/config"
import { useUserPreferences } from "@/lib/store/user-preference-store/provider"
import { cn } from "@/lib/utils"
import type { Message as MessageAISDK } from "@ai-sdk/react"
import { ArrowClockwise, Check, Copy } from "@phosphor-icons/react"
import { useRef, useState } from "react"
import { getSources } from "./get-sources"
import { Reasoning } from "./reasoning"
import { SearchImages } from "./search-images"
import { SourcesList } from "./sources-list"
import { ToolInvocation } from "./tool-invocation"
import { useBreakpoint } from "@/lib/hooks/use-breakpoint"

type MessageAssistantProps = {
  children: string
  isLast?: boolean
  hasScrollAnchor?: boolean
  copied?: boolean
  copyToClipboard?: () => void
  onReload?: () => void
  parts?: MessageAISDK["parts"]
  status?: "streaming" | "ready" | "submitted" | "error"
  className?: string
}

export function MessageAssistant({
  children,
  isLast,
  hasScrollAnchor,
  copied,
  copyToClipboard,
  onReload,
  parts,
  status,
  className,
}: MessageAssistantProps) {
  const { preferences } = useUserPreferences()
  const isMobile = useBreakpoint(768)

  const [showActions, setShowActions] = useState(false)
  const actionsRef = useRef<HTMLDivElement>(null)

  useClickOutside(actionsRef, () => {
    if (showActions) {
      setShowActions(false)
    }
  })

  const toggleActions = (e: React.MouseEvent) => {
    if (!isMobile) return
    e.stopPropagation()
    setShowActions(!showActions)
  }

  const sources = getSources(parts)
  const toolInvocationParts = parts?.filter(
    (part) => part.type === "tool-invocation"
  )
  const reasoningParts = parts?.find((part) => part.type === "reasoning")
  const contentNullOrEmpty = children === null || children === ""
  const isLastStreaming = status === "streaming" && isLast
  const searchImageResults =
    parts
      ?.filter(
        (part) =>
          part.type === "tool-invocation" &&
          part.toolInvocation?.state === "result" &&
          part.toolInvocation?.toolName === "imageSearch" &&
          part.toolInvocation?.result?.content?.[0]?.type === "images"
      )
      .flatMap((part) =>
        part.type === "tool-invocation" &&
        part.toolInvocation?.state === "result" &&
        part.toolInvocation?.toolName === "imageSearch" &&
        part.toolInvocation?.result?.content?.[0]?.type === "images"
          ? (part.toolInvocation?.result?.content?.[0]?.results ?? [])
          : []
      ) ?? []

  return (
    <Message
      className={cn(
        "group flex w-full max-w-3xl flex-1 items-start gap-4 px-4 pb-2",
        hasScrollAnchor && "min-h-scroll-anchor",
        className
      )}
    >
      <div
        className={cn("flex min-w-full flex-col gap-2", isLast && "pb-8")}
        onClick={toggleActions}
      >
        {reasoningParts && reasoningParts.reasoning && (
          <Reasoning
            reasoning={reasoningParts.reasoning}
            isStreaming={status === "streaming"}
          />
        )}

        {toolInvocationParts &&
          toolInvocationParts.length > 0 &&
          preferences.showToolInvocations && (
            <ToolInvocation toolInvocations={toolInvocationParts} />
          )}

        {searchImageResults.length > 0 && (
          <SearchImages results={searchImageResults} />
        )}

        {contentNullOrEmpty ? null : (
          <MessageContent
            className={cn(
              "prose dark:prose-invert relative min-w-full bg-transparent p-0",
              "prose-h1:scroll-m-20 prose-h1:text-2xl prose-h1:font-semibold prose-h2:mt-8 prose-h2:scroll-m-20 prose-h2:text-xl prose-h2:mb-3 prose-h2:font-medium prose-h3:scroll-m-20 prose-h3:text-base prose-h3:font-medium prose-h4:scroll-m-20 prose-h5:scroll-m-20 prose-h6:scroll-m-20 prose-strong:font-medium prose-table:block prose-table:overflow-y-auto"
            )}
            markdown={true}
          >
            {children}
          </MessageContent>
        )}

        {sources && sources.length > 0 && <SourcesList sources={sources} />}

        {Boolean(isLastStreaming || contentNullOrEmpty) ? null : (
          <MessageActions
            ref={actionsRef}
            className={cn(
              "-ml-2 flex gap-0 transition-opacity",
              showActions
                ? "opacity-100"
                : isLast
                  ? ""
                  : "opacity-0 group-hover:opacity-100"
            )}
          >
            <MessageAction
              tooltip={copied ? "Copied!" : "Copy text"}
              side="bottom"
            >
              <button
                className="hover:bg-accent/60 text-muted-foreground hover:text-foreground flex size-7.5 items-center justify-center rounded-full bg-transparent transition"
                aria-label="Copy text"
                onClick={(e) => {
                  e.stopPropagation()
                  copyToClipboard?.()
                }}
                type="button"
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </MessageAction>
            {isLast ? (
              <div className="flex w-full items-center justify-between">
                <MessageAction
                  tooltip="Regenerate"
                  side="bottom"
                  delayDuration={0}
                >
                  <button
                    className="hover:bg-accent/60 text-muted-foreground hover:text-foreground flex size-7.5 items-center justify-center rounded-full bg-transparent transition"
                    aria-label="Regenerate"
                    onClick={(e) => {
                      e.stopPropagation()
                      onReload?.()
                    }}
                    type="button"
                  >
                    <ArrowClockwise className="size-4" />
                  </button>
                </MessageAction>
                <div className="inline-flex text-xs text-end select-none hover:underline hover:underline-offset-2">
                  {APP_NAME} can make mistakes. <br className="md:hidden" /> Please double-check responses.
                </div>
              </div>
            ) : null}
          </MessageActions>
        )}
      </div>
    </Message>
  )
}
