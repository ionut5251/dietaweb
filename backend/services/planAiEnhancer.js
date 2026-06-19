/**
 * Orquesta la mejora con IA:
 * - Claude (Anthropic) → rutinas de ejercicio completas y profesionales
 * - OpenAI → personalización de dieta
 * Si solo está disponible uno, ese se usa para ambas partes.
 */
import { mergeAiEnhancement, mergeClaudeWorkout, humanizeAiError } from '../../shared/ai/mergeEnhancement.js';
import { generateWorkoutWithClaude, isClaudeConfigured } from './claudeService.js';
import { enhancePlanWithOpenAI, isAiConfigured as isOpenAiConfigured } from './openaiService.js';

export { isClaudeConfigured, isOpenAiConfigured };

export function isAiConfigured() {
  return isClaudeConfigured() || isOpenAiConfigured();
}

export async function enhancePlanIfAvailable(input, basePlan) {
  const claudeOk = isClaudeConfigured();
  const openaiOk = isOpenAiConfigured();

  if (!claudeOk && !openaiOk) {
    return { plan: basePlan, aiEnhanced: false, aiAvailable: false };
  }

  const needsExercise =
    input.modo === 'ejercicio' || input.modo === 'completo';
  const needsDiet =
    input.modo === 'dieta' || input.modo === 'completo';

  let plan = basePlan;
  let aiEnhanced = false;
  const errors = [];

  // ── 1. EJERCICIO con Claude ──────────────────────────────────────────────
  if (needsExercise && claudeOk) {
    try {
      const workoutJson = await generateWorkoutWithClaude(input);
      if (workoutJson?.sesionesCompletas?.length) {
        plan = mergeClaudeWorkout(plan, workoutJson, input);
        aiEnhanced = true;
      } else {
        errors.push('Claude devolvió respuesta vacía o inválida para el ejercicio');
      }
    } catch (err) {
      const friendly = humanizeAiError(err.message, 'claude');
      console.error('[Claude]', friendly);
      errors.push(friendly);
    }
  }

  // ── 2. DIETA con OpenAI ──────────────────────────────────────────────────
  if (needsDiet && openaiOk) {
    try {
      const dietJson = await enhancePlanWithOpenAI(input, plan);
      if (dietJson) {
        plan = mergeAiEnhancement(plan, dietJson, input);
        aiEnhanced = true;
      }
    } catch (err) {
      const friendly = humanizeAiError(err.message, 'openai');
      console.error('[OpenAI]', friendly);
      errors.push(friendly);
    }
  }

  // ── 3. Fallback: si no hay Claude pero sí OpenAI, usarlo para ejercicio también
  if (needsExercise && !claudeOk && openaiOk && !aiEnhanced) {
    try {
      const aiJson = await enhancePlanWithOpenAI(input, plan);
      if (aiJson) {
        plan = mergeAiEnhancement(plan, aiJson, input);
        aiEnhanced = true;
      }
    } catch (err) {
      const friendly = humanizeAiError(err.message, 'openai');
      console.error('[OpenAI fallback]', friendly);
      errors.push(friendly);
    }
  }

  return {
    plan,
    aiEnhanced,
    aiAvailable: true,
    error: errors.length ? errors[0] : undefined,
  };
}
