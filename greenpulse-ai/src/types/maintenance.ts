export type MaintenancePriority = "high" | "medium" | "low";

export interface MaintenanceEvent {
  id: string;
  date: string; // ISO date
  title: string; // e.g. "12 Batteries"
  description: string; // e.g. "Replacement Scheduled"
  location: string;
  priority: MaintenancePriority;
  deviceIds: string[];
}
