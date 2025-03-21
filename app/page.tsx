'use client';

import { useState, useRef, useEffect } from "react";
import { Message } from "./components/Message";
import { ChatMessage, AgentStep } from "@/lib/types";
import { WeatherResult } from './components/WeatherResult';
import { FlightResult } from './components/FlightResult';
import { AttractionResult } from './components/AttractionResult';
import { TaxiResult } from './components/TaxiResult';
import { HotelResult } from './components/HotelResult';
import ReactDOMServer from 'react-dom/server';
import { renderMessageContent } from "@/lib/render";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, steps]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get('message') as string;
    
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setMessages(prev => [...prev, { role: "user", content: message.trim() }]);
    setSteps([]); // Clear previous steps
    e.currentTarget.reset();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add each response message with a delay to show the thinking process
      for (const response of data.responses) {
        // Show loading state
        setIsLoading(true);
        
        // Random delay between 1-3 seconds to simulate thinking
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
        
        // Add the message
        setMessages(prev => [...prev, response]);
        
        // Brief pause before next message
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Add steps with a delay
      for (const step of data.steps) {
        // Show loading state
        setIsLoading(true);
        
        // Random delay between 1.5-3.5 seconds to simulate processing
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1500));
        
        // Add the step
        setSteps(prev => [...prev, step]);
        
        // Brief pause before next step
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-900">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.filter(msg => msg.role !== "system").map((message, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div className={`flex-1 rounded-lg p-4 ${
                message.role === "user" ? "bg-zinc-100 dark:bg-zinc-800" : "bg-white dark:bg-zinc-900"
              }`}>
                <div className={`font-medium ${
                  message.role === "user" ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-900 dark:text-zinc-100"
                }`}>
                  {message.role === "user" ? "You:" : "Henry:"}
                </div>
                <div 
                  className="text-zinc-600 dark:text-zinc-200"
                  dangerouslySetInnerHTML={{ __html: renderMessageContent(message.content) }}
                />
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-center space-x-2 text-zinc-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-500"></div>
              <span>Henry is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            name="message"
            type="text"
            placeholder="Ask Henry about your travel plans..."
            className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
