import { createDemo } from "./demo";
import { GeminiAnswerer } from "./gemini";

declare const process: { env: Record<string, string | undefined> };
declare const require: (name: string) => any;

const { createServer } = require("node:http");

const answerer = process.env.GEMINI_API_KEY ? new GeminiAnswerer(process.env.GEMINI_API_KEY, process.env.GEMINI_MODEL) : undefined;
const { orchestrator, evaluation } = createDemo(answerer);
const port = Number(process.env.PORT ?? 8787);

function send(response: any, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request: any, response: any) => {
  if (request.method === "GET" && request.url === "/health") {
    send(response, 200, { status: "ok", service: "contextforge" });
    return;
  }
  if (request.method === "GET" && request.url === "/evaluate") {
    evaluation().then((result) => send(response, 200, result)).catch(() => send(response, 502, { error: "evaluation failed" }));
    return;
  }
  if (request.method === "POST" && request.url === "/ask") {
    let body = "";
    request.on("data", (chunk: { toString: () => string }) => { body += chunk.toString(); });
    request.on("end", () => {
      try {
        const payload = JSON.parse(body) as { question?: unknown };
        if (typeof payload.question !== "string" || payload.question.trim().length === 0) {
          send(response, 400, { error: "question must be a non-empty string" });
          return;
        }
        orchestrator.run(payload.question).then((answer) => send(response, 200, answer)).catch(() => send(response, 502, { error: "answer provider failed" }));
      } catch {
        send(response, 400, { error: "request body must be valid JSON" });
      }
    });
    return;
  }
  send(response, 404, { error: "not found" });
});

server.listen(port, "127.0.0.1", () => console.log(`ContextForge listening on http://127.0.0.1:${port}`));
