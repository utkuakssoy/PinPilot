export const env = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  etsyApiKey: process.env.ETSY_API_KEY
};

export const demoMode = !(
  env.geminiApiKey || env.openaiApiKey
);

export const isGeminiConfigured = Boolean(env.geminiApiKey);
export const isOpenAiConfigured = Boolean(env.openaiApiKey);
export const isAiConfigured = Boolean(env.geminiApiKey || env.openaiApiKey);
