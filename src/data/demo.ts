import { chunkDocument } from "../services/ingestion";
import { ContextForgeOrchestrator, Answerer } from "../services/orchestrator";
import { HybridRetriever } from "../services/retriever";
import { evaluate } from "../services/evaluation";

export function createDemo(answerer?: Answerer) {
  const chunks = [
    ...chunkDocument({ source: "runbook.md", title: "API key rotation", tags: ["security"], text: "Rotate API keys every 90 days. Store secrets in the managed secret store. Revoke the old key only after the new key has been deployed and verified." }),
    ...chunkDocument({ source: "deploy.md", title: "Deployment checklist", tags: ["release"], text: "Run the test suite before deployment. Confirm environment variables are present. Monitor error rate and latency after the release." }),
    ...chunkDocument({ source: "support.md", title: "Incident response", tags: ["operations"], text: "Create an incident channel, assign an owner, record the timeline, and communicate status updates until the service is stable." })
  ];
  const orchestrator = new ContextForgeOrchestrator(new HybridRetriever(chunks), answerer);
  return { orchestrator, evaluation: () => evaluate(orchestrator, [
    { question: "How do I rotate an API key?", expectedSource: "runbook.md" },
    { question: "What should I check before deployment?", expectedSource: "deploy.md" },
    { question: "How do I handle an incident?", expectedSource: "support.md" }
  ]) };
}
