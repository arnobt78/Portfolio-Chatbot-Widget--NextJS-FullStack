import { NextRequest } from 'next/server';
import { getSession, saveSession, type ChatMessage } from '@/lib/redis';
import { searchFAQ } from '@/lib/rag';
import { getAIResponse } from '@/lib/ai';

export const runtime = 'edge'; // Use Edge Runtime for faster responses

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { message?: string };
    const { message } = body;
    
    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get or create session from cookies
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/chatbot_session=([^;]+)/);
    let sessionId: string = match?.[1] || '';
    let session = sessionId ? await getSession(sessionId) : null;
    
    if (!session) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      session = {
        id: sessionId,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: Date.now(),
    };
    session.messages.push(userMessage);

    // RAG: Search for relevant FAQs
    const context = await searchFAQ(message);

    // Get AI response with streaming
    const result = await getAIResponse(session.messages, context, true);

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';
        
        try {
          // Handle different return types from getAIResponse
          if ('textStream' in result && result.textStream) {
            // StreamTextResult or custom Gemini stream
            for await (const chunk of result.textStream) {
              fullResponse += chunk;
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ response: chunk })}\n\n`)
              );
            }
          } else if ('text' in result && result.text) {
            // GenerateTextResult or non-streaming response
            fullResponse = result.text;
            // Send as single chunk
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ response: fullResponse })}\n\n`)
            );
          } else {
            throw new Error('Invalid AI response format');
          }
          
          // Save assistant message and session
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: fullResponse,
            timestamp: Date.now(),
          };
          session!.messages.push(assistantMessage);
          session!.updatedAt = Date.now();
          await saveSession(sessionId!, session!.messages);
          
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // Set cookie if new session
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    if (!match) {
      headers.set(
        'Set-Cookie',
        `chatbot_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
      );
    }

    return new Response(stream, { headers });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
