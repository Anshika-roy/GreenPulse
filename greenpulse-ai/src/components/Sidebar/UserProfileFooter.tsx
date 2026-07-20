import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/Avatar/Avatar";
import { useLogout } from "@/hooks/useAuth";
import type { User } from "@/types";

interface UserProfileFooterProps {
  collapsed: boolean;
  user: User;
}

/** Bottom-of-sidebar user profile with sign-out menu */
export function UserProfileFooter({ collapsed, user }: UserProfileFooterProps) {
  const [open, setOpen] = useState(false);
  const logout = useLogout();

  return (
    <div className="relative border-t border-border p-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-surface-sunken"
      >
        <Avatar name={user.name} size="md" />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-medium text-ink">{user.name}</span>
              <span className="block truncate text-xs text-ink-muted">{user.role}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-ink-faint" />
          </>
        )}
      </button>

      {open && !collapsed && (
        <div className="absolute bottom-full left-3 right-3 mb-1 rounded-lg border border-border bg-surface py-1 shadow-popover">
          <button
            type="button"
            onClick={() => logout.mutate()}
            className="w-full px-3 py-2 text-left text-sm text-risk-high hover:bg-risk-high-bg"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
