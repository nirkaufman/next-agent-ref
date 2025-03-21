export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  responses: ChatMessage[];
  updatedMessages: ChatMessage[];
} 