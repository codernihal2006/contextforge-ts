import { createDemo } from "./demo";
import { GeminiAnswerer } from "./gemini";

declare const process: { argv: string[]; env: { GEMINI_API_KEY?: string; GEMINI_MODEL?: string }; exitCode?: number };

const apiKey = process.env.GEMINI_API_KEY;
const { orchestrator, evaluation } = createDemo(apiKey ? new GeminiAnswerer(apiKey, process.env.GEMINI_MODEL) : undefined);
const question = process.argv.slice(2).join(" ") || "How do I rotate an API key?";
async function main() {
  const answer = await orchestrator.run(question);
  console.log(JSON.stringify({ answer: answer.text, citations: answer.citations, grounded: answer.grounded, latencyMs: answer.latencyMs }, null, 2));
  console.log("Evaluation:", JSON.stringify(await evaluation(), null, 2));
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Request failed"); process.exitCode = 1; });
