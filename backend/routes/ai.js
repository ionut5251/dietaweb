import { Router } from 'express';
import { isAiConfigured, enhancePlanWithOpenAI, analyzeProgressPhotoWithOpenAI } from '../services/openaiService.js';
import { mergeAiEnhancement } from '../../shared/ai/mergeEnhancement.js';
import { buildFullPlan } from '../../shared/generatePlan.js';
import { enhancePlanIfAvailable } from '../services/planAiEnhancer.js';

const router = Router();

router.get('/status', (_req, res) => {
  res.json({
    aiAvailable: isAiConfigured(),
    provider: 'openai',
    models: { text: 'gpt-4o-mini', vision: 'gpt-4o' },
  });
});

router.post('/enhance-plan', async (req, res) => {
  if (!isAiConfigured()) {
    return res.status(503).json({ error: 'IA no configurada. Añade OPENAI_API_KEY al servidor.' });
  }

  const { input, basePlan } = req.body;
  if (!input || !basePlan) {
    return res.status(400).json({ error: 'Faltan input o basePlan' });
  }

  try {
    const aiJson = await enhancePlanWithOpenAI(input, basePlan);
    if (!aiJson) {
      return res.status(502).json({ error: 'Respuesta IA inválida' });
    }
    const plan = mergeAiEnhancement(basePlan, aiJson, input);
    res.json({ ok: true, plan, aiEnhanced: true, aiInterpretacion: aiJson.interpretacionProfesional });
  } catch (err) {
    res.status(502).json({ error: err.message || 'Error al contactar OpenAI' });
  }
});

router.post('/generate-with-ai', async (req, res) => {
  const base = buildFullPlan(req.body);
  if (!base.ok) {
    return res.status(400).json({ error: base.error, detalles: base.detalles });
  }

  const { ok, ...basePlan } = base;
  const { plan, aiEnhanced, aiAvailable, error, skipped } = await enhancePlanIfAvailable(
    basePlan.datosUsuario,
    basePlan,
  );

  res.json({
    ...plan,
    aiEnhanced: Boolean(aiEnhanced),
    aiAvailable: Boolean(aiAvailable),
    aiSkipped: Boolean(skipped),
    aiError: error || null,
  });
});

router.post('/analyze-photo', async (req, res) => {
  if (!isAiConfigured()) {
    return res.status(503).json({ error: 'IA no configurada' });
  }

  const { imageBase64, mimeType, context } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: 'Falta imagen (imageBase64)' });
  }

  if (imageBase64.length > 8_000_000) {
    return res.status(413).json({ error: 'Imagen demasiado grande' });
  }

  try {
    const analysis = await analyzeProgressPhotoWithOpenAI({
      imageBase64,
      mimeType,
      context: context || {},
    });
    if (!analysis) {
      return res.status(502).json({ error: 'No se pudo analizar la imagen' });
    }
    res.json({ ok: true, analysis });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

export default router;
