import { useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { useUiStore } from "@/store/uiStore";

const RECENT_DATES = ["May 16, 2025", "May 17, 2025", "May 18, 2025", "May 19, 2025", "May 20, 2025"];

/** Top-right date selector — drives which day's fleet snapshot the dashboard shows */
export function DatePicker() {
  const [open, setOpen] = useState(false);
  const { selectedDateLabel, setSelectedDateLabel } = useUiStore();

  function handleChange(date: string) {
    setSelectedDateLabel(date);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-ink hover:bg-surface-sunken"
      >
        <CalendarDays className="h-4 w-4 text-ink-muted" />
        {selectedDateLabel}
        <ChevronDown className="h-4 w-4 text-ink-faint" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-48 rounded-lg border border-border bg-surface py-1 shadow-popover">
          {RECENT_DATES.map((date) => (
            <button
              key={date}
              type="button"
              onClick={() => handleChange(date)}
              className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-surface-sunken"
            >
              {date}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
