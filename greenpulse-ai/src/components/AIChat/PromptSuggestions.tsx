import { AlertTriangle, Wallet, MapPin, Leaf } from "lucide-react";
import { ChevronRight } from "lucide-react";
import type { CopilotPromptSuggestion } from "@/types";

const ICONS: Record<CopilotPromptSuggestion["icon"], React.ElementType> = {
  risk: AlertTriangle,
  budget: Wallet,
  location: MapPin,
  sustainability: Leaf,
};

interface PromptSuggestionsProps {
  suggestions: CopilotPromptSuggestion[];
  onSelect: (label: string) => void;
}

export function PromptSuggestions({ suggestions, onSelect }: PromptSuggestionsProps) {
  return (
    <div className="space-y-2">
      {suggestions.map((s) => {
        const Icon = ICONS[s.icon];
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.label)}
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-left text-sm text-ink transition-colors hover:border-brand-300 hover:bg-brand-50"
          >
            <span className="flex items-center gap-2.5">
              <Icon className="h-4 w-4 shrink-0 text-brand-600" />
              {s.label}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />
          </button>
        );
      })}
    </div>
  );
}
