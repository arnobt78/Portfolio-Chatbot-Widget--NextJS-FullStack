import { NextRequest } from 'next/server';
import { getSession } from '@/lib/redis';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/chatbot_session=([^;]+)/);
    const sessionId = match?.[1];
    
    if (!sessionId) {
      return new Response(JSON.stringify({ messages: [] }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const session = await getSession(sessionId);
    
    return new Response(
      JSON.stringify({ messages: session?.messages || [] }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('History error:', error);
    return new Response(JSON.stringify({ messages: [] }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
