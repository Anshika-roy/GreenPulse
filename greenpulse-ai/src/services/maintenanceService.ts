import { getMaintenanceEvents } from "@/api/maintenance";

export const maintenanceService = {
  async list(signal?: AbortSignal) {
    const events = await getMaintenanceEvents(signal);
    return [...events].sort((a, b) => a.date.localeCompare(b.date));
  },
};

export function formatMaintenanceDate(isoDate: string) {
  const d = new Date(isoDate);
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate(),
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
  };
}
