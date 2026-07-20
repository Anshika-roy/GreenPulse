import { apiRequest } from "@/lib/apiClient";
import type { Alert } from "@/types";
import alertsMock from "@/mock/alerts.json";

let mutableAlerts = [...(alertsMock as Alert[])];

/** GET /api/alerts */
export function getAlerts(signal?: AbortSignal) {
  return apiRequest<Alert[]>("/alerts", {
    method: "GET",
    signal,
    mockResolver: () => mutableAlerts,
  });
}

/** PATCH /api/alerts/:id/read */
export function markAlertRead(id: string) {
  return apiRequest<Alert>(`/alerts/${id}/read`, {
    method: "PATCH",
    mockResolver: () => {
      mutableAlerts = mutableAlerts.map((a) => (a.id === id ? { ...a, isRead: true } : a));
      return mutableAlerts.find((a) => a.id === id)!;
    },
  });
}
