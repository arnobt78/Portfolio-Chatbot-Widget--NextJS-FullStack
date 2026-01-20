import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateText, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Message type for AI SDK
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// AI Model fallback chain: Groq (fastest) → Gemini (reliable) → OpenRouter (backup)
export async function getAIResponse(
  messages: Message[],
  context?: string,
  stream: boolean = true
) {
  const systemPrompt = `You are a helpful assistant for Arnob Mahmud's portfolio website. Be friendly, professional, and concise. Use the FAQ context to give accurate answers. If you don't know something, say so.`;

  const fullMessages: Message[] = [
    { role: 'system', content: systemPrompt + (context ? `\n\nFAQ Context:\n${context}` : '') },
    ...messages.slice(-6), // Last 6 messages for context
  ];

  // Try Groq first (fastest, free tier) - using OpenRouter as proxy
  const openaiGroq = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY!,
    headers: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_CHATBOT_URL || 'http://localhost:3000',
      'X-Title': 'Portfolio Chatbot',
    },
  });

  try {
    if (stream) {
      return await streamText({
        model: openaiGroq('groq/llama-3.1-70b-versatile'),
        messages: fullMessages,
        temperature: 0.7,
      });
    } else {
      return await generateText({
        model: openaiGroq('groq/llama-3.1-70b-versatile'),
        messages: fullMessages,
        temperature: 0.7,
      });
    }
  } catch (error) {
    console.log('Groq failed, trying Gemini...', error);
  }

  // Fallback to Gemini
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = fullMessages
      .map((m) => `${m.role === 'system' ? 'System' : m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');
    
    const result = await model.generateContentStream(prompt);
    
    // Convert Gemini stream to AI SDK format
    if (stream) {
      return {
        textStream: (async function* () {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) yield text;
          }
        })(),
      };
    } else {
      const response = await result.response;
      return { text: response.text() };
    }
  } catch (error) {
    console.log('Gemini failed, trying OpenRouter...', error);
  }

  // Final fallback to OpenRouter (Claude/GPT)
  try {
    const openaiClient = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY!,
      headers: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_CHATBOT_URL || 'http://localhost:3000',
        'X-Title': 'Portfolio Chatbot',
      },
    });

    if (stream) {
      return await streamText({
        model: openaiClient('openai/gpt-4o-mini'),
        messages: fullMessages,
        temperature: 0.7,
      });
    } else {
      return await generateText({
        model: openaiClient('openai/gpt-4o-mini'),
        messages: fullMessages,
        temperature: 0.7,
      });
    }
  } catch (error) {
    throw new Error('All AI models failed');
  }
}
