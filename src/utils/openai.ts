import OpenAI from 'openai';
import type { ModelOption } from '../types';
import { isChatModel, sortModels, getModelDisplayName } from './models';

export function getOpenAIClient(apiKey: string): OpenAI {
  // dangerouslyAllowBrowser is required when calling OpenAI directly from a browser.
  // This is intentional: the user supplies their own API key and accepts responsibility.
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const client = getOpenAIClient(apiKey);
    await client.models.list();
    return true;
  } catch (error) {
    if (error instanceof OpenAI.APIError && error.status === 401) {
      return false;
    }
    throw error;
  }
}

export async function fetchChatModels(apiKey: string): Promise<ModelOption[]> {
  const client = getOpenAIClient(apiKey);
  const response = await client.models.list();
  const chatModels = response.data
    .filter((m) => isChatModel(m.id))
    .map((m) => ({ id: m.id, name: getModelDisplayName(m.id) }));
  return sortModels(chatModels);
}

export function parseOpenAIError(error: unknown): string {
  if (error instanceof OpenAI.APIError) {
    switch (error.status) {
      case 401:
        return 'Invalid API key. Please update your key in the sidebar.';
      case 429:
        return 'Rate limit exceeded. Please wait a moment and try again.';
      case 500:
        return 'OpenAI server error. Please try again later.';
      case 503:
        return 'OpenAI is currently unavailable. Please try again later.';
      default:
        return `API error (${error.status}): ${error.message}`;
    }
  }
  if (error instanceof Error) {
    if (error.name === 'AbortError') return ''; // User cancelled — silent
    return error.message;
  }
  return 'An unexpected error occurred.';
}
