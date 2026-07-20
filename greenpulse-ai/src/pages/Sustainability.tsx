import { Leaf, Cloud, Recycle, TreePine } from "lucide-react";
import { useSustainability } from "@/hooks/useSustainability";
import { AreaSparkline } from "@/components/Charts/AreaSparkline";
import { Skeleton } from "@/components/LoadingSkeleton/Skeleton";

export default function SustainabilityPage() {
  const { data, isLoading } = useSustainability();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Sustainability</h1>
        <p className="mt-1 text-sm text-ink-muted">
          The environmental impact of extending device lifespans instead of early replacement.
        </p>
      </div>

      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-card" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Leaf className="h-4.5 w-4.5" />
            </span>
            <p className="mt-3 text-2xl font-bold text-ink">{data.ewastePreventedKg} kg</p>
            <p className="text-sm text-ink-muted">E-waste prevented</p>
          </div>
          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-info-bg text-info">
              <Cloud className="h-4.5 w-4.5" />
            </span>
            <p className="mt-3 text-2xl font-bold text-ink">{data.co2AvoidedKg} kg</p>
            <p className="text-sm text-ink-muted">CO₂ avoided</p>
          </div>
          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Recycle className="h-4.5 w-4.5" />
            </span>
            <p className="mt-3 text-2xl font-bold text-ink">{data.devicesExtendedLifespan}</p>
            <p className="text-sm text-ink-muted">Devices with extended lifespan</p>
          </div>
          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <TreePine className="h-4.5 w-4.5" />
            </span>
            <p className="mt-3 text-2xl font-bold text-ink">{data.treesEquivalent}</p>
            <p className="text-sm text-ink-muted">Equivalent trees saved</p>
          </div>
        </div>
      )}

      {!isLoading && data && (
        <div className="rounded-card border border-border bg-surface p-5 shadow-card">
          <h2 className="mb-1 text-sm font-semibold text-ink">E-waste Prevented — Monthly Trend</h2>
          <p className="mb-2 text-xs text-ink-muted">Cumulative kg prevented, year to date</p>
          <AreaSparkline data={data.monthlyTrend} color="#3E9C49" height={180} />
        </div>
      )}
    </div>
  );
}
