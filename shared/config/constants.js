/** Modos de generación del plan */
export const PLAN_MODES = {
  dieta: { id: 'dieta', label: 'Plan de Dieta', includesDieta: true, includesEjercicio: false },
  ejercicio: { id: 'ejercicio', label: 'Rutina de Gimnasio', includesDieta: false, includesEjercicio: true },
  completo: {
    id: 'completo',
    label: 'Plan de Dieta + Rutina de Gimnasio',
    includesDieta: true,
    includesEjercicio: true,
  },
};

/** Factores de actividad (Harris-Benedict / estándar clínico) */
export const ACTIVITY_FACTORS = {
  sedentario: { factor: 1.2, label: 'Sedentario (poco o nada de ejercicio)' },
  ligero: { factor: 1.375, label: 'Ligero (1-3 días/semana)' },
  moderado: { factor: 1.55, label: 'Moderado (3-5 días/semana)' },
  intenso: { factor: 1.725, label: 'Intenso (6-7 días/semana)' },
  muy_intenso: { factor: 1.9, label: 'Muy intenso (trabajo físico + deporte)' },
};

export const GOALS = {
  perder_grasa: { calorieAdjust: -0.15, label: 'Perder grasa', proteinPerKg: 2.0, carbRatio: 0.35 },
  ganar_musculo: { calorieAdjust: 0.1, label: 'Ganar músculo', proteinPerKg: 2.2, carbRatio: 0.45 },
  ganar_fuerza: { calorieAdjust: 0.05, label: 'Ganar fuerza', proteinPerKg: 2.0, carbRatio: 0.48 },
  recomposicion_corporal: {
    calorieAdjust: -0.05,
    label: 'Recomposición corporal',
    proteinPerKg: 2.3,
    carbRatio: 0.38,
  },
};

/** Tiempo disponible por sesión de gimnasio */
export const TIEMPO_SESION = {
  30:  { minutos: 30,  label: '30 min',  slotsMax: 3, seriesMax: 3, descansoFactor: 0.5  },
  45:  { minutos: 45,  label: '45 min',  slotsMax: 4, seriesMax: 3, descansoFactor: 0.65 },
  60:  { minutos: 60,  label: '60 min',  slotsMax: 6, seriesMax: 4, descansoFactor: 0.8  },
  75:  { minutos: 75,  label: '75 min',  slotsMax: 8, seriesMax: 4, descansoFactor: 1.0  },
  90:  { minutos: 90,  label: '90 min',  slotsMax: 10, seriesMax: 5, descansoFactor: 1.0 },
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
  queBuscaMejorarMax: 500,
  tiempoSesionValidos: [30, 45, 60, 75, 90],
};
