import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  Laptop,
  Wrench,
  Bell,
  Ticket,
  ShieldCheck,
  FileBarChart2,
  Leaf,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badgeKey?: "alerts";
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Overview", path: "/dashboard", icon: LayoutGrid },
  { label: "Devices", path: "/devices", icon: Laptop },
  { label: "Maintenance", path: "/maintenance", icon: Wrench },
  { label: "Alerts", path: "/alerts", icon: Bell, badgeKey: "alerts" },
  { label: "Tickets", path: "/tickets", icon: Ticket },
  { label: "Warranty", path: "/warranty", icon: ShieldCheck },
  { label: "Reports", path: "/reports", icon: FileBarChart2 },
  { label: "Sustainability", path: "/sustainability", icon: Leaf },
  { label: "Settings", path: "/settings", icon: Settings },
];
