import { cn } from "@/lib/utils";
import type { DeviceRecommendation } from "@/types";

const COLORS: Record<DeviceRecommendation["actionType"], string> = {
  replace: "text-risk-high",
  "backup-replace": "text-risk-high",
  "clean-check": "text-risk-medium",
  diagnostics: "text-info",
  "schedule-service": "text-info",
  monitor: "text-ink-muted",
};

/** The colored, clickable recommendation label in the device table, e.g. "Replace in 14 days" */
export function ActionBadge({
  recommendation,
  onClick,
}: {
  recommendation: DeviceRecommendation;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-sm font-medium underline-offset-2 hover:underline",
        COLORS[recommendation.actionType]
      )}
    >
      {recommendation.action}
    </button>
  );
}
