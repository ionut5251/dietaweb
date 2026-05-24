import { buildEnhancePlanPrompt, buildPhotoAnalysisPrompt, AI_MODELS, getEnhanceMaxTokens } from '../../shared/ai/prompts.js';
import { parseAiJson, humanizeAiError } from '../../shared/ai/mergeEnhancement.js';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export function isAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

async function chatCompletion({ model, messages, maxTokens = 2500 }) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY no configurada');

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
      temperature: 0.6,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data.error?.message || `OpenAI error ${res.status}`;
    throw new Error(msg);
  }

  return data.choices?.[0]?.message?.content ?? '';
}

export async function enhancePlanWithOpenAI(input, basePlan) {
  const prompt = buildEnhancePlanPrompt(input, basePlan);
  const content = await chatCompletion({
    model: AI_MODELS.text,
    maxTokens: getEnhanceMaxTokens(basePlan),
    messages: [
      {
        role: 'system',
        content:
          'Eres entrenador personal y dietista de elite en España. Respondes únicamente JSON válido. Rutinas con volumen profesional real.',
      },
      { role: 'user', content: prompt },
    ],
  });
  return parseAiJson(content);
}

export { humanizeAiError };

export async function analyzeProgressPhotoWithOpenAI({ imageBase64, mimeType, context }) {
  const prompt = buildPhotoAnalysisPrompt(context);
  const dataUrl = imageBase64.startsWith('data:')
    ? imageBase64
    : `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;

  const content = await chatCompletion({
    model: AI_MODELS.vision,
    maxTokens: 1500,
    messages: [
      {
        role: 'system',
        content: 'Analizas progreso físico de forma prudente y profesional. Solo JSON.',
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: dataUrl, detail: 'low' } },
        ],
      },
    ],
  });
  return parseAiJson(content);
}
