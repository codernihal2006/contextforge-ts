import { Chunk, SearchHit } from "./types";
import { lexicalScore, termFrequency } from "./text";

export class HybridRetriever {
  constructor(private readonly chunks: Chunk[]) {}

  search(query: string, options: { topK?: number; tag?: string } = {}): SearchHit[] {
    const topK = options.topK ?? 5;
    const candidates = this.chunks.filter((chunk) => !options.tag || chunk.tags?.includes(options.tag));
    const queryTerms = termFrequency(query);
    const lexical = candidates
      .map((chunk) => ({ chunk, score: lexicalScore(queryTerms, chunk.terms) }))
      .filter((hit) => hit.score > 0)
      .sort((a, b) => b.score - a.score);

    const vector = candidates
      .map((chunk) => ({ chunk, score: lexicalScore(queryTerms, chunk.terms) + (chunk.text.toLowerCase().includes(query.toLowerCase()) ? 0.5 : 0) }))
      .filter((hit) => hit.score > 0)
      .sort((a, b) => b.score - a.score);

    const fused = new Map<string, SearchHit>();
    const add = (list: typeof lexical, channel: "lexical" | "vector") => list.forEach((hit, index) => {
      const existing = fused.get(hit.chunk.id);
      const contribution = 1 / (50 + index + 1);
      fused.set(hit.chunk.id, {
        chunk: hit.chunk,
        score: (existing?.score ?? 0) + contribution,
        rank: Math.min(existing?.rank ?? index + 1, index + 1),
        channel: existing ? "hybrid" : channel
      });
    });
    add(lexical, "lexical");
    add(vector, "vector");
    return [...fused.values()].sort((a, b) => b.score - a.score).slice(0, topK);
  }
}
