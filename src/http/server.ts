import { createDemo } from "../data/demo";
import { GeminiAnswerer } from "../integrations/gemini";
import { loadConfig } from "../config/env";
import { createApp } from "./app";

const config = loadConfig();
const answerer = config.geminiApiKey ? new GeminiAnswerer(config.geminiApiKey, config.geminiModel) : undefined;
const { orchestrator, evaluation } = createDemo(answerer);
const app = createApp(orchestrator, evaluation);

app.listen(config.port, "127.0.0.1", () => {
  console.log(`ContextForge listening on http://127.0.0.1:${config.port}`);
});
