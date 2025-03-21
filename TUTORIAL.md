# Building a Full-Stack AI Agent with Next.js and TypeScript

This tutorial will guide you through building a full-stack AI agent using Next.js, TypeScript, and LangChain. We'll create a travel assistant that can help users plan their trips by providing weather forecasts, flight information, hotel bookings, and more.

## Table of Contents
1. [Understanding AI Agents](#understanding-ai-agents)
2. [Setting Up the Agent](#setting-up-the-agent)
3. [Defining Tools](#defining-tools)
4. [Creating the API Route](#creating-the-api-route)
5. [Building the UI](#building-the-ui)
6. [Putting It All Together](#putting-it-all-together)

## Understanding AI Agents

An AI agent is a system that can perceive its environment, make decisions, and take actions to achieve specific goals. In our case, we're building a travel assistant agent that can:
- Understand user requests
- Choose appropriate tools to fulfill those requests
- Execute the tools and process their results
- Provide natural language responses

The agent uses a "ReAct" (Reasoning and Acting) framework, which means it:
1. Thinks about what to do
2. Takes an action
3. Observes the result
4. Decides what to do next

## Setting Up the Agent

Let's start by setting up our agent in `lib/app.ts`. We'll use LangChain's `createReactAgent` to create our agent.

```typescript
// lib/app.ts
import { ChatAnthropic } from "@langchain/anthropic";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tools } from "./tools";

// Create an instance of an LLM
const model = new ChatAnthropic({
  model: "claude-3-5-sonnet-latest",
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Create the agent
const agent = createReactAgent({ llm: model, tools });
```

Key points:
- We're using Claude 3.5 Sonnet as our LLM
- The agent is created with our LLM and tools
- The agent will use the ReAct framework to process requests

## Defining Tools

Tools are the actions our agent can take. In `lib/tools.ts`, we define several tools using LangChain's `tool` function:

```typescript
// lib/tools.ts
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const weatherForecast = tool(
  async ({ destination, month }: WeatherForecastArgs) => {
    return `Weather forecast for ${destination} in ${month}: Sunny and warm!`
  },
  {
    name: "weather-forecast",
    description: "provides a weather forecast for a destination in a month",
    schema: z.object({
      destination: z.string().describe("destination to get weather forecast for"),
      month: z.string().describe("month to get weather forecast for")
    })
  }
);
```

Each tool has:
- A function that performs the action
- A name and description
- A Zod schema defining its input parameters

We define several tools:
- `weatherForecast`: Get weather information
- `flightLocator`: Find flights
- `airportTaxiBooking`: Book airport transportation
- `hotelBooking`: Book hotels
- `attractionRecommendation`: Get attraction recommendations

## Creating the API Route

The API route in `app/api/chat/route.ts` handles communication between the frontend and our agent:

```typescript
// app/api/chat/route.ts
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.prompt || body.message;
    
    if (!message) {
      return new Response('Message is required', { status: 400 });
    }

    const response = await chatWithHenry(message, body.messages || []);
    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500 }
    );
  }
}
```

This route:
- Accepts POST requests with messages
- Calls our agent through `chatWithHenry`
- Returns the agent's response

## Building the UI

The UI is built in `app/page.tsx` using React and Tailwind CSS. Key features:

1. Message Display:
```typescript
{messages.map((message, index) => (
  <div key={index} className="flex items-start gap-2">
    <div className={`flex-1 rounded-lg p-4 ${
      message.role === "user" ? "bg-zinc-100" : "bg-white"
    }`}>
      <div className="font-medium">
        {message.role === "user" ? "You:" : "Henry:"}
      </div>
      <div 
        className="text-zinc-600"
        dangerouslySetInnerHTML={{ __html: renderMessageContent(message.content) }}
      />
    </div>
  </div>
))}
```

2. Message Input:
```typescript
<form onSubmit={handleSubmit} className="p-4 border-t">
  <div className="max-w-3xl mx-auto flex gap-2">
    <input
      name="message"
      type="text"
      placeholder="Ask Henry about your travel plans..."
      className="flex-1 rounded-lg border px-4 py-2"
    />
    <button
      type="submit"
      className="px-4 py-2 bg-blue-500 text-white rounded-lg"
    >
      Send
    </button>
  </div>
</form>
```

3. Loading State:
```typescript
{isLoading && (
  <div className="flex items-center space-x-2 text-zinc-500">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2"></div>
    <span>Henry is thinking...</span>
  </div>
)}
```

## Putting It All Together

The application flow:
1. User sends a message through the UI
2. The API route receives the message
3. The agent processes the message using its tools
4. The response is sent back to the UI
5. The UI displays the response with appropriate formatting

Key utilities:
- `lib/utils.ts`: Contains message conversion functions
- `lib/render.tsx`: Handles message content rendering
- `lib/types.ts`: Defines TypeScript interfaces

The agent's responses are formatted using special HTML tags:
- `<thought>`: Shows the agent's reasoning
- `<action>`: Shows what the agent is doing
- `<result>`: Shows the outcome
- `<next>`: Shows the next step

## Next Steps

To enhance this application, you could:
1. Add more sophisticated tools with real API integrations
2. Implement error handling and retry mechanisms
3. Add user authentication
4. Implement conversation history persistence
5. Add more interactive UI elements

Remember to:
- Keep your API keys secure
- Handle errors gracefully
- Provide clear feedback to users
- Test thoroughly before deployment 