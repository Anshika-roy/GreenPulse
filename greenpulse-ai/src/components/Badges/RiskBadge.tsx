import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types";

const STYLES: Record<RiskLevel, string> = {
  high: "bg-risk-high-bg text-risk-high",
  medium: "bg-risk-medium-bg text-risk-medium",
  low: "bg-risk-low-bg text-risk-low",
};

const LABELS: Record<RiskLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-medium",
        STYLES[level],
        className
      )}
    >
      {LABELS[level]}
    </span>
  );
}
