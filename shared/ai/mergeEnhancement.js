/**
 * Fusiona la respuesta de OpenAI con el plan base (seguro ante JSON parcial o erróneo).
 */

export function mergeAiEnhancement(basePlan, ai, input) {
  if (!ai || typeof ai !== 'object') return { ...basePlan, aiEnhanced: false };

  const result =
    typeof structuredClone === 'function'
      ? structuredClone(basePlan)
      : JSON.parse(JSON.stringify(basePlan));
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

  if (!Array.isArray(aiEjercicio.modificacionesSesion)) return;

  for (const mod of aiEjercicio.modificacionesSesion) {
    const semana = planEjercicio.semanas?.find((s) => s.numero === mod.semana);
    const sesion = semana?.sesiones?.[mod.indiceSesion];
    if (!sesion) continue;

    if (mod.notaEntrenador) {
      sesion.notaEntrenador = mod.notaEntrenador;
    }

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
