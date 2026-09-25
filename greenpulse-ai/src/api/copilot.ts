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

import devicesMock from "@/mock/devices.json";

function pickMockReply(message: string): string {
  const q = message.toLowerCase();
  const devices = devicesMock as Array<Record<string, any>>;
  const highRisk = devices.filter((d) => d.healthScore < 65);
  const critical = devices.filter((d) => d.healthScore < 50);

  if (q.includes("replace") || q.includes("quarter") || q.includes("budget")) {
    const replaceList = highRisk.slice(0, 4).map((d) => `${d.model} (${d.assetTag})`).join(", ");
    return `Based on telemetry degradation analysis, I recommend replacing or servicing 4 high-risk devices this quarter: ${replaceList}. Total projected cost savings: ₹24.5 Lakhs.`;
  }

  if (q.includes("battery") || q.includes("battery health")) {
    const worstBattery = [...devices].sort((a, b) => a.healthScore - b.healthScore).slice(0, 3);
    const names = worstBattery.map((d) => `${d.model} (Score: ${d.healthScore})`).join(", ");
    return `The devices with the lowest battery health scores are: ${names}. Recommended action: Schedule battery swaps before cycle exhaustion.`;
  }

  if (q.includes("ssd") || q.includes("wear")) {
    return `Currently 5 devices exceed 75% SSD wear limits. Primary risk: MacBook Pro 16" (Tag: GP-LAP-104) and Dell XPS 15 (Tag: GP-LAP-109). We recommend immediate data backup.`;
  }

  if (q.includes("attention") || q.includes("how many") || q.includes("high risk")) {
    return `There are currently ${critical.length} CRITICAL devices and ${highRisk.length} HIGH RISK devices out of ${devices.length} total tracked assets.`;
  }

  if (q.includes("fleet health") || q.includes("overall")) {
    return `The overall enterprise Fleet Health Score is 84/100 (up +3.2% vs last week). 31 out of 38 devices are in optimal working condition.`;
  }

  if (q.includes("waste") || q.includes("sustainab") || q.includes("co2") || q.includes("save")) {
    return `Year-to-date sustainability impact: 342 kg of e-waste prevented and 1,280 kg of CO₂ avoided by extending device lifespans. Total estimated financial savings: ₹24.5 Lakhs.`;
  }

  if (q.includes("risk")) return copilotMock.responses.risk;
  if (q.includes("office") || q.includes("location") || q.includes("failure rate")) return copilotMock.responses.location;
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
