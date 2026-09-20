import { Answer, Citation, QueryPlan } from "../domain/types";
import { HybridRetriever } from "./retriever";

export interface Answerer {
  answer(question: string, evidence: string[]): Promise<{ text: string; grounded: boolean }>;
}

export class DeterministicAnswerer implements Answerer {
  async answer(question: string, evidence: string[]): Promise<{ text: string; grounded: boolean }> {
    if (evidence.length === 0) return { text: "I could not find enough evidence in the indexed knowledge base to answer that reliably.", grounded: false };
    return { text: `Based on the indexed documentation, ${evidence[0].replace(/[.!?]+$/, "")}.`, grounded: true };
  }
}

export class ContextForgeOrchestrator {
  constructor(private readonly retriever: HybridRetriever, private readonly answerer: Answerer = new DeterministicAnswerer()) {}

  plan(question: string): QueryPlan {
    const normalized = question.trim().replace(/\s+/g, " ");
    const tag = /security|auth|key|token/i.test(normalized) ? "security" : undefined;
    return { original: question, normalized, rewritten: normalized.replace(/\?$/, ""), filters: { tag } };
  }

  async run(question: string): Promise<Answer> {
    const started = Date.now();
    const plan = this.plan(question);
    const hits = this.retriever.search(plan.rewritten, { topK: 3, tag: plan.filters.tag });
    const evidence = hits.map((hit) => hit.chunk.text);
    const result = await this.answerer.answer(plan.original, evidence);
    const citations: Citation[] = hits.map((hit) => ({ id: hit.chunk.id, source: hit.chunk.source, title: hit.chunk.title, excerpt: hit.chunk.text }));
    return { ...result, citations, refusal: !result.grounded, latencyMs: Date.now() - started };
  }
}
