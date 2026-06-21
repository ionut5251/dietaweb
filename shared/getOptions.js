import { ACTIVITY_FACTORS, GOALS, LIMITS, PLAN_MODES, TIEMPO_SESION } from './config/constants.js';

export function getOptions() {
  return {
    modos: Object.values(PLAN_MODES).map(({ id, label }) => ({ id, label })),
    actividad: Object.entries(ACTIVITY_FACTORS).map(([id, v]) => ({ id, label: v.label })),
    objetivos: Object.entries(GOALS).map(([id, v]) => ({ id, label: v.label })),
    experiencia: [
      { id: 'principiante', label: 'Principiante (menos de 6 meses)' },
      { id: 'intermedio', label: 'Intermedio (6 meses - 2 años)' },
      { id: 'avanzado', label: 'Avanzado (más de 2 años)' },
    ],
    tiempoSesion: Object.values(TIEMPO_SESION).map(({ minutos, label }) => ({
      id: String(minutos),
      label,
    })),
    limites: LIMITS,
  };
}
