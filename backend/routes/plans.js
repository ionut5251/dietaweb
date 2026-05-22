import { Router } from 'express';
import { getOptions } from '../../shared/getOptions.js';
import { buildFullPlan } from '../../shared/generatePlan.js';

const router = Router();

router.get('/options', (_req, res) => {
  res.json(getOptions());
});

router.post('/generate', (req, res) => {
  const result = buildFullPlan(req.body);
  if (!result.ok) {
    return res.status(400).json({ error: result.error, detalles: result.detalles });
  }
  const { ok, ...data } = result;
  res.json(data);
});

export default router;
