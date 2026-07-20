import { apiRequest } from "@/lib/apiClient";
import dashboardMock from "@/mock/dashboard.json";
import type { FleetTrendPoint, SustainabilityStat } from "@/types";

export interface SustainabilityReport extends SustainabilityStat {
  monthlyTrend: FleetTrendPoint[];
  devicesExtendedLifespan: number;
  treesEquivalent: number;
}

/** GET /api/sustainability */
export function getSustainabilityReport(signal?: AbortSignal) {
  return apiRequest<SustainabilityReport>("/sustainability", {
    method: "GET",
    signal,
    mockResolver: (): SustainabilityReport => ({
      ...dashboardMock.sustainability,
      monthlyTrend: [
        { date: "2025-01-01", value: 60 },
        { date: "2025-02-01", value: 85 },
        { date: "2025-03-01", value: 110 },
        { date: "2025-04-01", value: 145 },
        { date: "2025-05-01", value: 180 },
      ],
      devicesExtendedLifespan: 214,
      treesEquivalent: 46,
    }),
  });
}
