import type { ModelOption } from '../types';

const CHAT_MODEL_PATTERNS = [
  /^gpt-4/,
  /^gpt-3\.5/,
  /^o1/,
  /^o3/,
  /^o4/,
  /^chatgpt/,
];

const EXCLUDE_PATTERNS = [
  /embedding/,
  /whisper/,
  /dall-e/,
  /tts/,
  /babbage/,
  /davinci/,
  /-instruct$/,
  /realtime/,
  /audio/,
  /search/,
  /transcribe/,
  /computer-use/,
];

export function isChatModel(modelId: string): boolean {
  const lower = modelId.toLowerCase();
  if (EXCLUDE_PATTERNS.some((p) => p.test(lower))) return false;
  return CHAT_MODEL_PATTERNS.some((p) => p.test(lower));
}

const MODEL_PRIORITY: Record<string, number> = {
  'gpt-4o': 0,
  'gpt-4o-mini': 1,
  'o3': 2,
  'o3-mini': 3,
  'o1': 4,
  'o1-mini': 5,
  'o4-mini': 6,
  'gpt-4-turbo': 7,
  'gpt-4': 8,
  'gpt-3.5-turbo': 9,
};

function getPriority(id: string): number {
  if (id in MODEL_PRIORITY) return MODEL_PRIORITY[id];
  if (id.startsWith('gpt-4o')) return 0;
  if (id.startsWith('o3')) return 2;
  if (id.startsWith('o1')) return 4;
  if (id.startsWith('o4')) return 6;
  if (id.startsWith('gpt-4')) return 8;
  if (id.startsWith('gpt-3.5')) return 9;
  return 99;
}

export function sortModels(models: ModelOption[]): ModelOption[] {
  return [...models].sort((a, b) => {
    const pa = getPriority(a.id);
    const pb = getPriority(b.id);
    if (pa !== pb) return pa - pb;
    return b.id.localeCompare(a.id); // newer (higher date suffix) first
  });
}

export function getModelDisplayName(modelId: string): string {
  const nameMap: Record<string, string> = {
    'gpt-4o': 'GPT-4o',
    'gpt-4o-mini': 'GPT-4o Mini',
    'gpt-4-turbo': 'GPT-4 Turbo',
    'gpt-4': 'GPT-4',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
    'o1': 'o1',
    'o1-mini': 'o1 Mini',
    'o1-preview': 'o1 Preview',
    'o3': 'o3',
    'o3-mini': 'o3 Mini',
    'o4-mini': 'o4 Mini',
  };
  if (modelId in nameMap) return nameMap[modelId];
  // Attempt a readable format for unknown models
  return modelId
    .split('-')
    .map((part) =>
      /^\d/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join(' ');
}
