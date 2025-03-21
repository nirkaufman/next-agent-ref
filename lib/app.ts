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
const systemMessage = new SystemMessage(
  `You are Henry, a travel planning assistant. Your goal is to help users plan their trips by providing detailed, personalized travel recommendations.

When responding, format your messages in a clear, step-by-step way using HTML tags:

1. For your thoughts, wrap them in <thought> tags:
<thought>I need to check the weather for Paris in June...</thought>

2. For actions you're taking, wrap them in <action> tags:
<action>Using weather-forecast with input: Paris, June</action>

3. For results from tools, wrap them in <result> tags:
<result>The weather in Paris during June is pleasant with average temperatures of 20°C...</result>

4. For your next planned step, wrap it in <next> tags:
<next>Based on the good weather, I'll look for available flights...</next>

5. For regular responses, use HTML formatting to improve readability:
   - Use <ul> and <li> for lists
   - Use <p> for paragraphs
   - Use <strong> for important information
   - Use <em> for emphasis
   - Use <h3> for section headers
   - Use <div class="space-y-2"> for spacing between elements

Example of a well-formatted response:
<div class="space-y-4">
  <h3>Flight Options</h3>
  <ul>
    <li><strong>Air France</strong> - Departure: 10:00 AM, Price: $450</li>
    <li><strong>British Airways</strong> - Departure: 2:30 PM, Price: $480</li>
  </ul>
  <p><em>All prices are subject to change</em></p>
</div>

Always explain your reasoning and actions clearly. If you need to use a tool, explain why you're using it and what you expect to learn from it.`
);

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

export async function POST(req: Request) {
  try {
    const { message, messages } = await req.json();

    // Convert messages to LangChain format
    const langChainMessages = messages.map(convertToLangChainMessage);

    // Add system message and user message
    const response = await agent.invoke({
      messages: [
        systemMessage,
        ...langChainMessages,
        new HumanMessage(message),
      ],
    });

    // Convert response to ChatMessage format
    const chatMessages = response.messages.map(convertToChatMessage);

    // Parse the last message to extract steps
    const lastMessage = response.messages[response.messages.length - 1];
    const content = typeof lastMessage.content === 'string' ? lastMessage.content : '';
    
    // Extract steps using regex
    const thoughtRegex = /<thought>(.*?)<\/thought>/gs;
    const actionRegex = /<action>(.*?)<\/action>/gs;
    const resultRegex = /<result>(.*?)<\/result>/gs;
    const nextRegex = /<next>(.*?)<\/next>/gs;

    const thoughts = [...content.matchAll(thoughtRegex)].map(match => match[1]);
    const actions = [...content.matchAll(actionRegex)].map(match => match[1]);
    const results = [...content.matchAll(resultRegex)].map(match => match[1]);
    const nextSteps = [...content.matchAll(nextRegex)].map(match => match[1]);

    // Create steps array
    const steps = thoughts.map((thought, index) => ({
      thought,
      action: {
        tool: actions[index]?.split(' ')[1] || '',
        input: actions[index]?.split('with input: ')[1] || '',
      },
      result: results[index] || '',
      nextStep: nextSteps[index],
    }));

    // Clean up the last message by removing the HTML tags
    const cleanContent = content
      .replace(/<thought>.*?<\/thought>/gs, '')
      .replace(/<action>.*?<\/action>/gs, '')
      .replace(/<result>.*?<\/result>/gs, '')
      .replace(/<next>.*?<\/next>/gs, '')
      .trim();

    // Update the last message with clean content
    chatMessages[chatMessages.length - 1].content = cleanContent;

    return NextResponse.json({
      responses: chatMessages,
      updatedMessages: [...messages, ...chatMessages],
      steps,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
