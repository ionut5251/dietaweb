import { calculateBMR, calculateTDEE, calculateTargets } from './services/nutritionCalculator.js';
import { generateDietPlan } from './services/dietPlanGenerator.js';
import { generateExercisePlan } from './services/exercisePlanGenerator.js';
import { validatePlanInput } from './utils/validateInput.js';

const AVISO_LEGAL =
  'Plan orientativo generado automáticamente. No sustituye consejo médico, nutricional ni de un entrenador presencial.';

export function buildFullPlan(body) {
  const validation = validatePlanInput(body);
  if (!validation.ok) {
    return { ok: false, error: 'Datos inválidos', detalles: validation.errors };
  }

  const input = validation.data;
  const bmr = Math.round(calculateBMR(input));
  const tdee = calculateTDEE(bmr, input.nivelActividad);
  const targets = calculateTargets({
    pesoKg: input.pesoKg,
    tdee,
    objetivo: input.objetivo,
  });

  const dieta = generateDietPlan(input, targets);
  const ejercicio = generateExercisePlan(input);

  if (input.restriccionesAlimentarias) {
    dieta.reglasGenerales.push(
      `Tus restricciones indicadas: «${input.restriccionesAlimentarias}». Adapta proteínas y carbohidratos sustituyendo alimentos equivalentes.`,
    );
  }
  if (input.lesionesLimitaciones) {
    ejercicio.principios.push(
      `Limitaciones que indicaste: «${input.lesionesLimitaciones}». Sustituye ejercicios que molesten por variantes sin dolor.`,
    );
  }

  return {
    ok: true,
    perfil: { bmr, tdee, ...targets },
    datosUsuario: input,
    planDieta: dieta,
    planEjercicio: ejercicio,
    avisoLegal: AVISO_LEGAL,
  };
}
