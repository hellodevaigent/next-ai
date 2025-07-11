import { Skeleton } from "./Skeleton";

export const SidebarSkeleton = ({ count = 8 }: { count?: number }) => (
  <ol className="space-y-1">
    {Array.from({ length: count }).map((_, index) => (
      <li key={`skeleton-${index}`} className="relative border border-transparent flex justify-between items-center rounded-lg py-1.5 px-2">
        <Skeleton className="w-[160px] md:w-[200px] h-5" />
        <Skeleton className="absolute right-2 w-5 h-5" />
      </li>
    ))}
  </ol>
);