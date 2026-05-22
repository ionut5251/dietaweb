import { ACTIVITY_FACTORS, GOALS, LIMITS } from '../config/constants.js';

const EXPERIENCE = ['principiante', 'intermedio', 'avanzado'];

export function validatePlanInput(body) {
  const errors = [];

  const peso = Number(body.pesoKg);
  const edad = Number(body.edad);
  const altura = Number(body.alturaCm);
  const dias = Number(body.diasEntrenoSemana);
  const comidas = Number(body.comidasPorDia);

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
  if (!body.experiencia || !EXPERIENCE.includes(body.experiencia)) {
    errors.push('Nivel de experiencia en entrenamiento no válido.');
  }
  if (Number.isNaN(dias) || dias < LIMITS.diasMin || dias > LIMITS.diasMax) {
    errors.push(`Días de entreno: entre ${LIMITS.diasMin} y ${LIMITS.diasMax} por semana.`);
  }
  if (Number.isNaN(comidas) || comidas < LIMITS.comidasMin || comidas > LIMITS.comidasMax) {
    errors.push(`Comidas al día: entre ${LIMITS.comidasMin} y ${LIMITS.comidasMax}.`);
  }

  if (body.restriccionesAlimentarias && typeof body.restriccionesAlimentarias !== 'string') {
    errors.push('Restricciones alimentarias debe ser texto.');
  }

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      sexo: body.sexo,
      pesoKg: peso,
      edad,
      alturaCm: altura,
      nivelActividad: body.nivelActividad,
      objetivo: body.objetivo,
      experiencia: body.experiencia,
      diasEntrenoSemana: dias,
      comidasPorDia: comidas,
      restriccionesAlimentarias: (body.restriccionesAlimentarias || '').trim(),
      lesionesLimitaciones: (body.lesionesLimitaciones || '').trim(),
    },
  };
}
