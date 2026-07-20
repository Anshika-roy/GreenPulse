import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useMaintenance } from "@/hooks/useMaintenance";
import { MaintenanceTimelineItem } from "./MaintenanceTimelineItem";
import { Skeleton } from "@/components/LoadingSkeleton/Skeleton";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { CalendarClock } from "lucide-react";

/** "Upcoming Maintenance" card, right rail below AI Copilot on /dashboard */
export function MaintenanceTimeline() {
  const { data: events, isLoading } = useMaintenance();

  return (
    <div className="rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Upcoming Maintenance</h3>
        <Link
          to="/maintenance"
          className="flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
        >
          View calendar
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-2.5">
              <Skeleton className="h-11 w-11 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </div>
      ) : !events || events.length === 0 ? (
        <EmptyState icon={CalendarClock} title="Nothing scheduled" description="You're all caught up on maintenance." />
      ) : (
        <div className="space-y-1">
          {events.slice(0, 3).map((event) => (
            <MaintenanceTimelineItem key={event.id} event={event} />
          ))}
        </div>
      )}

      <Link
        to="/maintenance"
        className="mt-2 flex items-center justify-center gap-1 rounded-lg py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
      >
        View full calendar
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
