/**
 * Prompts para IA — dietista/entrenador profesional.
 * Claude (Anthropic) para rutinas de ejercicio.
 * OpenAI para planes de dieta.
 */

export const CLAUDE_MODEL = 'claude-sonnet-4-5';

export const AI_MODELS = {
  text: 'gpt-4o-mini',
  vision: 'gpt-4o',
};

export function getEnhanceMaxTokens(basePlan) {
  return basePlan.planEjercicio ? 7500 : 2500;
}

// ─── SPLITS RECOMENDADOS POR DÍAS ───────────────────────────────────────────
function getSplitGuide(dias) {
  const guia = {
    2: `2 días: Cuerpo completo x2 (Full Body A/B). Ejercicios compuestos prioritarios, al menos 5 por sesión.`,
    3: `3 días: PPL — Día 1 EMPUJE (Pecho+Hombro+Tríceps), Día 2 TIRÓN (Espalda+Bíceps+Femorales), Día 3 PIERNAS (Cuádriceps+Glúteo+Gemelos+Core).`,
    4: `4 días: Push/Pull/Legs/Upper — Día 1 EMPUJE, Día 2 PIERNAS (fuerza), Día 3 TIRÓN, Día 4 PIERNAS+CORE (metabolic/HIIT). Alternativa válida si pide más metabolismo: Pecho+Hombro+Core / Piernas+Finisher / Espalda+Bíceps / Pierna+HIIT.`,
    5: `5 días: Día 1 EMPUJE, Día 2 PIERNAS fuerza, Día 3 TIRÓN, Día 4 HOMBROS+BRAZOS+Core, Día 5 PIERNAS metabolic+HIIT. Ajusta según lo que pide el cliente.`,
    6: `6 días: PPL/PPL — dos vueltas a Push/Pull/Legs con volumen moderado por sesión y un día de recuperación activa.`,
  };
  return guia[dias] || guia[4];
}

// ─── PROMPT CLAUDE — RUTINAS DE GIMNASIO ────────────────────────────────────
export function buildClaudeWorkoutPrompt(input) {
  const cliente = {
    sexo: input.sexo,
    edad: input.edad,
    pesoKg: input.pesoKg,
    alturaCm: input.alturaCm,
    objetivo: input.objetivo,
    nivelActividad: input.nivelActividad,
    experiencia: input.experiencia || 'intermedio',
    diasEntreno: input.diasEntrenoSemana,
    queBuscaMejorar: input.queBuscaMejorar || '',
    lesiones: input.lesionesLimitaciones || '',
  };

  const splitGuide = getSplitGuide(cliente.diasEntreno);

  const system = `Eres un entrenador personal de élite que diseña rutinas de gimnasio con el rigor y estilo de Sergio Peinado (España) y Chuy Almada (México).

FILOSOFÍA:
- Rutinas COMPLETAS y REALES. Nada genérico. Volumen profesional.
- Cada sesión tiene ejercicios concretos con series, repeticiones, descansos y nota técnica breve.
- Formato de ejercicio: "Press banca → 4×8-10 (subida explosiva, pausa en pecho)"
- Bloques bien definidos: Principal / Core / Cardio o Finisher según el día.
- Los splits cuadran con los días de la semana y el objetivo del cliente.
- Adapta si hay lesiones o limitaciones.
- Progresión de semanas: semana 1 base, semana 2 +1 serie o +peso, semana 3 técnicas avanzadas (drop sets, superseries), semana 4 descarga o intensidad máxima.
- Responde ÚNICAMENTE JSON válido. Sin texto fuera del JSON.`;

  const user = `CLIENTE:
${JSON.stringify(cliente, null, 2)}

GUÍA DE SPLIT PARA ${cliente.diasEntreno} DÍAS:
${splitGuide}

INSTRUCCIONES:
1. Analiza "queBuscaMejorar" y personaliza: si pide fuerza en piernas dale más volumen de pierna; si pide metabolismo añade finishers HIIT; si pide volumen de pecho más series de press; etc.
2. Genera sesionesCompletas para TODAS las semanas (1 a 4) con progresión real.
3. Mínimo 6 ejercicios en el bloque Principal de cada sesión, hasta 9-10 en días de grupo muscular grande.
4. Bloques Core y Cardio/Finisher donde corresponda (días de piernas, días de empuje si el cliente lo pide).
5. Descansos específicos: fuerza 90-180s, hipertrofia 60-90s, metabólico/circuito 30-45s.
6. Usa ejercicios que se hacen en gimnasio estándar (con maquinaria habitual, mancuernas, barra, polea, TRX).

ESTRUCTURA JSON OBLIGATORIA:
{
  "split": "nombre del split elegido (ej: PPL, Push/Pull/Legs/Upper, etc.)",
  "filosofiaSemanas": "1-2 frases sobre la progresión de las 4 semanas",
  "sesionesCompletas": [
    {
      "semana": 1,
      "indiceSesion": 0,
      "titulo": "DÍA 1 – EMPUJE · Pecho + Hombro + Tríceps",
      "notaEntrenador": "consejo clave de esta sesión",
      "bloques": [
        {
          "nombre": "Principal",
          "ejercicios": [
            {
              "nombre": "Press banca con barra",
              "series": "4",
              "repeticiones": "8-10",
              "descanso": "90-120 s",
              "como": "Subida explosiva, bajada controlada 3 s",
              "enfoque": "Pecho",
              "registrarPeso": true
            }
          ]
        },
        {
          "nombre": "Core",
          "ejercicios": []
        }
      ]
    }
  ]
}

REGLAS FINALES:
- sesionesCompletas debe tener ${cliente.diasEntreno * 4} entradas en total (${cliente.diasEntreno} sesiones × 4 semanas).
- Los índices van de 0 a ${cliente.diasEntreno - 1} dentro de cada semana.
- Semana 1: volumen base. Semana 2: +intensidad. Semana 3: técnicas avanzadas. Semana 4: pico o descarga.
- Si hay lesiones: adapta o elimina los ejercicios que las afecten.
- Solo JSON. Sin texto fuera del JSON.`;

  return { system, user };
}

// ─── PROMPT OPENAI — DIETA ───────────────────────────────────────────────────
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
  };

  return `Eres dietista-nutricionista de élite en España. Tu cliente quiere un plan de dieta personalizado.

CLIENTE:
${JSON.stringify(cliente, null, 2)}

REGLAS:
1. Adapta macros y calorías al objetivo (déficit, superávit, mantenimiento).
2. Respeta restricciones alimentarias al 100%.
3. Consejos prácticos, directos, sin relleno.
4. Solo JSON válido en español.

ESTRUCTURA JSON:
{
  "interpretacionProfesional": "2-3 frases sobre estrategia nutricional",
  "enfoquePrincipal": "etiqueta corta (ej: Déficit moderado + alto proteíco)",
  "dieta": {
    "reglasAdicionales": ["hasta 6 reglas específicas"],
    "notaMacros": "distribución de macros orientativa o null",
    "consejosSemanales": ["hasta 4 consejos prácticos"]
  },
  "ejercicio": {
    "principiosAdicionales": [],
    "cardioRecomendacion": "",
    "sesionesCompletas": []
  }
}`;
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
  "zonasATrabajar": ["zonas a seguir trabajando"],
  "recomendaciones": ["3-5 acciones concretas dieta/entreno"],
  "mensajeMotivacional": "1 frase breve",
  "aviso": "Esta valoración es orientativa y no sustituye evaluación médica."
}`;
}
