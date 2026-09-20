import { chunkDocument } from "../services/ingestion";
import { ContextForgeOrchestrator, Answerer } from "../services/orchestrator";
import { HybridRetriever } from "../services/retriever";
import { evaluate } from "../services/evaluation";
import { demoDocuments, evaluationCases } from "./fixtures";

export function createDemo(answerer?: Answerer) {
  const chunks = demoDocuments.flatMap((document) => chunkDocument(document));
  const orchestrator = new ContextForgeOrchestrator(new HybridRetriever(chunks), answerer);
  return { orchestrator, evaluation: () => evaluate(orchestrator, evaluationCases) };
}
