export type Metadata = {
  source: string;
  title: string;
  section?: string;
  tags?: string[];
};

export type Chunk = Metadata & {
  id: string;
  text: string;
  terms: Map<string, number>;
};

export type SearchHit = {
  chunk: Chunk;
  score: number;
  rank: number;
  channel: "lexical" | "vector" | "hybrid";
};

export type Citation = {
  id: string;
  source: string;
  title: string;
  excerpt: string;
};

export type Answer = {
  text: string;
  citations: Citation[];
  grounded: boolean;
  refusal: boolean;
  latencyMs: number;
};

export type QueryPlan = {
  original: string;
  normalized: string;
  rewritten: string;
  filters: { tag?: string };
};
