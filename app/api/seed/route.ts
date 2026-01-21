// NextRequest not used in this route
import { faqs } from '@/lib/faqs';
import { generateEmbeddings } from '@/lib/embeddings';
import { storeVector } from '@/lib/redis';

export const runtime = 'nodejs'; // Use Node.js runtime for longer operations

export async function POST() {
  try {
    // Generate embeddings for all FAQs
    const texts = faqs.map(([q, a]) => `${q} ${a}`);
    const embeddings = await generateEmbeddings(texts);

    // Store vectors in Redis
    for (let i = 0; i < faqs.length; i++) {
      const [question, answer] = faqs[i];
      await storeVector(`faq-${i + 1}`, embeddings[i], {
        question,
        answer,
      });
    }

    return new Response(
      JSON.stringify({ success: true, count: faqs.length }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Seed error:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Seed failed', details: errorMessage }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
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
