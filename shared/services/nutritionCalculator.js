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

export function calculateTargets({ pesoKg, tdee, objetivo }) {
  const goal = GOALS[objetivo] ?? GOALS.mantener;
  const calorias = Math.round(tdee * (1 + goal.calorieAdjust));
  const proteinasG = Math.round(pesoKg * goal.proteinPerKg);
  const proteinasKcal = proteinasG * 4;
  const grasasKcal = Math.round(calorias * 0.25);
  const grasasG = Math.round(grasasKcal / 9);
  const carbohidratosKcal = calorias - proteinasKcal - grasasKcal;
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
