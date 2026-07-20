import { useState } from "react";
import { ChevronDown, Building2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const COMPANIES = ["Acme Global Corp.", "Acme Retail India", "Acme Manufacturing"];

interface CompanySwitcherProps {
  collapsed: boolean;
  current: string;
  onChange: (company: string) => void;
}

/** Company/tenant switcher dropdown directly under the logo */
export function CompanySwitcher({ collapsed, current, onChange }: CompanySwitcherProps) {
  const [open, setOpen] = useState(false);

  if (collapsed) {
    return (
      <div className="flex justify-center py-3">
        <Building2 className="h-5 w-5 text-ink-muted" />
      </div>
    );
  }

  return (
    <div className="relative px-3 py-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-ink hover:bg-surface-sunken"
      >
        <span className="flex items-center gap-2 truncate">
          <Building2 className="h-4 w-4 shrink-0 text-ink-muted" />
          <span className="truncate">{current}</span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-ink-faint" />
      </button>

      {open && (
        <div className="absolute left-3 right-3 top-full z-20 mt-1 rounded-lg border border-border bg-surface py-1 shadow-popover">
          {COMPANIES.map((company) => (
            <button
              key={company}
              type="button"
              onClick={() => {
                onChange(company);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface-sunken",
                company === current ? "text-brand-700" : "text-ink"
              )}
            >
              {company}
              {company === current && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
