export interface ModelPricing {
  input: number;   // USD per 1M tokens
  output: number;  // USD per 1M tokens
  cachedInput?: number;
}

// Prices in USD per 1M tokens — last updated Feb 2026
// Source: https://openai.com/api/pricing
const PRICING: Record<string, ModelPricing> = {
  // GPT-4o family
  'gpt-4o':                  { input: 2.50,  output: 10.00, cachedInput: 1.25 },
  'gpt-4o-mini':             { input: 0.15,  output: 0.60,  cachedInput: 0.075 },
  'gpt-4o-audio-preview':    { input: 2.50,  output: 10.00 },

  // o1 family
  'o1':                      { input: 15.00, output: 60.00, cachedInput: 7.50 },
  'o1-mini':                 { input: 1.10,  output: 4.40 },
  'o1-preview':              { input: 15.00, output: 60.00, cachedInput: 7.50 },

  // o3 family
  'o3':                      { input: 2.00,  output: 8.00,  cachedInput: 0.50 },
  'o3-mini':                 { input: 1.10,  output: 4.40,  cachedInput: 0.275 },

  // o4 family
  'o4-mini':                 { input: 1.10,  output: 4.40,  cachedInput: 0.275 },

  // GPT-4 Turbo
  'gpt-4-turbo':             { input: 10.00, output: 30.00 },
  'gpt-4-turbo-preview':     { input: 10.00, output: 30.00 },
  'gpt-4':                   { input: 30.00, output: 60.00 },
  'gpt-4-32k':               { input: 60.00, output: 120.00 },

  // GPT-3.5
  'gpt-3.5-turbo':           { input: 0.50,  output: 1.50 },
  'gpt-3.5-turbo-0125':      { input: 0.50,  output: 1.50 },
  'gpt-3.5-turbo-instruct':  { input: 1.50,  output: 2.00 },

  // ChatGPT-4o latest
  'chatgpt-4o-latest':       { input: 5.00,  output: 15.00 },
};

/** Return pricing for a model ID, matching by exact id or longest prefix. */
export function getModelPricing(modelId: string): ModelPricing | null {
  if (modelId in PRICING) return PRICING[modelId];

  // Try longest-prefix match (e.g. "gpt-4o-2024-11-20" -> "gpt-4o")
  let bestMatch: string | null = null;
  for (const key of Object.keys(PRICING)) {
    if (modelId.startsWith(key)) {
      if (!bestMatch || key.length > bestMatch.length) {
        bestMatch = key;
      }
    }
  }
  return bestMatch ? PRICING[bestMatch] : null;
}

export function formatPrice(usdPer1M: number): string {
  if (usdPer1M < 0.01) return `$${(usdPer1M * 1000).toFixed(3)}/1K`;
  return `$${usdPer1M.toFixed(2)}/1M`;
}
