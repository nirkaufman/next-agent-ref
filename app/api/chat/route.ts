import { chatWithHenry } from '@/lib/app';
import { NextRequest } from 'next/server';

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