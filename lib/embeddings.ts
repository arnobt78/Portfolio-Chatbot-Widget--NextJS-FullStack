// Generate embeddings - Fallback chain: Hugging Face → OpenRouter → Gemini → OpenAI → Groq (support)
export async function generateEmbedding(text: string): Promise<number[]> {
  // Primary: Hugging Face
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Wait for model to load (especially on first request)
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
      }

      // Use the new Hugging Face Inference Providers API (2025)
      // Try the feature extraction endpoint first
      let response = await fetch(
        'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: text }),
        }
      );

      // If that fails, try the models endpoint
      if (response.status === 410 || response.status === 404 || response.status === 503) {
        response = await fetch(
          'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: text }),
          }
        );
      }

      if (response.status === 503) {
        // Model is loading, wait and retry
        const waitTime = parseInt(response.headers.get('retry-after') || '10') * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch {
          errorText = response.statusText;
        }
        // If it's a 410 Gone, break out of retry loop and use fallback
        if (response.status === 410) {
          throw new Error('Hugging Face endpoint deprecated, using fallback');
        }
        throw new Error(`Embedding generation failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return Array.isArray(data[0]) ? data[0] : data;
      }
      
      if (data.embeddings) {
        return data.embeddings[0];
      }
      
      if (Array.isArray(data)) {
        return data;
      }
      
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        console.log(`Embedding attempt ${attempt + 1} failed, retrying...`);
        continue;
      }
    }
  }

  // Fallback 1: OpenRouter (OpenAI embeddings)
  try {
    console.log('Hugging Face failed, trying OpenRouter embeddings...');
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_CHATBOT_URL || 'http://localhost:3000',
        'X-Title': 'Portfolio Chatbot',
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-ada-002',
        input: text,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.data[0].embedding;
    }
  } catch (error) {
    console.log('OpenRouter embedding failed, trying Gemini...', error);
  }

  // Fallback 2: Google Gemini
  try {
    console.log('Trying Google Gemini embeddings...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: {
            parts: [{ text: text }],
          },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.embedding.values;
    }
  } catch (error) {
    console.log('Gemini embedding failed, trying OpenAI...', error);
  }

  // Fallback 3: OpenAI (direct - only if API key is available)
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log('Trying OpenAI embeddings...');
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: text,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data[0].embedding;
      }
    } catch (error) {
      console.log('OpenAI embedding failed, trying Groq (support)...', error);
    }
  } else {
    console.log('OpenAI API key not available, skipping to Groq (support)...');
  }

  // Fallback 4: Groq (support - note: Groq doesn't have embeddings API, will skip)
  try {
    console.log('Trying Groq embeddings (support)...');
    // Groq doesn't provide embeddings API, so this will fail and throw
    throw new Error('Groq does not provide embeddings API');
  } catch (error) {
    console.log('Groq not available for embeddings');
  }

  throw lastError || new Error('All embedding methods failed');
}

// Batch generate embeddings for FAQs (with rate limiting)
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  
  // Process in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchEmbeddings = await Promise.all(
      batch.map((text, index) => {
        // Add small delay between requests in batch
        return new Promise<number[]>((resolve, reject) => {
          setTimeout(async () => {
            try {
              const embedding = await generateEmbedding(text);
              resolve(embedding);
            } catch (error) {
              reject(error);
            }
          }, index * 200); // 200ms delay between each request
        });
      })
    );
    embeddings.push(...batchEmbeddings);
    
    // Wait between batches
    if (i + batchSize < texts.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  
  return embeddings;
}
