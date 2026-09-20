const STOP_WORDS = new Set("a an and are as at be by for from how i in is it of on or the this to what when where with you your".split(" "));

export function tokenize(value: string): string[] {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((term) => term.length > 1 && !STOP_WORDS.has(term));
}

export function termFrequency(value: string): Map<string, number> {
  const terms = tokenize(value);
  const counts = new Map<string, number>();
  for (const term of terms) counts.set(term, (counts.get(term) ?? 0) + 1);
  return counts;
}

export function lexicalScore(query: Map<string, number>, document: Map<string, number>): number {
  let score = 0;
  for (const [term, count] of query) score += count * (document.get(term) ?? 0);
  return score / Math.max(1, Math.sqrt([...document.values()].reduce((sum, value) => sum + value * value, 0)));
}
