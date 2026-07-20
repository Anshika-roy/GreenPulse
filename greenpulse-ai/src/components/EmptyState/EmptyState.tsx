import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/Buttons/Button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Generic empty state — used by DeviceTable, Alerts, Tickets when a filtered/search result set is empty. */
export function EmptyState({ icon: Icon = Inbox, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-sunken text-ink-faint">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
