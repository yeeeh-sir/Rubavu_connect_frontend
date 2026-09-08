export function PostCardSkeleton() {
  return (
    <div className="card mb-4">
      <div className="p-4 flex items-center gap-3">
        <div className="skeleton h-10 w-10 rounded-full" />
        <div className="flex-1">
          <div className="skeleton h-3 w-32 mb-2" />
          <div className="skeleton h-2 w-20" />
        </div>
      </div>
      <div className="skeleton h-72 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="skeleton h-24 w-24 rounded-full mx-auto sm:mx-0" />
        <div className="flex-1 text-center sm:text-left">
          <div className="skeleton h-5 w-40 mx-auto sm:mx-0 mb-2" />
          <div className="skeleton h-3 w-24 mx-auto sm:mx-0" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="text-center">
            <div className="skeleton h-6 w-12 mx-auto mb-1" />
            <div className="skeleton h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton aspect-square rounded-lg" />
      ))}
    </div>
  );
}

export function MessagesSkeleton() {
  return (
    <div className="flex h-[calc(100vh-8rem)]">
      <div className="w-72 border-r border-slate-200 p-2 space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <div className="skeleton h-10 w-10 rounded-full" />
            <div className="flex-1">
              <div className="skeleton h-3 w-24 mb-1" />
              <div className="skeleton h-2 w-32" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 p-6 flex flex-col justify-end gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`skeleton h-8 w-48 ${i % 2 ? 'self-end' : ''}`} />
        ))}
      </div>
    </div>
  );
}
