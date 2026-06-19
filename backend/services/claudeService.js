/**
 * Servicio Claude (Anthropic) — genera rutinas de gimnasio de nivel profesional.
 * Usa fetch directo a la API REST (sin SDK extra).
 */
import { parseAiJson, humanizeAiError } from '../../shared/ai/mergeEnhancement.js';
import { buildClaudeWorkoutPrompt, CLAUDE_MODEL } from '../../shared/ai/prompts.js';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

export function isClaudeConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

async function claudeMessage({ model, system, userContent, maxTokens = 8000 }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY no configurada');

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data.error?.message || `Claude error ${res.status}`;
    throw new Error(msg);
  }

  return data.content?.[0]?.text ?? '';
}

export async function generateWorkoutWithClaude(input) {
  const { system, user } = buildClaudeWorkoutPrompt(input);

  const raw = await claudeMessage({
    model: CLAUDE_MODEL,
    system,
    userContent: user,
    maxTokens: 9000,
  });

  return parseAiJson(raw);
}

export { humanizeAiError };
