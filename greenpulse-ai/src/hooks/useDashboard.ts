import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboardService";

export const dashboardKeys = {
  summary: ["dashboard", "summary"] as const,
};

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.summary,
    queryFn: ({ signal }) => dashboardService.fetchSummary(signal),
    staleTime: 60_000,
  });
}
