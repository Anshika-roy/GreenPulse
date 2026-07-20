import { Search } from "lucide-react";
import type { DeviceCategory, RiskLevel } from "@/types";

interface DeviceTableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  riskLevel: RiskLevel | "all";
  onRiskLevelChange: (value: RiskLevel | "all") => void;
  category: DeviceCategory | "all";
  onCategoryChange: (value: DeviceCategory | "all") => void;
}

/** Search + filter controls above the device table. Used on the full /devices page. */
export function DeviceTableToolbar({
  search,
  onSearchChange,
  riskLevel,
  onRiskLevelChange,
  category,
  onCategoryChange,
}: DeviceTableToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by model, asset tag, or issue…"
          className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500"
        />
      </div>

      <select
        value={riskLevel}
        onChange={(e) => onRiskLevelChange(e.target.value as RiskLevel | "all")}
        className="h-9 rounded-lg border border-border bg-surface px-3 text-sm text-ink focus:border-brand-500"
      >
        <option value="all">All risk levels</option>
        <option value="high">High risk</option>
        <option value="medium">Medium risk</option>
        <option value="low">Low risk</option>
      </select>

      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value as DeviceCategory | "all")}
        className="h-9 rounded-lg border border-border bg-surface px-3 text-sm text-ink focus:border-brand-500"
      >
        <option value="all">All categories</option>
        <option value="laptop">Laptop</option>
        <option value="desktop">Desktop</option>
        <option value="monitor">Monitor</option>
        <option value="printer">Printer</option>
        <option value="mobile">Mobile</option>
        <option value="server">Server</option>
      </select>
    </div>
  );
}
