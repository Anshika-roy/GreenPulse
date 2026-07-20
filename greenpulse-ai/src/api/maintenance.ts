import { apiRequest } from "@/lib/apiClient";
import type { MaintenanceEvent } from "@/types";
import maintenanceMock from "@/mock/maintenance.json";

/** GET /api/maintenance */
export function getMaintenanceEvents(signal?: AbortSignal) {
  return apiRequest<MaintenanceEvent[]>("/maintenance", {
    method: "GET",
    signal,
    mockResolver: () => maintenanceMock as MaintenanceEvent[],
  });
}
