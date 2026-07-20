import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types";

const FILL_COLOR: Record<RiskLevel, string> = {
  high: "bg-risk-high",
  medium: "bg-risk-medium",
  low: "bg-risk-low",
};

interface HealthBarProps {
  value: number; // 0-100
  riskLevel: RiskLevel;
  showLabel?: boolean;
  className?: string;
}

/** Horizontal health/confidence bar used in the device table (Health, AI Confidence columns) */
export function HealthBar({ value, riskLevel, showLabel = true, className }: HealthBarProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showLabel && (
        <span className="w-9 shrink-0 text-sm font-medium text-ink">{value}%</span>
      )}
      <div className="h-1.5 w-20 overflow-hidden rounded-pill bg-border-subtle">
        <div
          className={cn("h-full rounded-pill transition-all duration-300", FILL_COLOR[riskLevel])}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
