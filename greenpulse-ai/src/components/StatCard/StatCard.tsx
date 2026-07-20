import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  icon?: React.ReactNode;
  value: React.ReactNode;
  meta?: React.ReactNode;
  chart?: React.ReactNode;
  onInfoClick?: () => void;
  className?: string;
}

/** The four top stat cards on /dashboard: Fleet Health, Critical Devices, Repair Cost, Sustainability */
export function StatCard({ title, icon, value, meta, chart, onInfoClick, className }: StatCardProps) {
  return (
    <div className={cn("rounded-card border border-border bg-surface p-5 shadow-card", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-ink-muted">{title}</span>
          <button
            type="button"
            onClick={onInfoClick}
            aria-label={`About ${title}`}
            className="text-ink-faint hover:text-ink-muted"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
        {icon}
      </div>

      <div className="mt-2 flex items-baseline gap-2">{value}</div>

      {meta && <div className="mt-1 text-xs text-ink-muted">{meta}</div>}

      {chart && <div className="mt-3">{chart}</div>}
    </div>
  );
}
