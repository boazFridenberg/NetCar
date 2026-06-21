
export function VehicleCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[16/10] w-full rounded-none" />
      <div className="p-5">
        <div className="mb-3 flex gap-2">
          <div className="skeleton h-6 w-16 rounded-lg" />
          <div className="skeleton h-6 w-14 rounded-lg" />
        </div>
        <div className="skeleton h-5 w-3/4 rounded-md" />
        <div className="skeleton mt-2 h-4 w-1/2 rounded-md" />
        <div className="skeleton mt-5 h-7 w-2/5 rounded-md" />
        <div className="skeleton mt-5 h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function VehicleGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <VehicleCardSkeleton key={i} />
      ))}
    </>
  );
}
