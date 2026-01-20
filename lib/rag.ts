import { generateEmbedding } from './embeddings';
import { searchVectors } from './redis';

export async function searchFAQ(query: string, topK: number = 3): Promise<string> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Search for similar FAQs
    const results = await searchVectors(queryEmbedding, topK);
    
    if (results.length === 0) {
      return '';
    }
    
    // Format results as context
    return results
      .map((result) => {
        const { question, answer } = result.metadata;
        return `Q: ${question}\nA: ${answer}`;
      })
      .join('\n\n');
  } catch (error) {
    console.error('RAG search failed:', error);
    return '';
  }
}
