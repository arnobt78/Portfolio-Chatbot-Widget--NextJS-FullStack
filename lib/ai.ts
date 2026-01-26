import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateText, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGroq } from '@ai-sdk/groq';

// Message type for AI SDK
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// AI Model fallback chain: Gemini (primary) → OpenRouter → Groq → Hugging Face → OpenAI (backup)
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

  // Helper function to normalize a single message content to string (defined early for reuse)
  const normalizeContentToString = (content: unknown): string => {
    if (typeof content === 'string') {
      return content;
    }
    
    if (Array.isArray(content)) {
      // Handle array format: [{ type: 'output_text', text: '...' }] or [{ type: 'input_text', text: '...' }]
      return (content as unknown[])
        .map((item: unknown) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') {
            const itemObj = item as { 
              text?: string; 
              content?: string; 
              message?: string;
              type?: string;
            };
            // Extract text from various object formats
            return itemObj.text || itemObj.content || itemObj.message || '';
          }
          return String(item || '');
        })
        .filter((text: string) => text.length > 0)
        .join(' ');
    }
    
    if (content && typeof content === 'object') {
      // Handle object format: { text: '...' } or { content: '...' }
      const contentObj = content as { text?: string; content?: string; message?: string };
      return contentObj.text || contentObj.content || contentObj.message || '';
    }
    
    return String(content || '');
  };

  // Normalize messages: ensure content is always a string
  // This handles various formats: string, array of objects, etc.
  // CRITICAL: Normalize ALL messages before processing
  const normalizedMessages: Message[] = messages
    .slice(-6) // Last 6 messages for context
    .map((msg) => {
      // Force normalization - handle any format (string, array, object)
      const content = normalizeContentToString(msg.content);
      
      // Filter out empty messages
      if (!content || content.trim().length === 0) {
        return null;
      }
      
      // Ensure role is valid
      const role = msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user';
      return {
        role: role as 'system' | 'user' | 'assistant',
        content: content.trim(),
      };
    })
    .filter((msg): msg is Message => msg !== null); // Remove null messages

  // Build full messages array - ensure system message is also normalized
  const fullMessages: Message[] = [
    { role: 'system', content: systemPrompt + (context ? `\n\nFAQ Context:\n${context}` : '') },
    ...normalizedMessages,
  ];
  
  // CRITICAL: Double-check that all messages in fullMessages have string content
  // This is a safety net in case normalization failed above
  for (let i = 0; i < fullMessages.length; i++) {
    const msg = fullMessages[i];
    if (typeof msg.content !== 'string') {
      console.warn(`Message ${i} has non-string content, normalizing:`, typeof msg.content, Array.isArray(msg.content), JSON.stringify(msg.content).substring(0, 100));
      fullMessages[i] = {
        ...msg,
        content: normalizeContentToString(msg.content),
      };
    }
  }
  
  // Final verification: ensure all messages are strings
  const invalidMessages = fullMessages.filter(msg => typeof msg.content !== 'string');
  if (invalidMessages.length > 0) {
    console.error('ERROR: Some messages in fullMessages still have non-string content:', invalidMessages);
    // Force normalize all invalid messages
    for (let i = 0; i < fullMessages.length; i++) {
      if (typeof fullMessages[i].content !== 'string') {
        fullMessages[i] = {
          ...fullMessages[i],
          content: normalizeContentToString(fullMessages[i].content),
        };
      }
    }
  }
  
  // Debug: Log fullMessages to see what we're working with
  console.log('fullMessages count:', fullMessages.length);
  console.log('fullMessages content types:', fullMessages.map((msg, i) => ({ index: i, role: msg.role, contentType: typeof msg.content, isArray: Array.isArray(msg.content) })));

  // Helper function to prepare AI SDK messages (for OpenAI-compatible APIs)
  // This ensures all content is normalized to strings, handling array formats from chat history
  const prepareAIMessages = () => {
    const aiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    
    // Process all messages, ensuring content is always a string
    // Even though fullMessages should already be normalized, we double-check here for safety
    for (const msg of fullMessages) {
      // Normalize content to string (handles edge cases where normalization might have failed)
      const contentStr = normalizeContentToString(msg.content);
      
      // Only add non-empty messages
      if (contentStr && contentStr.trim().length > 0) {
        // Ensure role is valid
        const role = msg.role === 'system' ? 'system' : 
                     msg.role === 'assistant' ? 'assistant' : 
                     'user';
        
        aiMessages.push({
          role: role as 'system' | 'user' | 'assistant',
          content: contentStr.trim(),
        });
      }
    }
    
    return aiMessages;
  };

  // Primary: Gemini (reliable and free)
  // Use stable model names from deprecation table (gemini-2.5-flash, gemini-2.5-pro)
  const geminiModels = ['gemini-2.5-flash', 'gemini-2.5-pro'];
  let geminiRateLimited = false;
  
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
    } catch (error: unknown) {
      // Check if it's a rate limit error (429) - skip remaining Gemini models
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Too Many Requests')) {
        console.log(`Gemini model ${modelName} rate limited, skipping remaining Gemini models...`);
        geminiRateLimited = true;
        break; // Exit Gemini loop immediately
      }
      console.log(`Gemini model ${modelName} failed, trying next...`, error);
    }
  }
  
  // If all Gemini models failed (or rate limited), try fallbacks
  if (geminiRateLimited) {
    console.log('Gemini rate limited, trying OpenRouter...');
  } else {
    console.log('All Gemini models failed, trying OpenRouter...');
  }

  // Fallback 1: OpenRouter GPT
  // Support both OPENROUTER_API_KEY and OpenRouter_API_KEY env var names
  const openRouterApiKey = process.env.OPENROUTER_API_KEY || process.env.OpenRouter_API_KEY;
  if (openRouterApiKey) {
    try {
      console.log('Trying OpenRouter GPT...');
      const openaiClient = createOpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: openRouterApiKey,
        headers: {
          'HTTP-Referer': process.env.NEXT_PUBLIC_CHATBOT_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.arnobmahmud.com',
          'X-Title': 'Portfolio Chatbot',
        },
      });
      
      // Force use of Chat Completions API (not Responses API) by using .chat() method
      const model = openaiClient.chat('openai/gpt-4o-mini');

    const aiMessages = prepareAIMessages();
    
    // CRITICAL: Final runtime validation - ensure ALL content is strings
    // Create deep copies to prevent mutation and ensure string content
    const validatedMessages = aiMessages.map((msg, index) => {
      // Deep clone to prevent mutation
      const clonedMsg = JSON.parse(JSON.stringify(msg));
      
      // Ensure content is a string
      if (typeof clonedMsg.content !== 'string') {
        console.error(`ERROR: Message ${index} has non-string content:`, typeof clonedMsg.content, Array.isArray(clonedMsg.content), clonedMsg);
        // Force normalize
        clonedMsg.content = normalizeContentToString(clonedMsg.content);
      }
      
      // Final check - ensure it's a string
      if (typeof clonedMsg.content !== 'string') {
        console.error(`CRITICAL: Message ${index} still has non-string content after normalization!`, clonedMsg);
        clonedMsg.content = String(clonedMsg.content || '');
      }
      
      return {
        role: clonedMsg.role as 'system' | 'user' | 'assistant',
        content: String(clonedMsg.content), // Force string conversion
      };
    });
    
    // Verify all messages have string content after validation
    const hasArrayContent = validatedMessages.some(msg => Array.isArray(msg.content) || typeof msg.content !== 'string');
    if (hasArrayContent) {
      console.error('ERROR: Some messages still have non-string content after validation!', validatedMessages.filter(msg => Array.isArray(msg.content) || typeof msg.content !== 'string'));
      throw new Error('Message normalization failed: some messages still have array content');
    }

    if (stream) {
      const result = streamText({
        model: model,
        messages: validatedMessages as Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
        temperature: 0.7,
      });
      console.log('✅ OpenRouter GPT responding successfully');
      return result;
    } else {
      const result = await generateText({
        model: model,
        messages: validatedMessages as Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
        temperature: 0.7,
      });
      console.log('✅ OpenRouter GPT responding successfully');
      return result;
    }
    } catch (error) {
      console.error('OpenRouter failed, trying Groq...', error);
    }
  }

  // Fallback 2: Groq (fast and free tier available)
  // Support both GROQ_API_KEY and Groq_Llama_API_KEY env var names
  const groqApiKey = process.env.GROQ_API_KEY || process.env.Groq_Llama_API_KEY;
  if (groqApiKey) {
    try {
      console.log('Trying Groq...');
      const groq = createGroq({
        apiKey: groqApiKey,
      });

      const aiMessages = prepareAIMessages();

      if (stream) {
        return streamText({
          model: groq('llama-3.3-70b-versatile'), // Updated from llama-3.1-70b-versatile (deprecated Jan 24, 2025)
          messages: aiMessages,
          temperature: 0.7,
        });
      } else {
        return await generateText({
          model: groq('llama-3.3-70b-versatile'), // Updated from llama-3.1-70b-versatile (deprecated Jan 24, 2025)
          messages: aiMessages,
          temperature: 0.7,
        });
      }
    } catch (error) {
      console.error('Groq failed, trying Hugging Face...', error);
    }
  }

  // Fallback 3: Hugging Face Inference API (trying multiple models)
  // Support both HUGGING_FACE_API_KEY and Hugging_Face_Inference_API_KEY env var names
  const huggingFaceApiKey = process.env.HUGGING_FACE_API_KEY || process.env.Hugging_Face_Inference_API_KEY;
  if (huggingFaceApiKey) {
    // List of models to try in order (prioritize smaller/faster models first)
    const models = [
      // Small/fast models first (for speed)
      'Qwen/Qwen3-0.6B', // 0.8B - very fast
      'google/gemma-2b-it', // 2B - fast
      'google/gemma-2b', // 2B - fast
      'microsoft/phi-1_5', // Small and fast
      'LiquidAI/LFM2.5-1.2B-Thinking', // 1B - fast
      'LiquidAI/LFM2.5-1.2B-Instruct', // 1B - fast
      // Medium models (good balance)
      'meta-llama/Llama-3.1-8B-Instruct', // 8B - reliable
      'tiiuae/falcon-7b-instruct', // 7B
      'mistralai/Mistral-7B-Instruct-v0.3', // 7B
      'HuggingFaceH4/zephyr-7b-beta', // 7B
      'google/gemma-7b', // 7B
      'NousResearch/Hermes-2-Pro-Mistral-7B', // 7B
      'NousResearch/NousCoder-14B', // 14B
      // Larger models (slower but better quality) - try last
      'zai-org/GLM-4.7-Flash', // 31B - works but slower
      'Qwen/Qwen3-Coder-30B-A3B-Instruct', // 31B
      'openai/gpt-oss-20b', // 22B
      'openai/gpt-oss-120b', // 120B - very slow
      // Legacy fallbacks
      'mistralai/Mistral-7B-Instruct-v0.2',
      'tiiuae/falcon-7b',
      'HuggingFaceH4/zephyr-7b-alpha',
    ];

    const failedModels: string[] = [];
    const aiMessages = prepareAIMessages();

    for (const model of models) {
      try {
        console.log(`Trying Hugging Face model: ${model}...`);
        
        // Use OpenAI-compatible router endpoint (like multi-ai-chatbot)
        const response = await fetch(
          'https://router.huggingface.co/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${huggingFaceApiKey}`,
            },
            body: JSON.stringify({
              model: model,
              messages: aiMessages,
              max_tokens: 512,
              temperature: 0.7,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          // Extract generated text from OpenAI-compatible format
          let generatedText = '';
          if (data?.choices?.[0]?.message?.content) {
            generatedText = data.choices[0].message.content.trim();
          } else if (data?.choices?.[0]?.text) {
            generatedText = data.choices[0].text.trim();
          } else if (data?.output?.[0]?.content?.[0]?.text) {
            // Alternative format
            generatedText = data.output[0].content[0].text.trim();
          }

          if (generatedText) {
            console.log(`✅ Success with Hugging Face model: ${model}`);
            
            if (stream) {
              return {
                textStream: (async function* () {
                  // Simulate streaming by yielding chunks
                  const words = generatedText.split(' ');
                  for (const word of words) {
                    yield word + ' ';
                    // Small delay to simulate streaming
                    await new Promise(resolve => setTimeout(resolve, 10));
                  }
                })(),
              };
            } else {
              return { text: generatedText };
            }
          }
        }

        // If this model failed, try next one
        failedModels.push(`${model} (${response.status})`);
        console.warn(`${model} failed (${response.status}), trying next model...`);
        
      } catch (error: unknown) {
        failedModels.push(model);
        console.warn(`${model} error:`, error);
        continue;
      }
    }

    // If all models failed
    console.error(`All Hugging Face models failed: ${failedModels.join(', ')}`);
    // Don't throw error here, continue to next fallback (OpenAI)
  }

  // Fallback 4: OpenAI Direct (if API key is available)
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log('Trying OpenAI direct...');
      const openaiClient = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
      });

      const aiMessages = prepareAIMessages();

      if (stream) {
        return streamText({
          model: openaiClient('gpt-4o-mini'),
          messages: aiMessages,
          temperature: 0.7,
        });
      } else {
        return await generateText({
          model: openaiClient('gpt-4o-mini'),
          messages: aiMessages,
          temperature: 0.7,
        });
      }
    } catch (error) {
      console.error('OpenAI direct failed:', error);
    }
  }

  throw new Error('All AI models failed');
}
