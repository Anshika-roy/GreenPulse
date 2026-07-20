import { cn } from "@/lib/utils";
import type { MaintenanceEvent, MaintenancePriority } from "@/types";
import { formatMaintenanceDate } from "@/services/maintenanceService";

const PRIORITY_COLOR: Record<MaintenancePriority, string> = {
  high: "bg-brand-600",
  medium: "bg-info",
  low: "bg-ink-muted",
};

interface MaintenanceTimelineItemProps {
  event: MaintenanceEvent;
  onClick?: (event: MaintenanceEvent) => void;
}

/** One row in the "Upcoming Maintenance" list: date chip + title/description/location */
export function MaintenanceTimelineItem({ event, onClick }: MaintenanceTimelineItemProps) {
  const { month, day } = formatMaintenanceDate(event.date);

  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-surface-sunken"
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg text-white",
          PRIORITY_COLOR[event.priority]
        )}
      >
        <span className="text-[10px] font-medium leading-none">{month}</span>
        <span className="text-base font-semibold leading-tight">{day}</span>
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-ink">{event.title}</span>
        <span className="block truncate text-xs text-ink-muted">
          {event.description} · {event.location}
        </span>
      </span>
    </button>
  );
}
