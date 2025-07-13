"use client"

import { Skeleton } from "./skeleton";

export const SidebarProjectSkeleton = ({ count = 8 }: { count?: number }) => (
  <ol className="space-y-0.5">
    {Array.from({ length: count }).map((_, index) => (
      <li key={`skeleton-${index}`} className="relative border border-transparent flex space-x-3 items-center rounded-lg py-1.5 px-2">
        <Skeleton className="w-5 h-5" />
        <Skeleton className="w-[160px] md:w-[200px] h-5" />
      </li>
    ))}
  </ol>
);

export const SidebarChatSkeleton = ({ count = 8 }: { count?: number }) => (
  <ol className="space-y-0.5">
    {Array.from({ length: count }).map((_, index) => (
      <li key={`skeleton-${index}`} className="relative border border-transparent flex space-x-3 items-center rounded-lg py-1.5 px-2">
        <Skeleton className="w-[160px] md:w-[200px] h-5" />
        <Skeleton className="w-5 h-5" />
      </li>
    ))}
  </ol>
);