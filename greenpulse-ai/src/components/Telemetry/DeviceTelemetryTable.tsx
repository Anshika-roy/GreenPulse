import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { Pagination } from "@/components/DeviceTable/Pagination";
import { Skeleton } from "@/components/LoadingSkeleton/Skeleton";
import { RiskBadge } from "@/components/Badges/RiskBadge";
import { HealthBar } from "@/components/ProgressBar/HealthBar";
import type { Device } from "@/types";
import { getDeviceTelemetry } from "@/api/telemetry";
import {
  buildTelemetrySnapshot,
  formatTelemetryTimestamp,
  formatTelemetryValue,
} from "@/services/telemetryService";

interface DeviceTelemetryTableProps {
  devices: Device[];
  total: number;
  page: number;
  pageSize: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onDeviceSelect?: (device: Device) => void;
  hidePagination?: boolean;
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid grid-cols-8 gap-4 px-4 py-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </div>
  );
}

export function DeviceTelemetryTable({
  devices,
  total,
  page,
  pageSize,
  isLoading,
  onPageChange,
  onDeviceSelect,
  hidePagination,
}: DeviceTelemetryTableProps) {
  const telemetryQueries = useQueries({
    queries: devices.map((device) => ({
      queryKey: ["telemetry", "dashboard", device.id],
      queryFn: ({ signal }: { signal: AbortSignal }) => getDeviceTelemetry(device.id, { limit: 100 }, signal),
      enabled: Boolean(device.id),
      retry: false,
      staleTime: 30_000,
    })),
  });

  const rows = useMemo(
    () =>
      devices.map((device, index) => {
        const result = telemetryQueries[index];
        const readings = result?.data ?? [];
        const snapshot = buildTelemetrySnapshot(readings);

        return {
          device,
          readings,
          snapshot,
          isLoadingTelemetry: result?.isLoading,
          isErrorTelemetry: result?.isError,
        };
      }),
    [devices, telemetryQueries]
  );

  if (isLoading) {
    return <TableSkeleton rows={Math.min(pageSize, 5)} />;
  }

  if (!devices.length) {
    return (
      <EmptyState title="No devices available" description="No device telemetry is available yet." />
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              {[
                "Device",
                "Status",
                "Health",
                "Risk",
                "Battery",
                "SSD",
                "CPU Temp",
                "Last Telemetry",
              ].map((label) => (
                <th
                  key={label}
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-ink-muted"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ device, snapshot, isLoadingTelemetry, isErrorTelemetry }) => {
              const battery = snapshot.latestByMetric.battery_health_percent;
              const ssd = snapshot.latestByMetric.ssd_health_percent ?? snapshot.latestByMetric.ssd_wear_percent;
              const cpu = snapshot.latestByMetric.cpu_temperature_c;

              return (
                <tr key={device.id} className="border-b border-border last:border-0 hover:bg-surface-sunken">
                  <td className="px-4 py-4">
                    <Link
                      to={`/device/${device.id}`}
                      onClick={() => onDeviceSelect?.(device)}
                      className="group flex min-w-0 items-center gap-3"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink group-hover:text-brand-700">
                          {device.model}
                        </span>
                        <span className="block truncate text-xs text-ink-muted">{device.assetTag}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-sm text-ink">
                    <span className="rounded-pill bg-surface-sunken px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
                      {device.status.replaceAll("_", "-")}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <HealthBar value={device.healthScore} riskLevel={device.riskLevel} />
                  </td>
                  <td className="px-4 py-4">
                    <RiskBadge level={device.riskLevel} />
                  </td>
                  <td className="px-4 py-4 text-sm text-ink">
                    {isLoadingTelemetry ? "Loading…" : isErrorTelemetry ? "Unavailable" : battery ? formatTelemetryValue(battery.metricType, battery.value, battery.unit) : "—"}
                  </td>
                  <td className="px-4 py-4 text-sm text-ink">
                    {isLoadingTelemetry ? "Loading…" : isErrorTelemetry ? "Unavailable" : ssd ? formatTelemetryValue(ssd.metricType, ssd.value, ssd.unit) : "—"}
                  </td>
                  <td className="px-4 py-4 text-sm text-ink">
                    {isLoadingTelemetry ? "Loading…" : isErrorTelemetry ? "Unavailable" : cpu ? formatTelemetryValue(cpu.metricType, cpu.value, cpu.unit) : "—"}
                  </td>
                  <td className="px-4 py-4 text-sm text-ink-muted">
                    {isLoadingTelemetry ? "Loading…" : snapshot.lastTelemetryAt ? formatTelemetryTimestamp(snapshot.lastTelemetryAt) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!hidePagination && <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />}
    </div>
  );
}
