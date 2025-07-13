import { Skeleton } from "./skeleton";

export const NFTCollectionDetailSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">      
      <div className='px-4 py-5 space-y-4'>
        <div className="h-[120px] w-full relative flex justify-center items-center overflow-hidden rounded-lg bg-background-tertiary animate-pulse">
          <div className='w-full absolute z-[1] h-full'>
            <Skeleton className="size-full rounded-lg" />
          </div>

          <div className="bg-background-tertiary rounded-full p-1 overflow-hidden relative z-[2] border-2 border-background-primary">
            <Skeleton className="size-16 rounded-full" />
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="text-center space-y-2">
            <Skeleton className="h-6 w-32 mx-auto" />
            <Skeleton className="h-4 w-16 mx-auto" />
          </div>

          <div className="flex justify-between">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
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
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="size-3" />
            </div>
          </div>

          <div className="flex justify-between">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex-shrink-0">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <Skeleton className="h-3 w-8 mt-1 mx-auto" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Explorer Button Skeleton */}
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}