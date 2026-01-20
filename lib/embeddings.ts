// Generate embeddings - Fallback chain: Gemini Embeddings (primary) → Hugging Face → OpenRouter → OpenAI
export async function generateEmbedding(text: string): Promise<number[]> {
  let lastError: Error | null = null;

  // Primary: Gemini Embeddings API (gemini-embedding-001)
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'models/gemini-embedding-001',
          content: {
            parts: [{ text: text }],
          },
          taskType: 'RETRIEVAL_DOCUMENT', // Optimized for document search (RAG)
          outputDimensionality: 768, // Recommended size for efficiency
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.embedding?.values) {
        // Normalize embedding for cosine similarity (required for non-3072 dimensions)
        const values = data.embedding.values;
        const norm = Math.sqrt(values.reduce((sum: number, val: number) => sum + val * val, 0));
        return values.map((val: number) => val / norm);
      }
    } else {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Gemini embedding failed: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.log('Gemini embedding failed, trying Hugging Face...', error);
    lastError = error instanceof Error ? error : new Error(String(error));
  }

  // Fallback 1: Hugging Face
  const maxRetries = 2;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
      }

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
        const waitTime = parseInt(response.headers.get('retry-after') || '10') * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          return Array.isArray(data[0]) ? data[0] : data;
        }
        if (data.embeddings) {
          return data.embeddings[0];
        }
        return data;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) continue;
    }
  }

  // Fallback 2: OpenRouter (OpenAI embeddings)
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
    console.log('OpenRouter embedding failed, trying OpenAI...', error);
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
      console.log('OpenAI embedding failed', error);
    }
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
