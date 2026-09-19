# ContextForge

ContextForge is a TypeScript service for answering questions from a small, indexed knowledge base. It keeps the retrieval and orchestration logic visible so that each answer can be inspected and tested.

## What it demonstrates

- document chunking with source metadata;
- hybrid retrieval using lexical scoring, token overlap, metadata filters, and reciprocal-rank fusion;
- a typed planner, retriever, answerer, and verifier flow;
- citations attached to every grounded answer;
- a safe refusal when the indexed material does not support an answer;
- repeatable evaluation for retrieval hit rate, grounding, citation coverage, and latency;
- a small HTTP API with health, question-answering, and evaluation endpoints.

The bundled answerer is deterministic, which makes the project runnable without a paid model API or network access. The `Answerer` interface also supports the Gemini adapter; retrieval and citation behavior remain independently testable.

## Gemini mode

Set the key in the shell rather than committing it to the repository:

```bash
export GEMINI_API_KEY="your-key"
export GEMINI_MODEL="gemini-2.5-flash"
npm start -- "How do I rotate an API key?"
```

With the key present, Gemini writes the answer from the locally retrieved evidence. The application still owns retrieval, citations, and refusal behavior. If Gemini is unavailable or rate-limited, the deterministic grounded answerer takes over.

## Run locally

```bash
npm install
npm test
npm start -- "How do I rotate an API key?"
npm run serve
```

The server listens on `http://localhost:8787` by default.

## HTTP API

Health check:

```bash
curl http://localhost:8787/health
```

Ask a question:

```bash
curl -X POST http://localhost:8787/ask \
  -H 'content-type: application/json' \
  -d '{"question":"How do I rotate an API key?"}'
```

Run the evaluation set:

```bash
curl http://localhost:8787/evaluate
```

## Project structure

`ingest.ts` chunks documents, `retriever.ts` ranks evidence, `orchestrator.ts` coordinates the answer flow, `evaluate.ts` measures behavior, and `server.ts` exposes the service.

## Security

No secret is required for the current implementation. If a model provider is added, load credentials from environment variables and keep them out of source control. Use `.env.example` as the configuration template.
