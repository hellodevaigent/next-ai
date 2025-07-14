"use client"

import { Skeleton } from "./skeleton"

export const SidebarChatSkeleton = ({ count = 8 }: { count?: number }) => (
  <ol className="space-y-0.5">
    {Array.from({ length: count }).map((_, index) => (
      <li
        key={`skeleton-${index}`}
        className="relative flex items-center space-x-3 rounded-lg border border-transparent px-2 py-1.5"
      >
        <Skeleton className="h-5 w-full md:w-[200px]" />
        <Skeleton className="h-5 w-5" />
      </li>
    ))}
  </ol>
)
