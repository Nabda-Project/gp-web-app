export function SkeletonList({ count = 6, avatar = true }: { count?: number; avatar?: boolean }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 rounded-2xl border border-lightGrey/60 bg-white p-4 transition-colors dark:bg-surface">
          {avatar ? <div className="shimmer h-12 w-12 rounded-full" /> : null}
          <div className="flex-1 space-y-2">
            <div className="shimmer h-4 w-2/3 rounded" />
            <div className="shimmer h-3 w-1/3 rounded" />
          </div>
          <div className="shimmer h-8 w-16 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function Spinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="grid min-h-48 place-items-center text-primary">
      <span className="flex items-center gap-3 text-sm font-semibold">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
        {label}
      </span>
    </div>
  );
}
