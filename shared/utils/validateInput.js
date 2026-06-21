import { ACTIVITY_FACTORS, GOALS, LIMITS, PLAN_MODES, TIEMPO_SESION } from '../config/constants.js';
import { parsePersonalization } from '../services/personalizationEngine.js';
import { applyIntensityToInput } from '../services/advancedWorkoutTemplates.js';

const EXPERIENCE = ['principiante', 'intermedio', 'avanzado'];
const MODES = Object.keys(PLAN_MODES);

export function validatePlanInput(body) {
  const errors = [];
  const modo = body.modo || 'completo';

  if (!MODES.includes(modo)) {
    errors.push('Modo de plan no válido.');
  }

  const includesDieta = modo === 'dieta' || modo === 'completo';
  const includesEjercicio = modo === 'ejercicio' || modo === 'completo';

  const peso = Number(body.pesoKg);
  const edad = Number(body.edad);
  const altura = Number(body.alturaCm);
  const dias = Number(body.diasEntrenoSemana);
  const comidas = body.comidasPorDia != null && body.comidasPorDia !== ''
    ? Number(body.comidasPorDia)
    : null;

  if (!body.sexo || !['hombre', 'mujer'].includes(body.sexo)) {
    errors.push('Selecciona sexo (hombre o mujer).');
  }
  if (Number.isNaN(peso) || peso < LIMITS.pesoMin || peso > LIMITS.pesoMax) {
    errors.push(`Peso entre ${LIMITS.pesoMin} y ${LIMITS.pesoMax} kg.`);
  }
  if (Number.isNaN(edad) || edad < LIMITS.edadMin || edad > LIMITS.edadMax) {
    errors.push(`Edad entre ${LIMITS.edadMin} y ${LIMITS.edadMax} años.`);
  }
  if (Number.isNaN(altura) || altura < LIMITS.alturaMin || altura > LIMITS.alturaMax) {
    errors.push(`Altura entre ${LIMITS.alturaMin} y ${LIMITS.alturaMax} cm.`);
  }
  if (!body.nivelActividad || !ACTIVITY_FACTORS[body.nivelActividad]) {
    errors.push('Nivel de actividad no válido.');
  }
  if (!body.objetivo || !GOALS[body.objetivo]) {
    errors.push('Objetivo no válido.');
  }

  if (includesEjercicio) {
    const exp = body.experiencia || 'intermedio';
    if (!EXPERIENCE.includes(exp)) {
      errors.push('Nivel de experiencia en entrenamiento no válido.');
    }
  }

  if (Number.isNaN(dias) || dias < LIMITS.diasMin || dias > LIMITS.diasMax) {
    errors.push(`Días de entreno: entre ${LIMITS.diasMin} y ${LIMITS.diasMax} por semana.`);
  }

  if (includesDieta) {
    if (Number.isNaN(comidas) || comidas < LIMITS.comidasMin || comidas > LIMITS.comidasMax) {
      errors.push(`Comidas al día: entre ${LIMITS.comidasMin} y ${LIMITS.comidasMax}.`);
    }
  }

  const queBuscaMejorar = (body.queBuscaMejorar || '').trim();
  if (queBuscaMejorar.length > LIMITS.queBuscaMejorarMax) {
    errors.push(`«Qué buscas mejorar» máximo ${LIMITS.queBuscaMejorarMax} caracteres.`);
  }

  // tiempoSesion es opcional; si se envía debe ser un valor válido
  const tiempoSesion = body.tiempoSesion ? Number(body.tiempoSesion) : 60;
  if (!LIMITS.tiempoSesionValidos.includes(tiempoSesion)) {
    errors.push('Tiempo de sesión no válido.');
  }

  if (body.restriccionesAlimentarias && typeof body.restriccionesAlimentarias !== 'string') {
    errors.push('Restricciones alimentarias debe ser texto.');
  }
  if (body.lesionesLimitaciones && typeof body.lesionesLimitaciones !== 'string') {
    errors.push('Lesiones o limitaciones debe ser texto.');
  }

  if (errors.length) return { ok: false, errors };

  const personalizacion = parsePersonalization(queBuscaMejorar, body.sexo);

  const baseData = {
      modo,
      sexo: body.sexo,
      pesoKg: peso,
      edad,
      alturaCm: altura,
      nivelActividad: body.nivelActividad,
      objetivo: body.objetivo,
      experiencia: includesEjercicio ? (body.experiencia || 'intermedio') : null,
      diasEntrenoSemana: dias,
      comidasPorDia: includesDieta ? comidas : null,
      queBuscaMejorar,
      personalizacion,
      restriccionesAlimentarias: includesDieta ? (body.restriccionesAlimentarias || '').trim() : '',
      lesionesLimitaciones: includesEjercicio ? (body.lesionesLimitaciones || '').trim() : '',
      tiempoSesion,
    };

  const data = includesEjercicio
    ? applyIntensityToInput({ ...baseData, experiencia: baseData.experiencia || 'intermedio' })
    : { ...baseData, intensityProfile: 'estandar' };

  return {
    ok: true,
    data,
  };
}
