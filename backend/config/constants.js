/** Factores de actividad (Harris-Benedict / estándar clínico) */
export const ACTIVITY_FACTORS = {
  sedentario: { factor: 1.2, label: 'Sedentario (poco o nada de ejercicio)' },
  ligero: { factor: 1.375, label: 'Ligero (1-3 días/semana)' },
  moderado: { factor: 1.55, label: 'Moderado (3-5 días/semana)' },
  intenso: { factor: 1.725, label: 'Intenso (6-7 días/semana)' },
  muy_intenso: { factor: 1.9, label: 'Muy intenso (trabajo físico + deporte)' },
};

export const GOALS = {
  perder_grasa: { calorieAdjust: -0.15, label: 'Perder grasa', proteinPerKg: 2.0 },
  mantener: { calorieAdjust: 0, label: 'Mantener peso', proteinPerKg: 1.6 },
  ganar_musculo: { calorieAdjust: 0.1, label: 'Ganar músculo', proteinPerKg: 2.2 },
};

export const SEX = {
  hombre: 'hombre',
  mujer: 'mujer',
};

export const LIMITS = {
  diasMin: 2,
  diasMax: 7,
  comidasMin: 1,
  comidasMax: 5,
  pesoMin: 35,
  pesoMax: 250,
  edadMin: 14,
  edadMax: 90,
  alturaMin: 120,
  alturaMax: 220,
};
