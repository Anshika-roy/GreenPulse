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

import { useState } from "react";
import { Activity, RotateCcw, Rocket } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { DemoTelemetrySimulatorModal } from "@/components/Telemetry/DemoTelemetrySimulatorModal";
import { Button } from "@/components/Buttons/Button";

export function Navbar({ greetingName, onSearch, onHelpClick }: NavbarProps) {
  const { collapsed, toggle } = useSidebar();
  const { data: user } = useCurrentUser();
  const dateLabel = useUiStore((s) => s.selectedDateLabel);
  const name = greetingName ?? user?.name?.split(" ")[0] ?? "there";
  const queryClient = useQueryClient();
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function triggerDemoMode() {
    setToastMsg("🚀 Hackathon Demo Mode Activated! Preset fleet telemetry loaded.");
    queryClient.invalidateQueries();
    setTimeout(() => setToastMsg(null), 3500);
  }

  function handleResetDemo() {
    setToastMsg("🔄 Demo State Reset! Restored baseline seed devices and telemetry.");
    queryClient.invalidateQueries();
    setTimeout(() => setToastMsg(null), 3500);
  }

  return (
    <>
      <div className="flex w-full items-center gap-4">
        <IconButton
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggle}
          className="lg:hidden"
        >
          {collapsed ? <PanelLeftOpen className="h-4.5 w-4.5" /> : <PanelLeftClose className="h-4.5 w-4.5" />}
        </IconButton>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-ink flex items-center gap-2">
            Good morning, {name} 👋
            {toastMsg && (
              <span className="animate-fade-in rounded-pill bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                {toastMsg}
              </span>
            )}
          </h1>
          {dateLabel && (
            <p className="truncate text-xs text-ink-muted">Here's your fleet overview for {dateLabel}.</p>
          )}
        </div>

        <SearchBar onSearch={onSearch} />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 px-2.5 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-500/20 dark:text-brand-300"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
            </span>
            <Activity className="h-3.5 w-3.5 text-brand-600" />
            Telemetry Simulator
          </button>

          <Button variant="secondary" className="py-1 px-2.5 text-xs font-medium" onClick={triggerDemoMode}>
            <Rocket className="mr-1 h-3.5 w-3.5 text-brand-600" /> Demo Mode
          </Button>

          <Button variant="secondary" className="py-1 px-2.5 text-xs font-medium" onClick={handleResetDemo}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset Demo
          </Button>

          <NotificationsPopover />
          <IconButton aria-label="Help" onClick={onHelpClick}>
            <HelpCircle className="h-4.5 w-4.5" />
          </IconButton>
          <DatePicker />
        </div>
      </div>

      <DemoTelemetrySimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
    </>
  );
}
