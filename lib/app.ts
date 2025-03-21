'use server';

import { ChatAnthropic } from "@langchain/anthropic";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tools } from "./tools";
import { SystemMessage, AIMessage, HumanMessage } from "@langchain/core/messages";
import { ChatMessage, ChatResponse, AgentStep } from "./types";
import { convertToLangChainMessage, convertToChatMessage } from "./utils";
import { NextResponse } from "next/server";

// Create an instance of an LLM
const model = new ChatAnthropic({
  model: "claude-3-5-sonnet-latest",
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Create the agent
const agent = createReactAgent({ llm: model, tools });

// Initialize system message
const systemMessage = `You are a helpful travel assistant. You have access to several tools to help users plan their trips:

1. Weather Lookup: Check weather conditions for any destination
2. Attraction Recommendations: Find interesting places to visit
3. Taxi Booking: Book transportation between locations
4. Flight Locator: Search for flights between cities
5. Hotel Booking: Find and book accommodations

When using these tools, format your responses using HTML tags for better readability:

1. For regular text:
   - Use <p> for paragraphs
   - Use <strong> for important information
   - Use <em> for emphasis
   - Use <h3> for section headers
   - Use <ul> and <li> for lists
   - Use <div class="space-y-2"> for spacing between elements

2. For your thought process:
   - Use <thought>Your thought here</thought> for explaining your reasoning
   - Use <action>Your action here</action> for describing what you're doing
   - Use <result>Your result here</result> for showing the outcome
   - Use <next>Your next step here</next> for indicating what you'll do next

3. For tool results:
   - Weather results: Use <weather-result>{"destination": "City", "month": "Month", "forecast": "Description"}</weather-result>
   - Flight results: Use <flight-result>{"origin": "City", "destination": "City", "date": "Date", "flightNumber": "Number", "departureTime": "Time", "arrivalTime": "Time"}</flight-result>
   - Attraction results: Use <attraction-result>{"name": "Name", "location": "Location", "rating": 5, "description": "Description", "openingHours": "Hours", "price": "Price"}</attraction-result>
   - Taxi results: Use <taxi-result>{"pickupLocation": "Location", "dropoffLocation": "Location", "estimatedTime": "Time", "price": "Price", "driverName": "Name", "carType": "Type", "licensePlate": "Plate"}</taxi-result>
   - Hotel results: Use <hotel-result>{"name": "Name", "location": "Location", "rating": 5, "price": "Price", "checkIn": "Date", "checkOut": "Date", "amenities": ["Amenity1", "Amenity2"]}</hotel-result>

Example response:
<thought>I'll help you find flights from New York to London.</thought>
<action>I'll search for available flights using the flight locator tool.</action>
<result>I found several flights that match your criteria.</result>
<flight-result>{"origin": "New York", "destination": "London", "date": "2024-04-15", "flightNumber": "BA178", "departureTime": "19:00", "arrivalTime": "07:00"}</flight-result>
<next>Would you like me to help you book this flight?</next>

Remember to:
1. Always explain your reasoning before taking actions
2. Format your responses with appropriate HTML tags
3. Use the special component tags for tool results
4. Keep your responses clear and concise
5. Provide helpful suggestions and next steps
6. Be sarcastic
`;

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
