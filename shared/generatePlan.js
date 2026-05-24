import { calculateBMR, calculateTDEE, calculateTargets } from './services/nutritionCalculator.js';
import { generateDietPlan } from './services/dietPlanGenerator.js';
import { generateExercisePlan } from './services/exercisePlanGenerator.js';
import { validatePlanInput } from './utils/validateInput.js';
import { PLAN_MODES } from './config/constants.js';

const AVISO_LEGAL =
  'Plan orientativo generado automáticamente. No sustituye consejo médico, nutricional ni de un entrenador presencial.';

export function buildFullPlan(body) {
  const validation = validatePlanInput(body);
  if (!validation.ok) {
    return { ok: false, error: 'Datos inválidos', detalles: validation.errors };
  }

  const input = validation.data;
  const modo = input.modo;
  const modeConfig = PLAN_MODES[modo];
  const bmr = Math.round(calculateBMR(input));
  const tdee = calculateTDEE(bmr, input.nivelActividad);

  let perfil = null;
  let planDieta = null;
  let planEjercicio = null;

  if (modeConfig.includesDieta) {
    const targets = calculateTargets({
      pesoKg: input.pesoKg,
      tdee,
      objetivo: input.objetivo,
      personalizacion: input.personalizacion,
    });
    perfil = { bmr, tdee, ...targets };
    planDieta = generateDietPlan(input, targets);

    if (input.restriccionesAlimentarias) {
      planDieta.reglasGenerales.push(
        `Tus restricciones indicadas: «${input.restriccionesAlimentarias}». Adapta proteínas y carbohidratos sustituyendo alimentos equivalentes.`,
      );
    }
  }

  if (modeConfig.includesEjercicio) {
    planEjercicio = generateExercisePlan(input);

    if (input.lesionesLimitaciones) {
      planEjercicio.principios.push(
        `Limitaciones que indicaste: «${input.lesionesLimitaciones}». Sustituye ejercicios que molesten por variantes sin dolor.`,
      );
    }
  }

  return {
    ok: true,
    modo,
    modoLabel: modeConfig.label,
    personalizacion: input.personalizacion,
    perfil,
    datosUsuario: input,
    planDieta,
    planEjercicio,
    avisoLegal: AVISO_LEGAL,
  };
}
