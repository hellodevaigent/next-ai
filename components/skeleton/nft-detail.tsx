import { Skeleton } from "./skeleton";

export const NFTDetailSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">      
      <div className='px-4 py-5 space-y-4'>
        <div className="h-52 w-full relative flex justify-center items-center overflow-hidden rounded-lg bg-background-tertiary animate-pulse">
          <div className="size-38 bg-background-secondary rounded-xl flex items-center justify-center">
            <Skeleton className="w-16 h-16" />
          </div>
        </div>

        <div className="space-y-3 text-sm">          
          <div className="flex justify-between">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>

          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="size-3" />
            </div>
          </div>
        </div>
        
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}