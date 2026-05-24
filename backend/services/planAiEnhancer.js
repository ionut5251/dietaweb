import { mergeAiEnhancement } from '../../shared/ai/mergeEnhancement.js';
import { enhancePlanWithOpenAI, isAiConfigured } from './openaiService.js';

export { isAiConfigured };

export async function enhancePlanIfAvailable(input, basePlan) {
  if (!isAiConfigured()) {
    return { plan: basePlan, aiEnhanced: false, aiAvailable: false };
  }

  const hasPersonalization =
    (input.queBuscaMejorar && input.queBuscaMejorar.length > 3) ||
    input.restriccionesAlimentarias ||
    input.lesionesLimitaciones;

  if (!hasPersonalization) {
    return { plan: basePlan, aiEnhanced: false, aiAvailable: true, skipped: true };
  }

  try {
    const aiJson = await enhancePlanWithOpenAI(input, basePlan);
    if (!aiJson) {
      return { plan: basePlan, aiEnhanced: false, aiAvailable: true, error: 'Respuesta IA inválida' };
    }
    const plan = mergeAiEnhancement(basePlan, aiJson, input);
    return { plan, aiEnhanced: true, aiAvailable: true };
  } catch (err) {
    console.error('[AI]', err.message);
    return { plan: basePlan, aiEnhanced: false, aiAvailable: true, error: err.message };
  }
}
