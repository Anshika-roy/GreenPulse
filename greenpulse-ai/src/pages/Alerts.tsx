import { useState } from "react";
import { CircleAlert, TriangleAlert, Info, BellOff } from "lucide-react";
import { useAlerts, useMarkAlertRead } from "@/hooks/useAlerts";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { Skeleton } from "@/components/LoadingSkeleton/Skeleton";
import { Button } from "@/components/Buttons/Button";
import { cn } from "@/lib/utils";
import type { AlertSeverity } from "@/types";

const SEVERITY_ICON: Record<AlertSeverity, React.ElementType> = {
  critical: CircleAlert,
  warning: TriangleAlert,
  info: Info,
};
const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  critical: "text-risk-high bg-risk-high-bg",
  warning: "text-risk-medium bg-risk-medium-bg",
  info: "text-info bg-info-bg",
};
const FILTERS: (AlertSeverity | "all")[] = ["all", "critical", "warning", "info"];

export default function AlertsPage() {
  const { data: alerts, isLoading } = useAlerts();
  const markRead = useMarkAlertRead();
  const [severity, setSeverity] = useState<AlertSeverity | "all">("all");

  const filtered = (alerts ?? []).filter((a) => severity === "all" || a.severity === severity);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Alerts</h1>
        <p className="mt-1 text-sm text-ink-muted">Real-time issues detected across your device fleet.</p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setSeverity(f)}
            className={cn(
              "rounded-pill border px-3 py-1.5 text-sm font-medium capitalize transition-colors",
              severity === f
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-border text-ink-muted hover:bg-surface-sunken"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-card border border-border bg-surface shadow-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={BellOff} title="No alerts" description="Nothing matches this filter right now." />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((alert) => {
              const Icon = SEVERITY_ICON[alert.severity];
              return (
                <div key={alert.id} className="flex items-start gap-3 px-4 py-4">
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", SEVERITY_COLOR[alert.severity])}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{alert.title}</p>
                    <p className="mt-0.5 text-sm text-ink-muted">{alert.description}</p>
                    <p className="mt-1 text-xs text-ink-faint">{new Date(alert.createdAt).toLocaleString()}</p>
                  </div>
                  {!alert.isRead && (
                    <Button size="sm" variant="secondary" onClick={() => markRead.mutate(alert.id)}>
                      Mark read
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
