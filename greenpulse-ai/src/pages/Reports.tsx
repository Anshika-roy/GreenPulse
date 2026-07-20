import { FileDown, FileBarChart2 } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { useDevices } from "@/hooks/useDevices";
import { Button } from "@/components/Buttons/Button";
import { Sparkline } from "@/components/Charts/Sparkline";
import { Skeleton } from "@/components/LoadingSkeleton/Skeleton";
import { formatInrAsLakhs } from "@/services/dashboardService";

/**
 * Reports page: exportable fleet summary. "Export" handlers are stubbed to
 * hit a future /api/reports/export endpoint — wired for real once backend exists.
 */
export default function ReportsPage() {
  const { data: summary, isLoading } = useDashboard();
  const { data: deviceData } = useDevices({ page: 1, pageSize: 1 });

  function handleExport(format: "pdf" | "csv") {
    // TODO: replace with real GET /api/reports?format=... download once backend exists
    alert(`Exporting fleet report as ${format.toUpperCase()} (mock — connect to /api/reports)`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">Reports</h1>
          <p className="mt-1 text-sm text-ink-muted">Fleet-wide summaries you can export and share.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => handleExport("csv")}>
            <FileDown className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => handleExport("pdf")}>
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {isLoading || !summary ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-card" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <p className="text-sm text-ink-muted">Total Devices Analyzed</p>
            <p className="mt-2 text-3xl font-bold text-ink">{summary.actionPlan.devicesAnalyzed.toLocaleString("en-IN")}</p>
          </div>
          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <p className="text-sm text-ink-muted">Estimated Savings</p>
            <p className="mt-2 text-3xl font-bold text-brand-600">
              {formatInrAsLakhs(summary.actionPlan.estimatedSavingsInr)}
            </p>
          </div>
          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <p className="text-sm text-ink-muted">Fleet Health Trend</p>
            <p className="mt-2 text-3xl font-bold text-ink">{summary.fleetHealth.score}/100</p>
            <Sparkline data={summary.fleetHealth.trend} color="#3E9C49" height={48} />
          </div>
        </div>
      )}

      <div className="rounded-card border border-border bg-surface p-8 text-center shadow-card">
        <FileBarChart2 className="mx-auto h-8 w-8 text-ink-faint" />
        <p className="mt-3 text-sm font-medium text-ink">
          {deviceData?.total ?? "—"} devices currently tracked
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          Detailed per-device and per-department breakdowns will appear here once connected to{" "}
          <code className="rounded bg-surface-sunken px-1.5 py-0.5 text-xs">GET /api/reports</code>.
        </p>
      </div>
    </div>
  );
}
