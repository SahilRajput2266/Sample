import { generateWithOpenAI } from './openai.service.js';
import { generateWithGemini } from './gemini.service.js';

export const resolveAIProvider = () => {
  const configured = String(process.env.AI_PROVIDER || 'template').toLowerCase();
  if (configured === 'openai' && process.env.OPENAI_API_KEY) return { provider: 'openai', model: process.env.AI_MODEL || 'gpt-4o-mini', generate: generateWithOpenAI };
  if (configured === 'gemini' && process.env.GEMINI_API_KEY) return { provider: 'gemini', model: process.env.AI_MODEL || 'gemini-2.5-flash', generate: generateWithGemini };
  return { provider: 'template', model: 'template-v1', generate: null };
};
