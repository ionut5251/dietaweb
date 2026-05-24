/**
 * Proxy seguro OpenAI para GitHub Pages.
 * La API key NUNCA va al navegador — solo en secret de Cloudflare.
 */
import { buildEnhancePlanPrompt, buildPhotoAnalysisPrompt, AI_MODELS } from '../../../shared/ai/prompts.js';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim());
  const ok = allowed.includes(origin) || allowed.includes('*');
  return {
    'Access-Control-Allow-Origin': ok ? origin : allowed[0] || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

async function openaiChat(env, { model, messages, maxTokens = 2500 }) {
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
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
  if (!res.ok) throw new Error(data.error?.message || `OpenAI ${res.status}`);
  return data.choices?.[0]?.message?.content ?? '';
}

function parseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = { 'Content-Type': 'application/json', ...corsHeaders(origin, env) };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);

    if (url.pathname === '/status' || url.pathname === '/status/') {
      return Response.json(
        {
          aiAvailable: Boolean(env.OPENAI_API_KEY),
          provider: 'openai',
          models: AI_MODELS,
        },
        { headers },
      );
    }

    if (!env.OPENAI_API_KEY) {
      return Response.json({ error: 'OPENAI_API_KEY no configurada en Worker' }, { status: 503, headers });
    }

    if (request.method !== 'POST') {
      return Response.json({ error: 'Not found' }, { status: 404, headers });
    }

    try {
      const body = await request.json();

      if (url.pathname === '/enhance-plan' || url.pathname === '/enhance-plan/') {
        const { input, basePlan } = body;
        if (!input || !basePlan) {
          return Response.json({ error: 'Faltan input o basePlan' }, { status: 400, headers });
        }
        const prompt = buildEnhancePlanPrompt(input, basePlan);
        const content = await openaiChat(env, {
          model: AI_MODELS.text,
          messages: [
            { role: 'system', content: 'Dietista y entrenador. Solo JSON en español.' },
            { role: 'user', content: prompt },
          ],
        });
        const aiJson = parseJson(content);
        if (!aiJson) {
          return Response.json({ error: 'Respuesta IA inválida' }, { status: 502, headers });
        }
        return Response.json(
          { ok: true, aiJson, aiEnhanced: true, aiInterpretacion: aiJson.interpretacionProfesional },
          { headers },
        );
      }

      if (url.pathname === '/analyze-photo' || url.pathname === '/analyze-photo/') {
        const { imageBase64, mimeType, context } = body;
        if (!imageBase64) {
          return Response.json({ error: 'Falta imageBase64' }, { status: 400, headers });
        }
        const dataUrl = imageBase64.startsWith('data:')
          ? imageBase64
          : `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;
        const prompt = buildPhotoAnalysisPrompt(context || {});
        const content = await openaiChat(env, {
          model: AI_MODELS.vision,
          maxTokens: 1500,
          messages: [
            { role: 'system', content: 'Valoración visual prudente. Solo JSON.' },
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: dataUrl, detail: 'low' } },
              ],
            },
          ],
        });
        const analysis = parseJson(content);
        if (!analysis) {
          return Response.json({ error: 'Análisis inválido' }, { status: 502, headers });
        }
        return Response.json({ ok: true, analysis }, { headers });
      }

      return Response.json({ error: 'Ruta no encontrada' }, { status: 404, headers });
    } catch (err) {
      return Response.json({ error: err.message || 'Error interno' }, { status: 502, headers });
    }
  },
};
