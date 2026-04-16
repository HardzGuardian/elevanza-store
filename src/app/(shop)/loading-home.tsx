import { Skeleton } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div className="space-y-24 pb-24">
      {/* Hero Skeleton */}
      <section className="relative h-[85vh] flex items-center overflow-hidden bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-2xl space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-24 w-full md:w-[600px]" />
              <Skeleton className="h-6 w-full md:w-[400px]" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-16 w-40 rounded-full" />
              <Skeleton className="h-16 w-40 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-16">
          <div className="space-y-4">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-2 w-24" />
          </div>
          <Skeleton className="h-4 w-48 hidden md:block" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-[3rem]" />
          ))}
        </div>
      </section>
    </div>
  );
}
