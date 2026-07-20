import { useCallback, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { copilotService, userMessage } from "@/services/copilotService";
import type { ChatMessage } from "@/types";

const GREETING: ChatMessage = {
  id: "msg-greeting",
  role: "assistant",
  content: "Good morning! I'm here to help you manage your device fleet smarter.",
  createdAt: new Date().toISOString(),
};

/**
 * Owns the copilot conversation: message list, send flow, typing indicator,
 * and a lightweight character-stream effect for the assistant's reply so the
 * UI has a real "streaming message" component to render against.
 *
 * Swappable later for a real streaming SSE/WebSocket backend — only the
 * `send` implementation changes, the component contract stays the same.
 */
export function useCopilot() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [isTyping, setIsTyping] = useState(false);
  const conversationId = useRef<string | undefined>(undefined);

  const { data: suggestions = [] } = useQuery({
    queryKey: ["copilot", "suggestions"],
    queryFn: ({ signal }) => copilotService.suggestions(signal),
    staleTime: Infinity,
  });

  const streamAssistantReply = useCallback((fullText: string) => {
    const messageId = `msg-${Date.now()}-a`;
    setMessages((prev) => [
      ...prev,
      { id: messageId, role: "assistant", content: "", createdAt: new Date().toISOString(), isStreaming: true },
    ]);

    let i = 0;
    const chunkSize = 3;
    const interval = setInterval(() => {
      i += chunkSize;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, content: fullText.slice(0, i), isStreaming: i < fullText.length }
            : m
        )
      );
      if (i >= fullText.length) clearInterval(interval);
    }, 16);
  }, []);

  const send = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      setMessages((prev) => [...prev, userMessage(trimmed)]);
      setIsTyping(true);

      try {
        const res = await copilotService.sendMessage(trimmed, conversationId.current);
        conversationId.current = res.conversationId;
        setIsTyping(false);
        streamAssistantReply(res.message.content);
      } catch {
        setIsTyping(false);
        streamAssistantReply("Something went wrong reaching the copilot. Please try again.");
      }
    },
    [streamAssistantReply]
  );

  return { messages, suggestions, isTyping, send };
}
