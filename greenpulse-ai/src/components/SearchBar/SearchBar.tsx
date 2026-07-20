import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { deviceService } from "@/services/deviceService";

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

/** Global search box in the navbar — searches devices, with ⌘K shortcut to focus */
export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["search", "devices", query],
    queryFn: ({ signal }) =>
      deviceService.list({ page: 1, pageSize: 5, search: query }, signal),
    enabled: query.trim().length > 1,
  });

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    onSearch?.(value);
  }

  const results = data?.data ?? [];
  const showResults = focused && query.trim().length > 1;

  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Search devices, users, tickets…"
        className="h-10 w-full rounded-lg border border-border bg-surface-sunken pl-9 pr-14 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:bg-surface"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-surface px-1.5 py-0.5 text-[11px] text-ink-faint">
        ⌘K
      </kbd>

      {showResults && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-popover">
          {results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-ink-muted">No devices found for "{query}"</p>
          ) : (
            results.map((device) => (
              <button
                key={device.id}
                type="button"
                onClick={() => navigate(`/device/${device.id}`)}
                className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-surface-sunken"
              >
                <span className="text-sm font-medium text-ink">{device.model}</span>
                <span className="text-xs text-ink-muted">
                  {device.assetTag} · {device.issue.label}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
