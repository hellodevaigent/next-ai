const SkeletonItem: React.FC = () => {
  return (
    <div className="border-b border-border">
      <div className="flex flex-col justify-center px-4 py-5 h-20">
        <div className="bg-background-tertiary h-4 w-1/2 rounded mb-2 animate-pulse"></div>
        <div className="bg-background-tertiary h-3 w-4/5 rounded mb-1 animate-pulse"></div>
        <div className="bg-background-tertiary h-3 w-1/3 rounded animate-pulse"></div>
      </div>
    </div>
  );
};

export const HistorySkeleton: React.FC = () => {
  return (
    <div className="w-full">
      {[1, 2, 3, 4, 5].map(item => (
        <SkeletonItem key={item} />
      ))}
    </div>
  );
};