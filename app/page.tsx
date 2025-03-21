'use client';

import { useState, useRef, useEffect } from "react";
import { Message } from "./components/Message";
import { ChatMessage, AgentStep } from "@/lib/types";

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
      
      // Add each response message with a slight delay to show the thinking process
      for (const response of data.responses) {
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between messages
        setMessages(prev => [...prev, response]);
      }

      // Add steps with a delay
      for (const step of data.steps) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay between steps
        
        // Add thought as a separate message
        setMessages(prev => [...prev, {
          role: "assistant",
          content: step.thought,
          type: "thought"
        }]);

        // Add action as a separate message
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `Using ${step.action.tool}${step.action.input ? ` with input: ${step.action.input}` : ''}`,
          type: "action"
        }]);

        // Add result as a separate message
        setMessages(prev => [...prev, {
          role: "assistant",
          content: step.result,
          type: "result"
        }]);

        // Add next step if exists
        if (step.nextStep) {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: step.nextStep,
            type: "next"
          }]);
        }
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
                {message.type === "thought" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                )}
                {message.type === "action" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                )}
                {message.type === "result" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
                    <path d="M12 2v20M2 12h20"/>
                  </svg>
                )}
                {message.type === "next" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
                    <path d="M5 12h14"/>
                    <path d="m12 5 7 7-7 7"/>
                  </svg>
                )}
                {!message.type && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                )}
              </div>
              <div className={`flex-1 rounded-lg p-4 ${
                message.type === "thought" ? "bg-blue-50 dark:bg-blue-900/20" :
                message.type === "action" ? "bg-green-50 dark:bg-green-900/20" :
                message.type === "result" ? "bg-purple-50 dark:bg-purple-900/20" :
                message.type === "next" ? "bg-orange-50 dark:bg-orange-900/20" :
                message.role === "user" ? "bg-zinc-100 dark:bg-zinc-800" :
                "bg-white dark:bg-zinc-900"
              }`}>
                <div className={`font-medium ${
                  message.type === "thought" ? "text-blue-700 dark:text-blue-300" :
                  message.type === "action" ? "text-green-700 dark:text-green-300" :
                  message.type === "result" ? "text-purple-700 dark:text-purple-300" :
                  message.type === "next" ? "text-orange-700 dark:text-orange-300" :
                  message.role === "user" ? "text-zinc-900 dark:text-zinc-100" :
                  "text-zinc-900 dark:text-zinc-100"
                }`}>
                  {message.type === "thought" ? "Thought:" :
                   message.type === "action" ? "Action:" :
                   message.type === "result" ? "Result:" :
                   message.type === "next" ? "Next:" :
                   message.role === "user" ? "You:" : "Henry:"}
                </div>
                <div className={`${
                  message.type === "thought" ? "text-blue-600 dark:text-blue-200" :
                  message.type === "action" ? "text-green-600 dark:text-green-200" :
                  message.type === "result" ? "text-purple-600 dark:text-purple-200" :
                  message.type === "next" ? "text-orange-600 dark:text-orange-200" :
                  "text-zinc-600 dark:text-zinc-200"
                }`}>
                  {message.content}
                </div>
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
