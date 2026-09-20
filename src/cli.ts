import { createDemo } from "./data/demo";
import { GeminiAnswerer } from "./integrations/gemini";
import { loadConfig } from "./config/env";

const config = loadConfig();
const { orchestrator, evaluation } = createDemo(config.geminiApiKey ? new GeminiAnswerer(config.geminiApiKey, config.geminiModel) : undefined);
const { argv } = process;
const question = argv.slice(2).join(" ") || "How do I rotate an API key?";
async function main() {
  const answer = await orchestrator.run(question);
  console.log(JSON.stringify({ answer: answer.text, citations: answer.citations, grounded: answer.grounded, latencyMs: answer.latencyMs }, null, 2));
  console.log("Evaluation:", JSON.stringify(await evaluation(), null, 2));
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Request failed"); process.exitCode = 1; });
