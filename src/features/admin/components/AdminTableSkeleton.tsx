export function AdminTableSkeleton({
  rows = 8,
  showSearch = true,
  cols = [200, 140, 100, 80, 100],
}: {
  rows?: number;
  showSearch?: boolean;
  cols?: number[];
}) {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      {/* Page header */}
      <div className="space-y-2">
        <div className="h-7 w-44 bg-neutral-200 rounded-lg" />
        <div className="h-4 w-64 bg-neutral-100 rounded-lg" />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
        {showSearch && (
          <div className="px-4 py-3 border-b border-neutral-100">
            <div className="h-9 w-56 bg-neutral-100 rounded-lg" />
          </div>
        )}
        <div className="divide-y divide-neutral-50">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-5 py-4">
              {cols.map((w, j) => (
                <div key={j} className="h-4 bg-neutral-100 rounded-lg flex-shrink-0" style={{ width: w }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
