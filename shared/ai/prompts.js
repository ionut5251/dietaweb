/**
 * Prompts para OpenAI (GPT-4o / GPT-4o-mini).
 * Respuestas en JSON estricto para fusionar con el plan base generado por reglas.
 */

export function buildEnhancePlanPrompt(input, basePlan) {
  const resumen = {
    modo: input.modo,
    sexo: input.sexo,
    edad: input.edad,
    pesoKg: input.pesoKg,
    alturaCm: input.alturaCm,
    objetivo: input.objetivo,
    actividad: input.nivelActividad,
    diasEntreno: input.diasEntrenoSemana,
    comidasPorDia: input.comidasPorDia,
    queBuscaMejorar: input.queBuscaMejorar,
    restricciones: input.restriccionesAlimentarias,
    lesiones: input.lesionesLimitaciones,
    experiencia: input.experiencia,
  };

  const dietaResumen = basePlan.planDieta
    ? {
        calorias: basePlan.perfil?.calorias,
        macros: basePlan.planDieta.resumen?.macros,
        reglasActuales: basePlan.planDieta.reglasGenerales?.slice(0, 5),
        ejemploDia1: basePlan.planDieta.planMensual?.semanas?.[0]?.dias?.[0]?.comidas?.map((c) => c.plato),
      }
    : null;

  const ejercicioResumen = basePlan.planEjercicio
    ? {
        diasSemana: basePlan.planEjercicio.resumen?.diasPorSemana,
        semana1Sesiones: basePlan.planEjercicio.semanas?.[0]?.sesiones?.map((s) => ({
          dia: s.dia,
          enfoque: s.enfoque,
          ejercicios: s.ejercicios?.map((e) => e.nombre),
        })),
      }
    : null;

  return `Eres un dietista-nutricionista y entrenador personal colegiado. Adapta el plan BASE a las necesidades específicas del cliente.

DATOS CLIENTE:
${JSON.stringify(resumen, null, 2)}

PLAN BASE (generado automáticamente — debes REFINARLO, no reescribirlo entero):
${JSON.stringify({ dieta: dietaResumen, ejercicio: ejercicioResumen }, null, 2)}

INSTRUCCIONES:
1. Interpreta «qué buscas mejorar» como un profesional (fútbol, glúteos, recomposición, etc.).
2. Dieta: añade reglas prácticas, timing nutricional si hay deporte, consejos específicos por sexo/objetivo.
3. Ejercicio: sugiere sustituciones concretas de ejercicios en sesiones concretas (índices 0-based) y ejercicios extra si procede.
4. Tono claro para cualquier persona, en español de España.
5. NO inventes enfermedades ni diagnósticos médicos. Aviso: orientativo.
6. Responde SOLO JSON válido con esta estructura exacta:

{
  "interpretacionProfesional": "2-4 frases resumiendo lo que entendiste y la estrategia",
  "enfoquePrincipal": "etiqueta corta ej. Fútbol + piernas",
  "dieta": {
    "reglasAdicionales": ["máx 6 reglas nuevas específicas"],
    "notaMacros": "1 frase sobre calorías/macros si aplica",
    "consejosSemanales": ["máx 4 consejos rotativos"]
  },
  "ejercicio": {
    "principiosAdicionales": ["máx 5 principios de entrenador"],
    "modificacionesSesion": [
      {
        "semana": 1,
        "indiceSesion": 0,
        "notaEntrenador": "consejo para esa sesión",
        "ejerciciosSustitutos": [
          { "indiceEjercicio": 0, "nombre": "nombre", "como": "técnica breve", "motivo": "por qué" }
        ],
        "ejerciciosExtra": [
          { "nombre": "nombre", "como": "técnica", "series": "3", "repeticiones": "10-12", "enfoque": "músculo" }
        ]
      }
    ],
    "cardioRecomendacion": "1-2 frases"
  }
}

Si no hay plan de dieta, deja "dieta" con arrays vacíos y notaMacros null.
Si no hay plan de ejercicio, deja "ejercicio" con arrays vacíos.`;
}

export function buildPhotoAnalysisPrompt(context) {
  return `Eres un entrenador personal experto en valoración visual de progreso corporal (NO médico).

CONTEXTO CLIENTE:
${JSON.stringify(context, null, 2)}

Analiza la foto adjunta comparando con el objetivo y semanas de entrenamiento si se indican.

Responde SOLO JSON:
{
  "observaciones": ["2-5 observaciones concretas y respetuosas"],
  "progresoDetectado": "positivo|neutro|a_mejorar",
  "zonasDestacadas": ["zonas donde se nota mejora"],
  "zonasATrabajar": ["zonas a seguir trabajando, ej. abdomen inferior"],
  "recomendaciones": ["3-5 acciones concretas dieta/entreno"],
  "mensajeMotivacional": "1 frase breve",
  "aviso": "Esta valoración es orientativa y no sustituye evaluación médica."
}

Sé específico pero prudente. Si la imagen no permite valorar, dilo en observaciones.`;
}

export const AI_MODELS = {
  text: 'gpt-4o-mini',
  vision: 'gpt-4o',
};
