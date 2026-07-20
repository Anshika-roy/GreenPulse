import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";
import { Sparkles } from "lucide-react";

export function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2.5", isUser && "flex-row-reverse")}>
      {!isUser && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser ? "bg-brand-600 text-white" : "bg-surface-sunken text-ink"
        )}
      >
        {message.content}
        {message.isStreaming && (
          <span className="ml-0.5 inline-block h-3.5 w-1 animate-pulse bg-current align-middle" />
        )}
      </div>
    </div>
  );
}
