import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md bg-border-subtle", className)} />;
}

export function DeviceTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-6 w-16 rounded-pill" />
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-20" />
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-card">
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="mt-3 h-8 w-16" />
      <Skeleton className="mt-4 h-10 w-full" />
    </div>
  );
}
