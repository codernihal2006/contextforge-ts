const test = require("node:test");
const assert = require("node:assert/strict");
const { createDemo } = require("../dist/demo.js");
const { GeminiAnswerer } = require("../dist/gemini.js");

test("answers with citations from the relevant source", async () => {
  const { orchestrator } = createDemo();
  const answer = await orchestrator.run("How do I rotate an API key?");
  assert.equal(answer.grounded, true);
  assert.equal(answer.citations[0].source, "runbook.md");
});

test("refuses when no evidence is available", async () => {
  const { orchestrator } = createDemo();
  const answer = await orchestrator.run("What is the office cafeteria menu?");
  assert.equal(answer.refusal, true);
});

test("uses Gemini output while keeping retrieval evidence local", async () => {
  const fetcher = async () => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: "Rotate the key every 90 days." }] } }] }) });
  const answerer = new GeminiAnswerer("test-key", "test-model", fetcher);
  const answer = await answerer.answer("How often should I rotate the key?", ["Rotate keys every 90 days."]);
  assert.equal(answer.grounded, true);
  assert.equal(answer.text, "Rotate the key every 90 days.");
});

test("falls back when Gemini is unavailable", async () => {
  const fetcher = async () => ({ ok: false, status: 429, json: async () => ({}) });
  const answerer = new GeminiAnswerer("test-key", "test-model", fetcher);
  const answer = await answerer.answer("How often should I rotate the key?", ["Rotate keys every 90 days."]);
  assert.equal(answer.grounded, true);
  assert.match(answer.text, /90 days/);
});
