"use client"

import { Skeleton } from "./skeleton"

export const ProjectChatSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="mx-auto hidden w-full max-w-3xl space-y-2 px-4 py-6 lg:block">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-muted-foreground text-sm font-medium">
        Recent chats
      </h2>
    </div>
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`chat-skeleton-${index}`}
          className="border-border hover:bg-accent/50 group/chat relative rounded-lg border transition-colors"
        >
          <div className="w-full p-3">
            <div className="flex items-start justify-between">
              <div className="w-full flex-1">
                <Skeleton className="mb-2 h-6 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export const ProjectChatMobileSkeleton = ({
  count = 3,
}: {
  count?: number
}) => (
  <div className="mx-auto block w-full max-w-3xl space-y-2 px-4 py-6 lg:hidden">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-muted-foreground text-sm font-medium">
        Recent chats
      </h2>
    </div>
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`chat-skeleton-${index}`}
          className="border-border hover:bg-accent/50 group/chat relative rounded-lg border transition-colors"
        >
          <div className="w-full p-3">
            <div className="flex items-start justify-between">
              <div className="w-full flex-1">
                <Skeleton className="mb-2 h-6 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export const ProjectCardSkeleton = ({ count = 6 }: { count?: number }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={`project-skeleton-${index}`}
        className="group border-border bg-card hover:bg-accent/5 relative h-28 rounded-lg border-2 transition-all duration-300 hover:shadow-md"
      >
        <div className="from-primary/5 absolute inset-0 rounded-lg bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Corner borders */}
        <div className="border-primary/20 absolute top-0 left-0 h-3 w-3 rounded-tl-lg border-t-2 border-l-2" />
        <div className="border-primary/20 absolute top-0 right-0 h-3 w-3 rounded-tr-lg border-t-2 border-r-2" />
        <div className="border-primary/20 absolute bottom-0 left-0 h-3 w-3 rounded-bl-lg border-b-2 border-l-2" />
        <div className="border-primary/20 absolute right-0 bottom-0 h-3 w-3 rounded-br-lg border-r-2 border-b-2" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center p-3 text-center">
          <Skeleton className="mb-2 h-5 w-5 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Menu button skeleton */}
        <div className="absolute top-1.5 right-1.5 z-20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Skeleton className="h-6.5 w-6.5 rounded-md" />
        </div>
      </div>
    ))}
  </>
)