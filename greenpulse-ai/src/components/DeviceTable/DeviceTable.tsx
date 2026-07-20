import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { DeviceRow } from "@/components/DeviceRow/DeviceRow";
import { Pagination } from "./Pagination";
import { DeviceTableSkeleton } from "@/components/LoadingSkeleton/Skeleton";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { cn } from "@/lib/utils";
import type { Device, DeviceListParams } from "@/types";

interface Column {
  key: NonNullable<DeviceListParams["sortBy"]> | "issue" | "recommendation" | "actions" | "support";
  label: string;
  sortable?: boolean;
}

const COLUMNS: Column[] = [
  { key: "model", label: "Device", sortable: true },
  { key: "health", label: "Health", sortable: true },
  { key: "riskLevel", label: "Risk Level", sortable: true },
  { key: "issue", label: "Issue" },
  { key: "aiConfidence", label: "AI Confidence", sortable: true },
  { key: "recommendation", label: "Recommendation" },
  { key: "recommendation", label: "ETA" },
  { key: "support", label: "" },
  { key: "actions", label: "" },
];

interface DeviceTableProps {
  devices: Device[];
  total: number;
  page: number;
  pageSize: number;
  sortBy?: DeviceListParams["sortBy"];
  sortDir?: DeviceListParams["sortDir"];
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onSortChange?: (sortBy: NonNullable<DeviceListParams["sortBy"]>) => void;
  onDeviceAction?: (device: Device) => void;
  onDeviceSupport?: (device: Device) => void;
  onDeviceMenu?: (device: Device) => void;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  hidePagination?: boolean;
}

/**
 * Reusable, backend-ready data table for devices. Sorting/filtering/search/
 * pagination are all owned by the parent (Dashboard's "Devices Requiring
 * Attention" section and the full /devices page both use this with
 * different DeviceListParams), so this component only renders.
 */
export function DeviceTable({
  devices,
  total,
  page,
  pageSize,
  sortBy,
  sortDir,
  isLoading,
  onPageChange,
  onSortChange,
  onDeviceAction,
  onDeviceSupport,
  onDeviceMenu,
  emptyActionLabel,
  onEmptyAction,
  hidePagination,
}: DeviceTableProps) {
  if (isLoading) {
    return <DeviceTableSkeleton rows={Math.min(pageSize, 5)} />;
  }

  if (devices.length === 0) {
    return (
      <EmptyState
        title="No devices match these filters"
        description="Try adjusting your search or filters to see more results."
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              {COLUMNS.map((col, i) => (
                <th
                  key={`${col.key}-${i}`}
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-ink-muted"
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange?.(col.key as NonNullable<DeviceListParams["sortBy"]>)}
                      className={cn(
                        "inline-flex items-center gap-1 hover:text-ink",
                        sortBy === col.key && "text-brand-700"
                      )}
                    >
                      {col.label}
                      {sortBy === col.key ? (
                        sortDir === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <DeviceRow
                key={device.id}
                device={device}
                onRecommendationClick={onDeviceAction}
                onSupportClick={onDeviceSupport}
                onMenuClick={onDeviceMenu}
              />
            ))}
          </tbody>
        </table>
      </div>

      {!hidePagination && (
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
      )}
    </div>
  );
}
