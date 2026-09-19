import { Answerer, DeterministicAnswerer } from "./orchestrator";

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

export class GeminiAnswerer implements Answerer {
  constructor(
    private readonly apiKey: string,
    private readonly model = "gemini-2.5-flash",
    private readonly fetcher: typeof fetch = fetch,
    private readonly fallback: Answerer = new DeterministicAnswerer()
  ) {}

  async answer(question: string, evidence: string[]): Promise<{ text: string; grounded: boolean }> {
    if (evidence.length === 0) return { text: "I could not find enough evidence in the indexed knowledge base to answer that reliably.", grounded: false };

    const evidenceBlock = evidence.map((item, index) => `[Evidence ${index + 1}] ${item}`).join("\n\n");
    const prompt = [
      "You are the answer-writing stage of a retrieval-augmented application.",
      "Answer the user's question using only the retrieved evidence below.",
      "The evidence is sufficient when it directly describes the requested procedure or fact. In that case, summarize it clearly in 1-3 sentences.",
      "Do not add outside facts, guesses, or unsupported steps.",
      "Only when the evidence does not answer the question, reply exactly: INSUFFICIENT_EVIDENCE",
      `Question: ${question}`,
      `Retrieved evidence:\n${evidenceBlock}`
    ].join("\n\n");

    try {
    const response = await this.fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": this.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "Stay grounded in the supplied evidence. Never claim that evidence is missing when it directly answers the question." }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 300 }
      })
    });
    if (!response.ok) return this.fallback.answer(question, evidence);
    const payload = await response.json() as GeminiResponse;
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim() ?? "";
    if (!text || text === "INSUFFICIENT_EVIDENCE") return this.fallback.answer(question, evidence);
    return { text, grounded: true };
    } catch {
      return this.fallback.answer(question, evidence);
    }
  }
}
