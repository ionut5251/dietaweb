/**
 * Prompts para OpenAI — estilo entrenador/dietista profesional.
 */

export function buildEnhancePlanPrompt(input, basePlan) {
  const cliente = {
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
    intensityProfile: input.intensityProfile,
  };

  const esquemaSemana = basePlan.planEjercicio?.semanas?.[0]?.sesiones?.map((s, i) => ({
    indiceSesion: i,
    dia: s.dia,
    enfoque: s.enfoque,
    ejerciciosActuales: s.ejercicios?.slice(0, 8).map((e) => e.nombre),
    tieneBloques: Boolean(s.bloques?.length),
  }));

  return `Eres un entrenador personal de élite y dietista-nutricionista (estilo profesional español, directo, sin humo).
Tu cliente quiere una rutina BUENA — no genérica. Volumen real, series×reps concretas, bloques (Principal / Core / Cardio / Finisher / HIIT).

CLIENTE:
${JSON.stringify(cliente, null, 2)}

ESQUEMA SEMANAL ACTUAL (sem. 1):
${JSON.stringify(esquemaSemana, null, 2)}

REGLAS CRÍTICAS:
1. Interpreta «qué buscas mejorar» al detalle (metabólico, piernas, fútbol, influencer fitness, etc.). NO copies influencers literalmente ni prometas resultados irreales.
2. Si pide rutina avanzada/metabólica: mínimo 6-8 ejercicios en bloque Principal + bloque Core + Cardio o Finisher cuando encaje.
3. Formato profesional: "Press banca → 4×8-10 (subida explosiva)".
4. Reparte la intensidad según días/semana (${input.diasEntrenoSemana} días).
5. Dieta: reglas específicas según objetivo + texto del cliente.
6. Lesiones: adapta ejercicios si las hay.
7. Solo JSON válido en español.

ESTRUCTURA JSON OBLIGATORIA:
{
  "interpretacionProfesional": "3-5 frases: estrategia como entrenador",
  "enfoquePrincipal": "etiqueta corta",
  "dieta": {
    "reglasAdicionales": ["hasta 6"],
    "notaMacros": "string o null",
    "consejosSemanales": ["hasta 4"]
  },
  "ejercicio": {
    "principiosAdicionales": ["hasta 5"],
    "cardioRecomendacion": "string",
    "sesionesCompletas": [
      {
        "semana": 1,
        "indiceSesion": 0,
        "titulo": "LUNES – PECHO + HOMBRO + CORE",
        "notaEntrenador": "consejo de sesión",
        "bloques": [
          {
            "nombre": "Principal",
            "ejercicios": [
              {
                "nombre": "Press banca",
                "series": "4",
                "repeticiones": "8-10",
                "descanso": "90-120 s",
                "como": "subida explosiva controlada",
                "enfoque": "Pecho",
                "registrarPeso": true
              }
            ]
          },
          {
            "nombre": "Core",
            "ejercicios": []
          },
          {
            "nombre": "Cardio",
            "ejercicios": [
              {
                "nombre": "Cinta inclinada",
                "series": "1",
                "repeticiones": "15-20 min",
                "descanso": "—",
                "como": "8-12% inclinación",
                "enfoque": "Cardio",
                "registrarPeso": false
              }
            ]
          }
        ]
      }
    ]
  }
}

IMPORTANTE: sesionesCompletas debe incluir UNA entrada por cada sesión de la semana 1 (${input.diasEntrenoSemana} sesiones, indices 0 a ${input.diasEntrenoSemana - 1}).
Si no hay plan de dieta, dieta con arrays vacíos. Si no hay ejercicio, ejercicio vacío.`;
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
}`;
}

export const AI_MODELS = {
  text: 'gpt-4o-mini',
  vision: 'gpt-4o',
};

export function getEnhanceMaxTokens(basePlan) {
  return basePlan.planEjercicio ? 7500 : 2500;
}
