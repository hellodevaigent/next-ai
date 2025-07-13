export const NFTListSkeleton = () => {
  return (
    <div className="bg-background-quaternary rounded-lg p-4 shadow-sm mt-4">      
      <div className="relative mb-4 space-y-3">
        <div className="h-10 w-full bg-background-tertiary rounded-lg animate-pulse" />
        <div className="h-14 w-full bg-background-tertiary rounded-lg animate-pulse" />
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="group">
            <div className="bg-background-primary border border-border rounded-xl overflow-hidden">
              <div className="aspect-square bg-background-tertiary animate-pulse relative">
                <div className="absolute top-2 right-2">
                  <div className="h-5 w-12 bg-background-reverse-primary/50 rounded-full animate-pulse" />
                </div>
              </div>
              
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 bg-background-tertiary rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-background-tertiary rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}