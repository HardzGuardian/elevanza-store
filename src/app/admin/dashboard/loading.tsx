export default function DashboardLoading() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-36 bg-neutral-200 rounded-lg" />
        <div className="h-4 w-64 bg-neutral-100 rounded-lg" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-neutral-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-neutral-100 rounded" />
              <div className="w-8 h-8 bg-neutral-100 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <div className="h-8 w-28 bg-neutral-200 rounded-lg" />
              <div className="h-3 w-20 bg-neutral-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart + recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-100 p-5 space-y-4">
          <div className="h-4 w-24 bg-neutral-200 rounded" />
          <div className="flex items-end gap-px h-28">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-neutral-100 rounded-t-sm"
                style={{ height: `${20 + Math.random() * 70}%` }}
              />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-100 p-5 space-y-3">
          <div className="h-4 w-28 bg-neutral-200 rounded" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="h-3.5 w-16 bg-neutral-200 rounded" />
                <div className="h-3 w-24 bg-neutral-100 rounded" />
              </div>
              <div className="h-3.5 w-14 bg-neutral-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
