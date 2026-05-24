/**
 * Fusiona la respuesta de OpenAI con el plan base (seguro ante JSON parcial o erróneo).
 */

function clone(obj) {
  return typeof structuredClone === 'function'
    ? structuredClone(obj)
    : JSON.parse(JSON.stringify(obj));
}

export function mergeAiEnhancement(basePlan, ai, input) {
  if (!ai || typeof ai !== 'object') return { ...basePlan, aiEnhanced: false };

  const result = clone(basePlan);
  result.aiEnhanced = true;
  result.aiInterpretacion = ai.interpretacionProfesional || null;

  if (result.personalizacion && ai.enfoquePrincipal) {
    result.personalizacion = {
      ...result.personalizacion,
      label: ai.enfoquePrincipal,
      interpretacion: ai.interpretacionProfesional || result.personalizacion.interpretacion,
      detectado: true,
    };
  }

  if (result.planDieta && ai.dieta) {
    mergeDiet(result.planDieta, ai.dieta);
  }

  if (result.planEjercicio && ai.ejercicio) {
    mergeExercise(result.planEjercicio, ai.ejercicio);
  }

  return result;
}

function mergeDiet(planDieta, aiDieta) {
  if (!aiDieta) return;

  if (Array.isArray(aiDieta.reglasAdicionales)) {
    planDieta.reglasGenerales.push(
      '—— Ajustes del profesional (IA) ——',
      ...aiDieta.reglasAdicionales.filter(Boolean),
    );
  }
  if (aiDieta.notaMacros) {
    planDieta.resumen.notaMacrosProfesional = aiDieta.notaMacros;
  }
  if (Array.isArray(aiDieta.consejosSemanales) && aiDieta.consejosSemanales.length) {
    planDieta.consejosSemanalesProfesional = aiDieta.consejosSemanales;
  }
}

function mapAiExercise(e, sessionIdx, bloqueIdx, ejIdx, bloqueNombre) {
  return {
    id: `ai-s${sessionIdx}-b${bloqueIdx}-e${ejIdx}`,
    enfoque: e.enfoque || 'General',
    nombre: e.nombre,
    como: e.como || '',
    notas: e.motivo || 'Recomendación IA',
    series: String(e.series || '3'),
    repeticiones: e.repeticiones || '10-12',
    descanso: e.descanso || '90 s',
    varianteUsada: 'IA profesional',
    registrarPeso: e.registrarPeso !== false,
    bloque: bloqueNombre,
    ajustadoPorIA: true,
  };
}

function applySesionCompleta(sesion, mod, sessionIdx) {
  if (mod.titulo) sesion.dia = mod.titulo;
  if (mod.notaEntrenador) sesion.notaEntrenador = mod.notaEntrenador;

  if (Array.isArray(mod.bloques) && mod.bloques.length) {
    sesion.bloques = mod.bloques.map((b, bi) => ({
      nombre: b.nombre,
      ejercicios: (b.ejercicios || []).map((e, ei) =>
        mapAiExercise(e, sessionIdx, bi, ei, b.nombre),
      ),
    }));
    sesion.ejercicios = sesion.bloques.flatMap((b) => b.ejercicios);
    sesion.esAvanzada = true;
    sesion.duracionEstimada = '60-75 min';
    return;
  }

  if (Array.isArray(mod.ejercicios) && mod.ejercicios.length) {
    sesion.ejercicios = mod.ejercicios.map((e, ei) =>
      mapAiExercise(e, sessionIdx, 0, ei, 'Principal'),
    );
  }
}

function mergeExercise(planEjercicio, aiEjercicio) {
  if (!aiEjercicio) return;

  if (Array.isArray(aiEjercicio.principiosAdicionales)) {
    planEjercicio.principios.push(
      '—— Consejos del entrenador (IA) ——',
      ...aiEjercicio.principiosAdicionales.filter(Boolean),
    );
  }

  if (aiEjercicio.cardioRecomendacion) {
    planEjercicio.resumen.cardioExtra = aiEjercicio.cardioRecomendacion;
  }

  if (Array.isArray(aiEjercicio.sesionesCompletas)) {
    for (const mod of aiEjercicio.sesionesCompletas) {
      const semana = planEjercicio.semanas?.find((s) => s.numero === (mod.semana || 1));
      const sesion = semana?.sesiones?.[mod.indiceSesion];
      if (sesion) applySesionCompleta(sesion, mod, mod.indiceSesion);
    }
    planEjercicio.resumen.refinadoPorIA = true;
    return;
  }

  if (!Array.isArray(aiEjercicio.modificacionesSesion)) return;

  for (const mod of aiEjercicio.modificacionesSesion) {
    const semana = planEjercicio.semanas?.find((s) => s.numero === mod.semana);
    const sesion = semana?.sesiones?.[mod.indiceSesion];
    if (!sesion) continue;

    if (mod.notaEntrenador) sesion.notaEntrenador = mod.notaEntrenador;

    if (Array.isArray(mod.ejerciciosSustitutos)) {
      for (const sub of mod.ejerciciosSustitutos) {
        const ej = sesion.ejercicios?.[sub.indiceEjercicio];
        if (!ej || !sub.nombre) continue;
        ej.nombre = sub.nombre;
        if (sub.como) ej.como = sub.como;
        if (sub.motivo) ej.notas = (ej.notas ? ej.notas + ' · ' : '') + sub.motivo;
        ej.ajustadoPorIA = true;
      }
    }

    if (Array.isArray(mod.ejerciciosExtra)) {
      for (const extra of mod.ejerciciosExtra) {
        if (!extra.nombre) continue;
        sesion.ejercicios.push({
          id: `ai-extra-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          enfoque: extra.enfoque || 'Complementario',
          nombre: extra.nombre,
          como: extra.como || '',
          notas: 'Añadido según tu objetivo personal',
          series: extra.series || '3',
          repeticiones: extra.repeticiones || '10-12',
          descanso: '60-90 s',
          varianteUsada: 'Recomendación IA',
          registrarPeso: true,
          ajustadoPorIA: true,
        });
      }
    }
  }
}

export function parseAiJson(raw) {
  if (!raw) return null;
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export function humanizeAiError(message) {
  if (!message) return 'Error desconocido de IA';
  if (/quota|billing|insufficient/i.test(message)) {
    return 'OpenAI sin crédito: añade saldo en platform.openai.com/settings/billing. Mientras tanto usamos la rutina avanzada automática.';
  }
  if (/rate limit/i.test(message)) return 'Demasiadas peticiones a OpenAI. Espera 1 minuto e inténtalo de nuevo.';
  return message;
}
