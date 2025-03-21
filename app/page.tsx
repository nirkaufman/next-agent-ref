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

  const renderMessageContent = (content: string) => {
    // First handle the special tags for agent steps
    let html = content
      .replace(/<thought>(.*?)<\/thought>/gs, '<div class="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg text-blue-700 dark:text-blue-300"><div class="flex items-center gap-2"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg><span>Thought: $1</span></div></div>')
      .replace(/<action>(.*?)<\/action>/gs, '<div class="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg text-green-700 dark:text-green-300"><div class="flex items-center gap-2"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg><span>Action: $1</span></div></div>')
      .replace(/<result>(.*?)<\/result>/gs, '<div class="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg text-purple-700 dark:text-purple-300"><div class="flex items-center gap-2"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>Result: $1</span></div></div>')
      .replace(/<next>(.*?)<\/next>/gs, '<div class="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg text-orange-700 dark:text-orange-300"><div class="flex items-center gap-2"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg><span>Next: $1</span></div></div>');

    // Then handle regular HTML elements
    html = html
      .replace(/<h3>(.*?)<\/h3>/g, '<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2">$1</h3>')
      .replace(/<ul>(.*?)<\/ul>/gs, '<ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">$1</ul>')
      .replace(/<li>(.*?)<\/li>/g, '<li class="text-gray-700 dark:text-gray-300">$1</li>')
      .replace(/<p>(.*?)<\/p>/g, '<p class="text-gray-700 dark:text-gray-300">$1</p>')
      .replace(/<strong>(.*?)<\/strong>/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')
      .replace(/<em>(.*?)<\/em>/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>')
      .replace(/<div class="space-y-2">(.*?)<\/div>/gs, '<div class="space-y-2">$1</div>');

    // Handle special result components
    const weatherMatch = html.match(/<weather-result>(.*?)<\/weather-result>/s);
    if (weatherMatch) {
      try {
        const weatherData = JSON.parse(weatherMatch[1]);
        html = html.replace(/<weather-result>.*?<\/weather-result>/s, `<div class="my-4">${ReactDOMServer.renderToString(<WeatherResult {...weatherData} />)}</div>`);
      } catch (e) {
        console.error('Failed to parse weather result:', e);
      }
    }

    const flightMatch = html.match(/<flight-result>(.*?)<\/flight-result>/s);
    if (flightMatch) {
      try {
        const flightData = JSON.parse(flightMatch[1]);
        html = html.replace(/<flight-result>.*?<\/flight-result>/s, `<div class="my-4">${ReactDOMServer.renderToString(<FlightResult {...flightData} />)}</div>`);
      } catch (e) {
        console.error('Failed to parse flight result:', e);
      }
    }

    const attractionMatch = html.match(/<attraction-result>(.*?)<\/attraction-result>/s);
    if (attractionMatch) {
      try {
        const attractionData = JSON.parse(attractionMatch[1]);
        html = html.replace(/<attraction-result>.*?<\/attraction-result>/s, `<div class="my-4">${ReactDOMServer.renderToString(<AttractionResult {...attractionData} />)}</div>`);
      } catch (e) {
        console.error('Failed to parse attraction result:', e);
      }
    }

    const taxiMatch = html.match(/<taxi-result>(.*?)<\/taxi-result>/s);
    if (taxiMatch) {
      try {
        const taxiData = JSON.parse(taxiMatch[1]);
        html = html.replace(/<taxi-result>.*?<\/taxi-result>/s, `<div class="my-4">${ReactDOMServer.renderToString(<TaxiResult {...taxiData} />)}</div>`);
      } catch (e) {
        console.error('Failed to parse taxi result:', e);
      }
    }

    const hotelMatch = html.match(/<hotel-result>(.*?)<\/hotel-result>/s);
    if (hotelMatch) {
      try {
        const hotelData = JSON.parse(hotelMatch[1]);
        html = html.replace(/<hotel-result>.*?<\/hotel-result>/s, `<div class="my-4">${ReactDOMServer.renderToString(<HotelResult {...hotelData} />)}</div>`);
      } catch (e) {
        console.error('Failed to parse hotel result:', e);
      }
    }

    return html;
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
