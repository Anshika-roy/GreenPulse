import { HelpCircle } from "lucide-react";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import { IconButton } from "@/components/Buttons/IconButton";
import { NotificationsPopover } from "./NotificationsPopover";
import { DatePicker } from "./DatePicker";
import { useSidebar } from "@/components/Layout/SidebarContext";
import { useCurrentUser } from "@/hooks/useAuth";
import { useUiStore } from "@/store/uiStore";

interface NavbarProps {
  greetingName?: string;
  onSearch?: (query: string) => void;
  onHelpClick?: () => void;
}

export function Navbar({ greetingName, onSearch, onHelpClick }: NavbarProps) {
  const { collapsed, toggle } = useSidebar();
  const { data: user } = useCurrentUser();
  const dateLabel = useUiStore((s) => s.selectedDateLabel);
  const name = greetingName ?? user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="flex w-full items-center gap-4">
      <IconButton
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={toggle}
        className="lg:hidden"
      >
        {collapsed ? <PanelLeftOpen className="h-4.5 w-4.5" /> : <PanelLeftClose className="h-4.5 w-4.5" />}
      </IconButton>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold text-ink">Good morning, {name} 👋</h1>
        {dateLabel && (
          <p className="truncate text-xs text-ink-muted">Here's your fleet overview for {dateLabel}.</p>
        )}
      </div>

      <SearchBar onSearch={onSearch} />

      <div className="flex items-center gap-1.5">
        <NotificationsPopover />
        <IconButton aria-label="Help" onClick={onHelpClick}>
          <HelpCircle className="h-4.5 w-4.5" />
        </IconButton>
        <DatePicker />
      </div>
    </div>
  );
}
