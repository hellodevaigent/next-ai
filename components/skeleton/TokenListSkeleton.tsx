import { useIsMobile } from "~/hooks/useBreakpoint";

export const TokenListSkeleton = () => {
  const isMobile = useIsMobile();
  return (
    <div className="bg-background-quaternary rounded-lg p-4 shadow-sm mt-4">      
      <div className="relative mb-4">
        <div className="h-10 w-full bg-background-tertiary rounded-lg animate-pulse" />
      </div>
      
      <div className="space-y-3">
        {Array.from({ length: isMobile ? 4 : 5 }).map((_, index) => (
          <div 
            key={index}
            className="border border-border rounded-lg overflow-hidden"
          >
            <div className="p-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-background-tertiary rounded-full animate-pulse" />
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-12 bg-background-tertiary rounded animate-pulse" />
                    <div className="h-3 w-20 bg-background-tertiary rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-16 bg-background-tertiary rounded animate-pulse" />
                    <div className="h-3 w-10 bg-background-tertiary rounded animate-pulse" />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-1">
                <div className="h-4 w-16 bg-background-tertiary rounded animate-pulse" />
                <div className="h-3 w-12 bg-background-tertiary rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
