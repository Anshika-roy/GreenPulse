import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Leaf, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/Layout/SidebarContext";
import { NAV_ITEMS } from "./navItems";
import { CompanySwitcher } from "./CompanySwitcher";
import { UserProfileFooter } from "./UserProfileFooter";
import { useAlerts } from "@/hooks/useAlerts";
import { useCurrentUser } from "@/hooks/useAuth";

const FALLBACK_USER = {
  id: "usr-guest",
  name: "Guest User",
  role: "IT Administrator",
  email: "",
  company: { id: "co-guest", name: "Acme Global Corp." },
};

export function Sidebar() {
  const { collapsed, toggle } = useSidebar();
  const [company, setCompany] = useState("Acme Global Corp.");
  const { data: alerts } = useAlerts();
  const { data: user } = useCurrentUser();

  const unreadAlerts = alerts?.filter((a) => !a.isRead).length ?? 0;

  return (
    <nav className="flex h-full flex-col">
      {/* Logo */}
      <div className={cn("flex items-center gap-2 px-4 py-4", collapsed && "justify-center px-0")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Leaf className="h-4.5 w-4.5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">GreenPulse AI</p>
            <p className="truncate text-[11px] text-ink-muted">Enterprise Device Intelligence</p>
          </div>
        )}
      </div>

      <CompanySwitcher collapsed={collapsed} current={company} onChange={setCompany} />

      {/* Nav items */}
      <ul className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
        {NAV_ITEMS.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
                )
              }
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badgeKey === "alerts" && unreadAlerts > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-pill bg-risk-high px-1.5 text-[11px] font-semibold text-white">
                  {unreadAlerts}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Sustainability nudge card */}
      {!collapsed && (
        <div className="mx-3 mb-3 rounded-card border border-border bg-brand-50 p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand-100">
            <Leaf className="h-4.5 w-4.5 text-brand-600" />
          </div>
          <p className="text-sm text-ink">
            Every decision extends life. Reduce e-waste. Save costs.
          </p>
          <button type="button" className="mt-2 text-sm font-medium text-brand-700 hover:underline">
            Learn more →
          </button>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="mx-3 mb-2 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-ink-muted hover:bg-surface-sunken"
      >
        {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        {!collapsed && "Collapse"}
      </button>

      <UserProfileFooter collapsed={collapsed} user={user ?? FALLBACK_USER} />
    </nav>
  );
}
