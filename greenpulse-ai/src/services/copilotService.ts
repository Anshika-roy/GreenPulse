import { getCopilotSuggestions, postCopilotMessage } from "@/api/copilot";
import type { ChatMessage } from "@/types";

export const copilotService = {
  async suggestions(signal?: AbortSignal) {
    return getCopilotSuggestions(signal);
  },
  async sendMessage(message: string, conversationId?: string) {
    return postCopilotMessage({ message, conversationId });
  },
};

export function userMessage(content: string): ChatMessage {
  return {
    id: `msg-${Date.now()}-u`,
    role: "user",
    content,
    createdAt: new Date().toISOString(),
  };
}
