import { useEffect, useRef } from "react";
import { Sparkles, ChevronUp } from "lucide-react";
import { useCopilot } from "@/hooks/useCopilot";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { PromptSuggestions } from "./PromptSuggestions";
import { ChatInput } from "./ChatInput";

/**
 * Right-rail AI Copilot panel shown on /dashboard. Entirely driven by
 * useCopilot() — no API/fetch logic lives in this component.
 */
export function AICopilotPanel() {
  const { messages, suggestions, isTyping, send } = useCopilot();
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasConversation = messages.length > 1;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex h-full flex-col rounded-card border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-600" />
          <span className="text-sm font-semibold text-ink">AI Copilot</span>
          <span className="rounded-pill bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
            Beta
          </span>
        </span>
        <button type="button" aria-label="Collapse copilot" className="text-ink-faint hover:text-ink-muted">
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {!hasConversation && (
          <div className="mb-1">
            <p className="text-base font-semibold text-ink">Good morning! 👋</p>
          </div>
        )}

        {messages.map((m) => (
          <ChatMessageBubble key={m.id} message={m} />
        ))}

        {isTyping && <TypingIndicator />}

        {!hasConversation && (
          <div className="pt-1">
            <PromptSuggestions suggestions={suggestions} onSelect={send} />
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <ChatInput onSend={send} disabled={isTyping} />
        <p className="mt-2 text-center text-[11px] text-ink-faint">
          AI can make mistakes. Verify important info.
        </p>
      </div>
    </div>
  );
}
