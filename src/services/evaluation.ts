import { ContextForgeOrchestrator } from "./orchestrator";

export type EvalCase = { question: string; expectedSource: string };

export async function evaluate(orchestrator: ContextForgeOrchestrator, cases: EvalCase[]) {
  let sourceHits = 0;
  let grounded = 0;
  let cited = 0;
  let totalLatency = 0;
  for (const testCase of cases) {
    const answer = await orchestrator.run(testCase.question);
    if (answer.citations.some((citation) => citation.source === testCase.expectedSource)) sourceHits += 1;
    if (answer.grounded) grounded += 1;
    if (answer.citations.length > 0) cited += 1;
    totalLatency += answer.latencyMs;
  }
  return {
    cases: cases.length,
    retrievalHitRate: sourceHits / cases.length,
    groundedRate: grounded / cases.length,
    citationCoverage: cited / cases.length,
    averageLatencyMs: totalLatency / cases.length
  };
}
