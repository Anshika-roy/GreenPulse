import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboard } from "@/hooks/useDashboard";
import { useDevices } from "@/hooks/useDevices";
import { ActionPlanCard } from "@/components/ActionPlan/ActionPlanCard";
import { StatCard } from "@/components/StatCard/StatCard";
import { StatCardSkeleton } from "@/components/LoadingSkeleton/Skeleton";
import { Sparkline } from "@/components/Charts/Sparkline";
import { AreaSparkline } from "@/components/Charts/AreaSparkline";
import {
  FleetHealthIcon,
  CriticalDevicesIcon,
  RepairCostIcon,
  EwasteIcon,
  Co2Icon,
} from "@/components/StatCard/StatCardIcons";
import { DeviceTable } from "@/components/DeviceTable/DeviceTable";
import { AICopilotPanel } from "@/components/AIChat/AICopilotPanel";
import { MaintenanceTimeline } from "@/components/MaintenanceTimeline/MaintenanceTimeline";
import type { Device } from "@/types";

const DASHBOARD_TABLE_PAGE_SIZE = 5;

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: summary, isLoading: summaryLoading } = useDashboard();
  const [page, setPage] = useState(1);

  const { data: deviceData, isLoading: devicesLoading } = useDevices({
    page,
    pageSize: DASHBOARD_TABLE_PAGE_SIZE,
    sortBy: "health",
    sortDir: "asc",
  });

  function handleDeviceAction(device: Device) {
    navigate(`/device/${device.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left column */}
        <div className="min-w-0 space-y-6">
          {summaryLoading || !summary ? (
            <div className="h-40 animate-pulse rounded-card border border-border bg-surface" />
          ) : (
            <ActionPlanCard
              actionPlan={summary.actionPlan}
              onViewPlan={() => navigate("/maintenance")}
            />
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryLoading || !summary ? (
              Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  title="Fleet Health Score"
                  icon={<FleetHealthIcon />}
                  value={
                    <>
                      <span className="text-3xl font-bold text-ink">{summary.fleetHealth.score}</span>
                      <span className="text-sm text-ink-muted">/100</span>
                    </>
                  }
                  meta={
                    <span className="text-brand-600">
                      ▲ {summary.fleetHealth.deltaVsLastWeek}% vs last week
                    </span>
                  }
                  chart={<Sparkline data={summary.fleetHealth.trend} color="#3E9C49" />}
                />
                <StatCard
                  title="Critical Devices"
                  icon={<CriticalDevicesIcon />}
                  value={<span className="text-3xl font-bold text-risk-high">{summary.criticalDevices.count}</span>}
                  meta={<span>{summary.criticalDevices.percentOfFleet}% of total devices</span>}
                  chart={<Sparkline data={summary.criticalDevices.trend} color="#E0473A" />}
                />
                <StatCard
                  title="Predicted Repair Cost"
                  icon={<RepairCostIcon />}
                  value={
                    <>
                      <span className="text-3xl font-bold text-ink">₹{summary.repairCost.amountInrLakhs}</span>
                      <span className="text-sm text-ink-muted">Lakhs</span>
                    </>
                  }
                  meta={<span>{summary.repairCost.horizonLabel}</span>}
                  chart={<AreaSparkline data={summary.repairCost.trend} color="#3B82F6" />}
                />
                <StatCard
                  title="Sustainability Impact"
                  value={
                    <div className="w-full space-y-2.5">
                      <div className="flex items-center gap-2">
                        <EwasteIcon />
                        <div>
                          <p className="text-lg font-bold leading-tight text-ink">
                            {summary.sustainability.ewastePreventedKg} kg
                          </p>
                          <p className="text-[11px] text-ink-muted">E-waste prevented</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Co2Icon />
                        <div>
                          <p className="text-lg font-bold leading-tight text-ink">
                            {summary.sustainability.co2AvoidedKg} kg
                          </p>
                          <p className="text-[11px] text-ink-muted">CO₂ avoided</p>
                        </div>
                      </div>
                    </div>
                  }
                />
              </>
            )}
          </div>

          <div className="rounded-card border border-border bg-surface shadow-card">
            <div className="flex items-center justify-between px-4 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
                Devices Requiring Attention
                <span className="rounded-pill bg-risk-high-bg px-2 py-0.5 text-xs font-medium text-risk-high">
                  {deviceData?.total ?? "—"}
                </span>
              </h2>
              <Link
                to="/devices"
                className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
              >
                View all devices
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <DeviceTable
              devices={deviceData?.data ?? []}
              total={deviceData?.total ?? 0}
              page={page}
              pageSize={DASHBOARD_TABLE_PAGE_SIZE}
              isLoading={devicesLoading}
              onPageChange={setPage}
              onDeviceAction={handleDeviceAction}
              onDeviceSupport={(d) => navigate(`/tickets?deviceId=${d.id}`)}
              onDeviceMenu={handleDeviceAction}
            />
          </div>
        </div>

        {/* Right rail */}
        <div className="flex min-w-0 flex-col gap-6 xl:h-full">
          <div className="min-h-[420px] flex-1">
            <AICopilotPanel />
          </div>
          <MaintenanceTimeline />
        </div>
      </div>
    </div>
  );
}
