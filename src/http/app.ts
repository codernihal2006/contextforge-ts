import express, { Request, Response } from "express";
import { ContextForgeOrchestrator } from "../services/orchestrator";

export function createApp(orchestrator: ContextForgeOrchestrator, runEvaluation: () => Promise<unknown>) {
  const app = express();
  app.use(express.json({ limit: "32kb" }));

  app.get("/health", (_request: Request, response: Response) => {
    response.json({ status: "ok", service: "contextforge" });
  });

  app.get("/evaluate", async (_request: Request, response: Response) => {
    response.json(await runEvaluation());
  });

  app.post("/ask", async (request: Request, response: Response) => {
    const question = request.body?.question;
    if (typeof question !== "string" || question.trim().length === 0) {
      response.status(400).json({ error: "question must be a non-empty string" });
      return;
    }
    response.json(await orchestrator.run(question));
  });

  app.use((_request: Request, response: Response) => {
    response.status(404).json({ error: "not found" });
  });

  app.use((error: unknown, _request: Request, response: Response, _next: unknown) => {
    console.error(error instanceof Error ? error.message : "request failed");
    response.status(500).json({ error: "internal server error" });
  });

  return app;
}
