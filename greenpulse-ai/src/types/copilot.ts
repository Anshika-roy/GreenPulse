export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  isStreaming?: boolean;
}

export interface CopilotPromptSuggestion {
  id: string;
  icon: "risk" | "budget" | "location" | "sustainability";
  label: string;
}

export interface CopilotRequest {
  message: string;
  conversationId?: string;
}

export interface CopilotResponse {
  conversationId: string;
  message: ChatMessage;
}
