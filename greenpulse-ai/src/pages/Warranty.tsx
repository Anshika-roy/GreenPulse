import { useMemo, useState } from "react";
import { ShieldCheck, ShieldAlert, Search } from "lucide-react";
import { useDevices } from "@/hooks/useDevices";
import { Skeleton } from "@/components/LoadingSkeleton/Skeleton";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { formatEta } from "@/services/deviceService";
import { cn } from "@/lib/utils";

const DAYS_30 = 30 * 24 * 60 * 60 * 1000;
const DAYS_90 = 90 * 24 * 60 * 60 * 1000;

type WarrantyFilter = "all" | "expiring-30" | "expiring-90";

export default function WarrantyPage() {
  const { data, isLoading } = useDevices({ page: 1, pageSize: 100, sortBy: "model", sortDir: "asc" });
  const [filter, setFilter] = useState<WarrantyFilter>("all");
  const [search, setSearch] = useState("");

  const now = Date.now();

  const rows = useMemo(() => {
    let devices = (data?.data ?? []).filter((d) => d.warrantyExpiresAt);
    if (search.trim()) {
      const q = search.toLowerCase();
      devices = devices.filter((d) => d.model.toLowerCase().includes(q) || d.assetTag.toLowerCase().includes(q));
    }
    if (filter !== "all") {
      const window = filter === "expiring-30" ? DAYS_30 : DAYS_90;
      devices = devices.filter((d) => new Date(d.warrantyExpiresAt!).getTime() - now <= window);
    }
    return [...devices].sort(
      (a, b) => new Date(a.warrantyExpiresAt!).getTime() - new Date(b.warrantyExpiresAt!).getTime()
    );
  }, [data, filter, search, now]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Warranty</h1>
        <p className="mt-1 text-sm text-ink-muted">Track warranty coverage and plan renewals before it lapses.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by model or asset tag…"
            className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm focus:border-brand-500"
          />
        </div>
        {([
          ["all", "All devices"],
          ["expiring-30", "Expiring in 30 days"],
          ["expiring-90", "Expiring in 90 days"],
        ] as [WarrantyFilter, string][]).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              "rounded-pill border px-3 py-1.5 text-sm font-medium transition-colors",
              filter === value ? "border-brand-600 bg-brand-50 text-brand-700" : "border-border text-ink-muted hover:bg-surface-sunken"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-card border border-border bg-surface shadow-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No warranty records found" description="Try a different filter or search term." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
                const expiresAt = new Date(d.warrantyExpiresAt!).getTime();
                const expiringSoon = expiresAt - now <= DAYS_30;
                return (
                  <tr key={d.id} className="border-b border-border last:border-0 hover:bg-surface-sunken">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-ink">{d.model}</p>
                      <p className="text-xs text-ink-muted">{d.assetTag}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-muted">{d.location}</td>
                    <td className="px-4 py-3 text-sm text-ink">{formatEta(d.warrantyExpiresAt!)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium",
                          expiringSoon ? "bg-risk-high-bg text-risk-high" : "bg-risk-low-bg text-risk-low"
                        )}
                      >
                        {expiringSoon ? <ShieldAlert className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                        {expiringSoon ? "Expiring soon" : "Active"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
