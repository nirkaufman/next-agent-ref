'use server';

import {ChatAnthropic} from "@langchain/anthropic";
import {createReactAgent} from "@langchain/langgraph/prebuilt";
import {tools} from "./tools";
import {SystemMessage, AIMessage} from "@langchain/core/messages";
import { ChatMessage, ChatResponse, AgentStep } from "./types";
import { convertToLangChainMessage, convertToChatMessage } from "./utils";

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
   
   For each step you take, format your response as follows:
   Thought: Explain what you're thinking about doing
   Action: Specify which tool you're using and what input you're providing
   Result: Show what you learned from using the tool
   Next: Explain what you'll do next based on the result
   
   Make your responses conversational and natural, as if you're explaining your process to the user.
`);

// Function to process messages and get agent response
export async function processMessage(messages: ChatMessage[]): Promise<{ messages: ChatMessage[], steps: AgentStep[] }> {
  try {
    // Convert messages to LangChain format
    const langChainMessages = [systemMessage, ...messages.map(convertToLangChainMessage)];

    // Prepare inputs for the agent
    const inputs = {
      messages: langChainMessages
    };

    // Get the response
    const response = await agent.invoke(inputs);
    const allMessages = response.messages;
    
    // Convert all messages to ChatMessage format
    const chatMessages: ChatMessage[] = [];
    const steps: AgentStep[] = [];
    
    // Skip the system message and convert the rest
    for (let i = 1; i < allMessages.length; i++) {
      const message = allMessages[i];
      if (message instanceof AIMessage) {
        const content = message.content.toString();
        
        // Parse steps from the message
        const thoughtMatch = content.match(/Thought: (.*?)(?=Action:|$)/s);
        const actionMatch = content.match(/Action: (.*?)(?=Result:|$)/s);
        const resultMatch = content.match(/Result: (.*?)(?=Next:|$)/s);
        const nextMatch = content.match(/Next: (.*?)(?=Thought:|$)/s);
        
        if (thoughtMatch && actionMatch && resultMatch) {
          // Parse the action to get tool and input
          const actionText = actionMatch[1].trim();
          const toolMatch = actionText.match(/(\w+)\s*\((.*)\)/);
          
          steps.push({
            thought: thoughtMatch[1].trim(),
            action: {
              tool: toolMatch ? toolMatch[1] : actionText,
              input: toolMatch ? toolMatch[2] : ''
            },
            result: resultMatch[1].trim(),
            nextStep: nextMatch ? nextMatch[1].trim() : undefined
          });
        }
        
        chatMessages.push(convertToChatMessage(message));
      }
    }

    return { messages: chatMessages, steps };
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
    const { messages: responses, steps } = await processMessage(updatedMessages);

    // Return both the responses and the updated message history
    return {
      responses,
      updatedMessages: [...updatedMessages, ...responses],
      steps
    };
  } catch (error) {
    console.error("Error in chatWithHenry:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to chat with Henry");
  }
}
