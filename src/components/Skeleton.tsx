const SkeletonCard = () => (
  <div className="flex-shrink-0 w-36 sm:w-44">
    <div className="shimmer rounded-lg aspect-[2/3] mb-2" />
    <div className="shimmer h-3 rounded w-3/4 mb-1" />
    <div className="shimmer h-3 rounded w-1/2" />
  </div>
);

export const SkeletonRow = () => (
  <div className="space-y-3">
    <div className="shimmer h-5 rounded w-40" />
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 7 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

export const SkeletonHero = () => (
  <div className="relative w-full aspect-[16/7] shimmer rounded-xl" />
);

export const SkeletonGrid = () => (
  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
    {Array.from({ length: 18 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
