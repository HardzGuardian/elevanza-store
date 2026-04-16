import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Skeleton */}
        <aside className="w-full lg:w-64 space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-lg" />
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid Skeleton */}
        <div className="flex-grow space-y-10">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
