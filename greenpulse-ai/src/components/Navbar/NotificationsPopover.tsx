import { useState } from "react";
import { Bell, CircleAlert, TriangleAlert, Info } from "lucide-react";
import { IconButton } from "@/components/Buttons/IconButton";
import { NotificationDot } from "@/components/Badges/NotificationDot";
import { useAlerts, useMarkAlertRead } from "@/hooks/useAlerts";
import type { AlertSeverity } from "@/types";
import { cn } from "@/lib/utils";

const SEVERITY_ICON: Record<AlertSeverity, React.ElementType> = {
  critical: CircleAlert,
  warning: TriangleAlert,
  info: Info,
};

const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  critical: "text-risk-high",
  warning: "text-risk-medium",
  info: "text-info",
};

export function NotificationsPopover() {
  const [open, setOpen] = useState(false);
  const { data: alerts = [], isLoading } = useAlerts();
  const markRead = useMarkAlertRead();
  const unread = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="relative">
      <IconButton aria-label="Notifications" onClick={() => setOpen((o) => !o)}>
        <Bell className="h-4.5 w-4.5" />
        <NotificationDot count={unread} />
      </IconButton>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-96 rounded-lg border border-border bg-surface shadow-popover">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-ink">Notifications</p>
            <span className="text-xs text-ink-muted">{unread} unread</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-6 text-center text-sm text-ink-muted">Loading…</p>
            ) : alerts.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ink-muted">You're all caught up.</p>
            ) : (
              alerts.map((alert) => {
                const Icon = SEVERITY_ICON[alert.severity];
                return (
                  <button
                    key={alert.id}
                    type="button"
                    onClick={() => markRead.mutate(alert.id)}
                    className={cn(
                      "flex w-full gap-3 border-b border-border-subtle px-4 py-3 text-left last:border-0 hover:bg-surface-sunken",
                      !alert.isRead && "bg-brand-50/40"
                    )}
                  >
                    <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", SEVERITY_COLOR[alert.severity])} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">{alert.title}</span>
                      <span className="block text-xs text-ink-muted line-clamp-2">{alert.description}</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
