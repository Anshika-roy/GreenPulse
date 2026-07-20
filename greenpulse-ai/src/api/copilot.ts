import { apiRequest } from "@/lib/apiClient";
import type { ChatMessage, CopilotPromptSuggestion, CopilotRequest, CopilotResponse } from "@/types";
import copilotMock from "@/mock/copilot.json";

/** GET /api/copilot/suggestions */
export function getCopilotSuggestions(signal?: AbortSignal) {
  return apiRequest<CopilotPromptSuggestion[]>("/copilot/suggestions", {
    method: "GET",
    signal,
    mockResolver: () => copilotMock.suggestions as CopilotPromptSuggestion[],
  });
}

function pickMockReply(message: string): string {
  const q = message.toLowerCase();
  if (q.includes("risk")) return copilotMock.responses.risk;
  if (q.includes("budget") || q.includes("cost") || q.includes("quarter")) return copilotMock.responses.budget;
  if (q.includes("office") || q.includes("location") || q.includes("failure rate")) return copilotMock.responses.location;
  if (q.includes("waste") || q.includes("sustainab") || q.includes("co2")) return copilotMock.responses.sustainability;
  return copilotMock.responses.default;
}

/** POST /api/copilot */
export function postCopilotMessage(req: CopilotRequest) {
  return apiRequest<CopilotResponse>("/copilot", {
    method: "POST",
    body: req,
    mockLatency: [600, 1100],
    mockResolver: (): CopilotResponse => {
      const reply: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: pickMockReply(req.message),
        createdAt: new Date().toISOString(),
      };
      return { conversationId: req.conversationId ?? `conv-${Date.now()}`, message: reply };
    },
  });
}
