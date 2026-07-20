import { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask me anything…"
        disabled={disabled}
        className="h-10 flex-1 rounded-lg border border-border bg-surface px-3.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
