import { BaseMessage, MessageContent, SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatMessage } from "./types";

// Convert message content to string
export const contentToString = (content: MessageContent): string => {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map(item => {
      if (typeof item === 'string') return item;
      if (item.type === 'text') return item.text;
      return '';
    }).join('');
  }
  return '';
};

// Convert LangChain message to our ChatMessage type
export const convertToLangChainMessage = (message: ChatMessage): BaseMessage => {
  switch (message.role) {
    case "system":
      return new SystemMessage(message.content);
    case "user":
      return new HumanMessage(message.content);
    case "assistant":
      return new AIMessage(message.content);
    default:
      throw new Error(`Unknown message role: ${message.role}`);
  }
};

// Convert our ChatMessage type to LangChain message
export const convertToChatMessage = (message: BaseMessage): ChatMessage => {
  return {
    role: message instanceof SystemMessage ? "system" :
          message instanceof HumanMessage ? "user" : "assistant",
    content: contentToString(message.content)
  };
}; 