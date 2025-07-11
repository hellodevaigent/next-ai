export const TransactionHistorySkeleton = () => {
  return (
    <div className="bg-background-quaternary rounded-lg p-4 shadow-sm mt-4">      
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="border border-border rounded-lg overflow-hidden">
            <div className="p-3 flex justify-between items-center">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-24 bg-background-tertiary rounded animate-pulse" />
                  <div className="h-3 w-1 bg-background-tertiary rounded animate-pulse" />
                  <div className="h-3 w-16 bg-background-tertiary rounded animate-pulse" />
                </div>
                <div className="h-3 w-20 bg-background-tertiary rounded animate-pulse mt-1" />
              </div>
              
              <div className="flex flex-col items-end">
                <div className="h-4 w-20 bg-background-tertiary rounded animate-pulse" />
                <div className="h-5 w-5 bg-background-tertiary rounded animate-pulse mt-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}