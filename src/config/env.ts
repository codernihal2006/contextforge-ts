export type AppConfig = {
  port: number;
  geminiApiKey?: string;
  geminiModel: string;
  geminiBaseUrl: string;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    port: Number(env.PORT ?? 8787),
    geminiApiKey: env.GEMINI_API_KEY,
    geminiModel: env.GEMINI_MODEL ?? "gemini-2.5-flash",
    geminiBaseUrl: env.GEMINI_API_BASE_URL ?? "https://generativelanguage.googleapis.com"
  };
}
