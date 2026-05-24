import { ACTIVITY_FACTORS, GOALS } from '../config/constants.js';

/**
 * Mifflin-St Jeor (1990) — estándar en nutrición clínica
 */
export function calculateBMR({ sexo, pesoKg, alturaCm, edad }) {
  const base = 10 * pesoKg + 6.25 * alturaCm - 5 * edad;
  return sexo === 'mujer' ? base - 161 : base + 5;
}

export function calculateTDEE(bmr, nivelActividad) {
  const factor = ACTIVITY_FACTORS[nivelActividad]?.factor ?? 1.2;
  return Math.round(bmr * factor);
}

export function calculateTargets({ pesoKg, tdee, objetivo, personalizacion }) {
  const goal = GOALS[objetivo] ?? GOALS.mantener;
  let calorieAdjust = goal.calorieAdjust;
  let proteinPerKg = goal.proteinPerKg;
  let carbRatio = goal.carbRatio ?? 0.4;

  if (personalizacion?.exerciseFocus === 'futbol' || personalizacion?.etiquetas?.includes('futbol')) {
    carbRatio = Math.min(0.48, carbRatio + 0.05);
  }
  if (personalizacion?.exerciseFocus === 'gluteos' || personalizacion?.etiquetas?.includes('gluteos')) {
    proteinPerKg = Math.max(proteinPerKg, 2.1);
  }
  if (personalizacion?.exerciseFocus === 'definicion') {
    calorieAdjust = Math.min(calorieAdjust, -0.08);
  }

  const calorias = Math.round(tdee * (1 + calorieAdjust));
  const proteinasG = Math.round(pesoKg * proteinPerKg);
  const proteinasKcal = proteinasG * 4;
  const grasasKcal = Math.round(calorias * 0.25);
  const grasasG = Math.round(grasasKcal / 9);
  let carbohidratosKcal = Math.round(calorias * carbRatio);
  carbohidratosKcal = Math.max(0, calorias - proteinasKcal - grasasKcal);
  const carbohidratosG = Math.max(0, Math.round(carbohidratosKcal / 4));

  return {
    calorias,
    proteinasG,
    carbohidratosG,
    grasasG,
    objetivoLabel: goal.label,
  };
}

export function summarizeProfile(input, targets) {
  const bmr = calculateBMR(input);
  const tdee = calculateTDEE(bmr, input.nivelActividad);
  return {
    bmr: Math.round(bmr),
    tdee,
    ...targets,
  };
}
