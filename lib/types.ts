export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  type?: "thought" | "action" | "result" | "next";
}

export interface AgentStep {
  thought: string;
  action: {
    tool: string;
    input: string;
  };
  result: string;
  nextStep?: string;
}

export interface ChatResponse {
  responses: ChatMessage[];
  updatedMessages: ChatMessage[];
  steps: AgentStep[];
} 