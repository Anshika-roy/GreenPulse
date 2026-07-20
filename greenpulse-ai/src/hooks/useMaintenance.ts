import { useQuery } from "@tanstack/react-query";
import { maintenanceService } from "@/services/maintenanceService";

export function useMaintenance() {
  return useQuery({
    queryKey: ["maintenance", "list"],
    queryFn: ({ signal }) => maintenanceService.list(signal),
    staleTime: 60_000,
  });
}
