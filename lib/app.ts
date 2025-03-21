'use server';

import {ChatAnthropic} from "@langchain/anthropic";
import {createReactAgent} from "@langchain/langgraph/prebuilt";
import {tools} from "./tools";
import {AIMessage, HumanMessage, SystemMessage, BaseMessage, MessageContent} from "@langchain/core/messages";

// Define types for our messages
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatResponse {
  responses: ChatMessage[];
  updatedMessages: ChatMessage[];
}

// Create an instance of an LLM
const model = new ChatAnthropic({
  model: "claude-3-5-sonnet-latest",
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Create the agent
const agent = createReactAgent({llm: model, tools});

// Initialize system message
const systemMessage = new SystemMessage(`
   You are Henry. A travel agent. You can assist by planning and putting together a trip to a destination of your choice.
   You can check the weather at the provided location, book flights and hotels, and even book a taxi
   Ride to the airport.
   You can also recommend attractions to visit at the destination.
   Answer shortly, be professional and focused.
   When you done, output a summary of the trip, with all the details.
`);

// Convert message content to string
function contentToString(content: MessageContent): string {
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
function convertToLangChainMessage(message: ChatMessage): BaseMessage {
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
function convertToChatMessage(message: BaseMessage): ChatMessage {
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

// Function to process messages and get agent response
export async function processMessage(messages: ChatMessage[]): Promise<ChatMessage[]> {
  try {
    // Convert messages to LangChain format
    const langChainMessages = [systemMessage, ...messages.map(convertToLangChainMessage)];

    // Prepare inputs for the agent
    const inputs = {
      messages: langChainMessages
    };

    // Get the response
    const response = await agent.invoke(inputs);
    const latestMessage = response.messages[response.messages.length - 1];
    
    if (latestMessage instanceof AIMessage) {
      return [convertToChatMessage(latestMessage)];
    }

    return [];
  } catch (error) {
    console.error("Error processing message:", error);
    throw new Error("Failed to process message");
  }
}

// Server action for React components
export async function chatWithHenry(message: string, previousMessages: ChatMessage[] = []): Promise<ChatResponse> {
  try {
    if (!message.trim()) {
      throw new Error("Message cannot be empty");
    }

    // Add the new user message
    const updatedMessages = [
      ...previousMessages,
      {
        role: "user" as const,
        content: message.trim()
      }
    ];

    // Process the message and get response
    const responses = await processMessage(updatedMessages);

    // Return both the responses and the updated message history
    return {
      responses,
      updatedMessages: [...updatedMessages, ...responses]
    };
  } catch (error) {
    console.error("Error in chatWithHenry:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to chat with Henry");
  }
}
