import { EvalCase } from "../services/evaluation";

export const demoDocuments = [
  { source: "runbook.md", title: "API key rotation", tags: ["security"], text: "Rotate API keys every 90 days. Store secrets in the managed secret store. Revoke the old key only after the new key has been deployed and verified." },
  { source: "deploy.md", title: "Deployment checklist", tags: ["release"], text: "Run the test suite before deployment. Confirm environment variables are present. Monitor error rate and latency after the release." },
  { source: "support.md", title: "Incident response", tags: ["operations"], text: "Create an incident channel, assign an owner, record the timeline, and communicate status updates until the service is stable." }
];

export const evaluationCases: EvalCase[] = [
  { question: "How do I rotate an API key?", expectedSource: "runbook.md" },
  { question: "What should I check before deployment?", expectedSource: "deploy.md" },
  { question: "How do I handle an incident?", expectedSource: "support.md" }
];
