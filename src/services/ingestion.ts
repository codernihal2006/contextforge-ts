import { Chunk, Metadata } from "../domain/types";
import { termFrequency } from "../utils/text";

export function chunkDocument(document: Metadata & { text: string }, size = 70, overlap = 12): Chunk[] {
  const words = document.text.trim().split(/\s+/).filter(Boolean);
  const chunks: Chunk[] = [];
  const step = Math.max(1, size - overlap);
  for (let start = 0, index = 0; start < words.length; start += step, index += 1) {
    const text = words.slice(start, start + size).join(" ");
    chunks.push({ ...document, id: `${document.source}#${index + 1}`, text, terms: termFrequency(text) });
  }
  return chunks;
}
