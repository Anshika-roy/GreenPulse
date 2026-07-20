import { cn } from "@/lib/utils";

/** Green confidence bar used in the "AI Confidence" table column (always brand green, unlike HealthBar) */
export function ConfidenceBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="w-9 shrink-0 text-sm font-medium text-ink">{value}%</span>
      <div className="h-1.5 w-20 overflow-hidden rounded-pill bg-border-subtle">
        <div
          className="h-full rounded-pill bg-brand-600 transition-all duration-300"
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
