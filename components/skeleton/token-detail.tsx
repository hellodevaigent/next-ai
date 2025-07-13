import { Skeleton } from "./skeleton";

interface TokenDetailSkeletonProps {
  className?: string;
}

export const TokenDetailSkeleton = ({
  className,
}: TokenDetailSkeletonProps) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="px-4 py-5 space-y-4">
        <div className="bg-background-tertiary/30 rounded-lg overflow-hidden">
          <div className="w-full px-3 py-2 flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="size-4 rounded" />
          </div>
        </div>

        <div className="bg-background-tertiary/30 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>

          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>

          <div className="flex justify-between">
            <Skeleton className="h-4 w-28" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="size-3 rounded" />
            </div>
          </div>
        </div>
        <div className="w-full">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
};
