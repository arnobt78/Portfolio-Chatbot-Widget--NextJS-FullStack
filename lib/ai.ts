import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateText, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Message type for AI SDK
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// AI Model fallback chain: Gemini (reliable) → OpenRouter GPT (backup)
interface MessageContent {
  text?: string;
  content?: string;
  message?: string;
}

export async function getAIResponse(
  messages: Array<{ role: string; content: string | unknown[] | MessageContent }>,
  context?: string,
  stream: boolean = true
) {
  const systemPrompt = `You are a helpful assistant for Arnob Mahmud's portfolio website. Be friendly, professional, and concise. Use the FAQ context to give accurate answers. If you don't know something, say so.`;

  // Normalize messages: ensure content is always a string
  // This handles various formats: string, array of objects, etc.
  const normalizedMessages: Message[] = messages
    .slice(-6) // Last 6 messages for context
    .map((msg) => {
      let content: string;
      if (typeof msg.content === 'string') {
        content = msg.content;
      } else if (Array.isArray(msg.content)) {
        // Handle array format: extract text from objects like [{ type: 'input_text', text: '...' }]
        content = (msg.content as unknown[])
          .map((item: unknown) => {
            if (typeof item === 'string') return item;
            if (item && typeof item === 'object') {
              const itemObj = item as MessageContent;
              return itemObj.text || itemObj.content || itemObj.message || '';
            }
            return String(item || '');
          })
          .filter((text: string) => text.length > 0) // Remove empty strings
          .join(' ');
      } else if (msg.content && typeof msg.content === 'object') {
        // Handle object format: { text: '...' } or { content: '...' }
        const contentObj = msg.content as MessageContent;
        content = contentObj.text || contentObj.content || contentObj.message || '';
      } else {
        content = String(msg.content || '');
      }
      // Filter out empty messages
      if (!content || content.trim().length === 0) {
        return null;
      }
      return {
        role: msg.role as 'system' | 'user' | 'assistant',
        content: content.trim(),
      };
    })
    .filter((msg): msg is Message => msg !== null); // Remove null messages

  const fullMessages: Message[] = [
    { role: 'system', content: systemPrompt + (context ? `\n\nFAQ Context:\n${context}` : '') },
    ...normalizedMessages,
  ];

  // Primary: Gemini (reliable and free)
  // Use stable model names from deprecation table (gemini-2.5-flash, gemini-2.5-pro)
  const geminiModels = ['gemini-2.5-flash', 'gemini-2.5-pro'];
  
  for (const modelName of geminiModels) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Build prompt with system message and context
      let prompt = systemPrompt + (context ? `\n\nFAQ Context:\n${context}` : '') + '\n\n';
      prompt += normalizedMessages
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
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
      console.log(`Gemini model ${modelName} failed, trying next...`, error);
      continue; // Try next model
    }
  }
  
  // If all Gemini models failed, log and try fallback
  console.log('All Gemini models failed, trying OpenRouter GPT...');

  // Fallback to OpenRouter GPT
  try {
    const openaiClient = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY!,
      headers: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_CHATBOT_URL || 'http://localhost:3000',
        'X-Title': 'Portfolio Chatbot',
      },
    });

    // Convert messages to AI SDK format (OpenRouter via OpenAI SDK)
    // fullMessages already has normalized string content, so we can use it directly
    const aiMessages = fullMessages
      .map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content, // Already normalized to string
      }))
      .filter(msg => msg.content.length > 0); // Remove empty messages

    if (stream) {
      return await streamText({
        model: openaiClient('openai/gpt-4o-mini'),
        messages: aiMessages,
        temperature: 0.7,
      });
    } else {
      return await generateText({
        model: openaiClient('openai/gpt-4o-mini'),
        messages: aiMessages,
        temperature: 0.7,
      });
    }
  } catch (error) {
    console.error('OpenRouter failed:', error);
    throw new Error('All AI models failed');
  }
}
