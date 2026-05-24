import { Router } from 'express';
import { getOptions } from '../../shared/getOptions.js';
import { buildFullPlan } from '../../shared/generatePlan.js';
import { enhancePlanIfAvailable, isAiConfigured } from '../services/planAiEnhancer.js';

const router = Router();

router.get('/options', (_req, res) => {
  res.json({
    ...getOptions(),
    aiAvailable: isAiConfigured(),
  });
});

router.post('/generate', async (req, res) => {
  const result = buildFullPlan(req.body);
  if (!result.ok) {
    return res.status(400).json({ error: result.error, detalles: result.detalles });
  }

  const { ok, ...basePlan } = result;
  const useAi = req.body.useAi !== false;

  if (useAi && isAiConfigured()) {
    const { plan, aiEnhanced, aiAvailable, error, skipped } = await enhancePlanIfAvailable(
      basePlan.datosUsuario,
      basePlan,
    );
    return res.json({
      ...plan,
      aiEnhanced: Boolean(aiEnhanced),
      aiAvailable: Boolean(aiAvailable),
      aiSkipped: Boolean(skipped),
      aiError: error || null,
    });
  }

  res.json({
    ...basePlan,
    aiEnhanced: false,
    aiAvailable: isAiConfigured(),
  });
});

export default router;
