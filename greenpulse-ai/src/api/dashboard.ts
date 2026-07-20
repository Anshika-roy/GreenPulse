import { apiRequest } from "@/lib/apiClient";
import type { DashboardSummary } from "@/types";
import dashboardMock from "@/mock/dashboard.json";

/** GET /api/dashboard */
export function getDashboardSummary(signal?: AbortSignal) {
  return apiRequest<DashboardSummary>("/dashboard", {
    method: "GET",
    signal,
    mockResolver: () => dashboardMock as DashboardSummary,
  });
}
