import { useState } from "react";
import { useMaintenance } from "@/hooks/useMaintenance";
import { MaintenanceTimelineItem } from "@/components/MaintenanceTimeline/MaintenanceTimelineItem";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { Skeleton } from "@/components/LoadingSkeleton/Skeleton";
import { cn } from "@/lib/utils";
import type { MaintenancePriority } from "@/types";
import { CalendarClock } from "lucide-react";

const PRIORITY_FILTERS: (MaintenancePriority | "all")[] = ["all", "high", "medium", "low"];

export default function MaintenancePage() {
  const { data: events, isLoading } = useMaintenance();
  const [priority, setPriority] = useState<MaintenancePriority | "all">("all");

  const filtered = (events ?? []).filter((e) => priority === "all" || e.priority === priority);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Maintenance</h1>
        <p className="mt-1 text-sm text-ink-muted">Scheduled and upcoming maintenance across your fleet.</p>
      </div>

      <div className="flex gap-2">
        {PRIORITY_FILTERS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPriority(p)}
            className={cn(
              "rounded-pill border px-3 py-1.5 text-sm font-medium capitalize transition-colors",
              priority === p
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-border text-ink-muted hover:bg-surface-sunken"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="rounded-card border border-border bg-surface p-4 shadow-card">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={CalendarClock} title="No maintenance scheduled" description="Nothing matches this priority filter." />
        ) : (
          <div className="space-y-1">
            {filtered.map((event) => (
              <MaintenanceTimelineItem key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
