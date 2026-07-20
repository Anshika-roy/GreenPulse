export type AlertSeverity = "critical" | "warning" | "info";

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  deviceId?: string;
  createdAt: string;
  isRead: boolean;
}
