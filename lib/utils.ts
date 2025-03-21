import { BaseMessage, MessageContent, SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatMessage } from "./types";

// Convert message content to string
export function contentToString(content: MessageContent): string {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content.map(item => {
      if (typeof item === 'string') return item;
      if (item.type === 'text') return item.text;
      return '';
    }).join('');
  }
  return '';
}

// Convert ChatMessage to LangChain message
export function convertToLangChainMessage(message: ChatMessage): BaseMessage {
  switch (message.role) {
    case "system":
      return new SystemMessage(message.content);
    case "user":
      return new HumanMessage(message.content);
    case "assistant":
      return new AIMessage(message.content);
    default:
      throw new Error(`Invalid message role: ${message.role}`);
  }
}

// Convert LangChain message to ChatMessage
export function convertToChatMessage(message: BaseMessage): ChatMessage {
  if (message instanceof SystemMessage) {
    return { role: "system", content: contentToString(message.content) };
  } else if (message instanceof HumanMessage) {
    return { role: "user", content: contentToString(message.content) };
  } else if (message instanceof AIMessage) {
    return { role: "assistant", content: contentToString(message.content) };
  } else {
    throw new Error(`Unsupported message type: ${message.constructor.name}`);
  }
} 