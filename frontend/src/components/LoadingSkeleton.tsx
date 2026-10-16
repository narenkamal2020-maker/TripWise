interface Props {
  count?: number;
}

function SkeletonCard({ featured = false }: { featured?: boolean }) {
  return (
    <div
      className={`bg-paper-50 dark:bg-forest-800/60 border border-paper-300 dark:border-forest-700 rounded-2xl overflow-hidden animate-pulse ${featured ? 'flex flex-col sm:flex-row min-h-[280px]' : ''}`}
      aria-hidden="true"
    >
      <div className={`bg-paper-300 dark:bg-forest-700 ${featured ? 'w-full sm:w-[55%] min-h-[200px]' : 'h-48'}`} />
      <div className="p-5 space-y-3 flex-1">
        <div className="h-3 bg-paper-300 dark:bg-forest-700 rounded-full w-1/4" />
        <div className="h-6 bg-paper-300 dark:bg-forest-700 rounded w-4/5" />
        {featured && <div className="h-6 bg-paper-300 dark:bg-forest-700 rounded w-3/5" />}
        <div className="h-4 bg-paper-200 dark:bg-forest-700/60 rounded w-2/3" />
        {featured && (
          <>
            <div className="h-3 bg-paper-200 dark:bg-forest-700/60 rounded w-full" />
            <div className="h-3 bg-paper-200 dark:bg-forest-700/60 rounded w-5/6" />
          </>
        )}
        <div className={`bg-paper-200 dark:bg-forest-700/60 rounded-xl ${featured ? 'h-10 w-32 mt-4' : 'h-9 w-full mt-3'}`} />
      </div>
    </div>
  );
}

export function LoadingSkeleton({ count = 6 }: Props) {
  return (
    <div
      role="status"
      aria-label="Loading destinations"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={i === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}>
          <SkeletonCard featured={i === 0} />
        </div>
      ))}
    </div>
  );
}
