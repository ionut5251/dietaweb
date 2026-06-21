/**
 * Motor de personalización — interpreta el campo "Qué buscas mejorar".
 * Sin IA externa: reglas en español para detectar el tipo de entrenamiento
 * y adaptar completamente el plan.
 *
 * trainingModality determina el sistema de entrenamiento completo:
 *   'standard'     → hipertrofia/fitness general
 *   'bodybuilding' → culturismo competitivo (Mr. Olympia, IFBB, NPC)
 *   'aesthetics'   → estética / lucir bien (similar a bodybuilding, menos extremo)
 *   'endurance'    → preparación maratón / running de fondo
 *   'functional'   → HYROX / CrossFit / fitness funcional
 *   'strength'     → powerlifting / fuerza máxima
 */

const RULES = [
  // ── EVENTOS Y COMPETICIONES ESPECÍFICAS ──────────────────────────────────
  {
    id: 'maraton',
    patterns: [
      /marat[oó]n/i, /marathon/i, /running/i, /trail.?run/i,
      /\b10\s?k\b/i, /\b5\s?k\b/i, /media.?marat/i,
      /triat[lh][oó]n/i, /carrera.*fondo/i, /fondo.*carrera/i,
      /resistencia.*cardio/i, /correr.*lejos/i, /carrera.*larga/i,
    ],
    label: 'Preparación maratón / running de fondo',
    trainingModality: 'endurance',
    muscles: ['pierna', 'resistencia', 'core'],
    dietTips: [
      'Aumenta carbohidratos en días de rodaje largo: pasta, arroz o avena 2-3 h antes.',
      'Recuperación post-rodaje: proteína + fruta en los 30 min siguientes (ventana anabólica).',
      'Hidratación con sales minerales en esfuerzos superiores a 60 min.',
      'No bajes grasas por debajo del 20 % de calorías: soporte hormonal para resistencia.',
      'Si haces >3 rodajes/semana, añade 200-300 kcal en esos días.',
    ],
    exerciseFocus: 'maraton',
  },
  {
    id: 'hyrox',
    patterns: [
      /hyrox/i, /crossfit/i, /\bwod\b/i, /\bamrap\b/i, /\bemom\b/i,
      /ski.?erg/i, /sled.?push/i, /sled.?pull/i, /wall.?ball/i,
      /sandbag/i, /farmer.?carry/i, /battle.?rope/i,
      /funcional.*compet/i, /compet.*funcional/i,
      /fitness.?funcional/i, /entren.*funcional/i,
    ],
    label: 'Preparación HYROX / Fitness funcional',
    trainingModality: 'functional',
    muscles: ['general', 'pierna', 'resistencia'],
    dietTips: [
      'Alta demanda mixta (fuerza + cardio): no bajes por debajo de tu TDEE en días de entreno.',
      'Carbohidratos pre-entreno (arroz, avena) y proteína post-entreno son críticos.',
      'Creatina monohidrato 3-5 g/día mejora rendimiento en esfuerzos cortos de alta intensidad.',
      'Hidratación con electrolitos durante sesiones mixtas largas (>50 min).',
    ],
    exerciseFocus: 'hyrox',
  },
  {
    id: 'olimpia',
    patterns: [
      /olympia/i, /olimpia/i, /bodybuilding/i, /culturismo/i,
      /mr\.?\s*olympia/i, /\bnpc\b/i, /\bifbb\b/i,
      /compet.*musc/i, /musc.*compet/i, /fis.*compet/i, /compet.*fis/i,
      /subir.*escenario/i, /escenario.*concurso/i, /concurso.*fis/i,
      /ganar.*masa.*máxim/i,
    ],
    label: 'Culturismo / Físico competitivo',
    trainingModality: 'bodybuilding',
    muscles: ['general'],
    dietTips: [
      'Fase de volumen: superávit controlado de +200-300 kcal sobre TDEE.',
      'Proteína 2.0-2.4 g/kg peso corporal, distribuida en 5-6 tomas al día.',
      'Carbohidratos estratégicos: más antes y después de entreno; menos en descanso.',
      'Fase de definición: déficit moderado (-300 kcal), mantén proteína muy alta para preservar músculo.',
      'Evita déficit agresivo en volumen: limita ganancia grasa a máximo 0.3-0.5 kg/semana.',
    ],
    exerciseFocus: 'olimpia',
  },
  {
    id: 'estetica',
    patterns: [
      /lucir/i, /est[eé]tic/i, /playa/i, /veran/i, /vacac/i,
      /molde.*cuerp/i, /fis.*bonit/i, /buen.*aspec/i, /bien.*ver/i,
      /atractiv/i, /influenc/i, /instagram/i, /tiktok/i,
      /fotogénic/i, /fotogenic/i, /físico.*bonit/i,
      /parecer.*\w+.*instag/i, /cuerpo.*ten[eo]r/i,
    ],
    label: 'Estética y buen aspecto físico',
    trainingModality: 'aesthetics',
    muscles: ['general'],
    dietTips: [
      'Déficit moderado (-200-300 kcal) si tu objetivo es perder grasa manteniendo músculo.',
      'Proteína alta (1.8-2.2 g/kg): clave para la recomposición corporal.',
      'Carbohidratos principalmente en torno a entrenamientos para energía y recuperación.',
      'Evita restricciones extremas: quieres perder grasa, no perder músculo.',
    ],
    exerciseFocus: 'estetica',
  },
  {
    id: 'powerlifting',
    patterns: [
      /powerlifting/i, /fuerza.?m[aá]x/i, /\b1rm\b/i,
      /levantar.*peso/i, /fuerza.*compet/i,
      /press.*banca.*max/i, /sentadilla.*max/i, /peso.*muerto.*max/i,
      /levantamiento.*pesas/i,
    ],
    label: 'Fuerza máxima / Powerlifting',
    trainingModality: 'strength',
    muscles: ['general'],
    dietTips: [
      'Superávit moderado (+200-300 kcal) para ganar fuerza sin exceso de grasa.',
      'Proteína 2.0 g/kg mínimo; carbohidratos altos en días de entreno pesado.',
      'Creatina monohidrato 3-5 g/día: uno de los suplementos más respaldados para fuerza.',
      'Come bien antes de levantar pesado: carbohidratos complejos 2-3 h antes.',
    ],
    exerciseFocus: 'powerlifting',
  },

  // ── GRUPOS MUSCULARES Y DEPORTE ─────────────────────────────────────────
  {
    id: 'futbol',
    patterns: [/f[uú]tbol/i, /football/i, /soccer/i, /bal[oó]n/i, /cancha/i, /césped/i, /portero/i],
    label: 'Rendimiento en fútbol',
    trainingModality: 'standard',
    muscles: ['pierna', 'gluteo', 'core', 'resistencia'],
    dietTips: [
      'Carbohidratos 2-3 h antes de entrenamientos o partidos para máximo rendimiento.',
      'Hidratación extra los días de partido; añade electrolitos si sudas mucho.',
      'Proteína estable para recuperar fibras musculares de pierna tras cargas de sprint.',
    ],
    exerciseFocus: 'futbol',
  },
  {
    id: 'gluteos',
    patterns: [/gl[uú]teo/i, /gluteos/i, /glúteos/i, /cadera/i, /tonificar.*trasero/i, /bumbum/i, /pompis/i],
    label: 'Enfoque en glúteos',
    trainingModality: 'standard',
    muscles: ['gluteo', 'pierna'],
    dietTips: [
      'Proteína en cada comida para desarrollar tejido muscular en tren inferior.',
      'No elimines carbohidratos: dan energía para entrenar pierna con fuerza.',
      'Grasas saludables (aguacate, frutos secos) apoyan recuperación hormonal.',
    ],
    exerciseFocus: 'gluteos',
  },
  {
    id: 'piernas',
    patterns: [/pierna/i, /cu[aá]driceps/i, /isquio/i, /tren inferior/i, /gemelo/i, /zancada/i, /sentadilla/i],
    label: 'Fortalecimiento de piernas',
    trainingModality: 'standard',
    muscles: ['pierna', 'gluteo'],
    dietTips: [
      'Carbohidratos complejos antes de entrenar pierna: aguantan mejor el volumen.',
      'Proteína post-entreno de pierna: isquios y cuádriceps necesitan más recuperación.',
    ],
    exerciseFocus: 'piernas',
  },
  {
    id: 'espalda',
    patterns: [/espalda/i, /dorsal/i, /postura/i, /columna/i, /lumbares/i],
    label: 'Espalda y postura',
    trainingModality: 'standard',
    muscles: ['espalda', 'core'],
    dietTips: ['Mantén proteína adecuada para sostener y desarrollar la masa muscular de espalda.'],
    exerciseFocus: 'espalda',
  },
  {
    id: 'brazos',
    patterns: [/brazo/i, /b[ií]ceps/i, /tr[ií]ceps/i, /hombro/i, /deltoid/i],
    label: 'Brazos y hombros',
    trainingModality: 'standard',
    muscles: ['brazos', 'hombro'],
    dietTips: ['Distribuye proteína a lo largo del día para la hipertrofia de brazos y hombros.'],
    exerciseFocus: 'brazos',
  },
  {
    id: 'definicion',
    patterns: [/defin/i, /marcar/i, /tonificar/i, /bajar grasa/i, /ver abdom/i, /perder.*gras/i, /quemar.*gras/i],
    label: 'Definición muscular',
    trainingModality: 'standard',
    muscles: ['general'],
    dietTips: [
      'Saciedad estratégica: verdura, proteína magra y fibra en cada comida.',
      'Déficit moderado (-300-400 kcal/día): sostenible y preserva músculo.',
      'Evita ultraprocesados; el control del hambre facilita el proceso.',
    ],
    exerciseFocus: 'definicion',
  },
];

// ─── PRIORIDAD DE MODALITY (de mayor a menor) ───────────────────────────────
const MODALITY_PRIORITY = ['functional', 'endurance', 'bodybuilding', 'aesthetics', 'strength', 'standard'];

export function parsePersonalization(text, sexo = '') {
  const raw = (text || '').trim();

  if (!raw) {
    return {
      detectado: false,
      textoOriginal: '',
      etiquetas: [],
      label: 'Plan equilibrado general',
      interpretacion:
        'Sin preferencias específicas indicadas. Se aplicará un plan equilibrado según tu objetivo principal.',
      muscles: ['general'],
      exerciseFocus: 'general',
      trainingModality: 'standard',
      dietTips: [],
      sexoHint: sexo === 'mujer' ? 'mujer' : sexo === 'hombre' ? 'hombre' : null,
    };
  }

  const normalized = raw.toLowerCase();
  const matched = RULES.filter((rule) => rule.patterns.some((p) => p.test(normalized)));

  const muscles = new Set();
  const dietTips = [];
  const etiquetas = [];
  const modalities = [];

  matched.forEach((rule) => {
    etiquetas.push(rule.id);
    rule.muscles.forEach((m) => muscles.add(m));
    rule.dietTips.forEach((t) => dietTips.push(t));
    if (rule.trainingModality) modalities.push(rule.trainingModality);
  });

  // Elegir la modality de mayor prioridad detectada
  const trainingModality =
    MODALITY_PRIORITY.find((m) => modalities.includes(m)) || 'standard';

  // Refuerzo de glúteo para mujeres sin match fuerte
  if (sexo === 'mujer' && !etiquetas.includes('gluteos') && /gl[uú]teo|pierna|tonificar/i.test(normalized)) {
    muscles.add('gluteo');
  }

  const labels = matched.map((r) => r.label);
  const label = labels.length > 0 ? labels.join(' + ') : inferGenericLabel(normalized);

  let exerciseFocus = 'general';
  const priorityFocusOrder = ['hyrox', 'maraton', 'olimpia', 'estetica', 'powerlifting', 'futbol', 'gluteos', 'piernas', 'espalda', 'brazos', 'definicion'];
  for (const id of priorityFocusOrder) {
    if (etiquetas.includes(id)) {
      exerciseFocus = id;
      break;
    }
  }

  return {
    detectado: matched.length > 0 || raw.length > 10,
    textoOriginal: raw,
    etiquetas,
    label,
    interpretacion: buildInterpretacion(raw, matched, sexo, trainingModality),
    muscles: [...muscles],
    exerciseFocus,
    trainingModality,
    dietTips: [...new Set(dietTips)],
    sexoHint: sexo || null,
  };
}

function inferGenericLabel(text) {
  if (text.length > 20) return 'Objetivos personalizados descritos por ti';
  return 'Preferencias generales';
}

function buildInterpretacion(raw, matched, sexo, modality) {
  const parts = [];

  const modalityDescriptions = {
    endurance: 'Tu rutina integrará trabajo de resistencia cardiovascular con fuerza de apoyo para el running.',
    functional: 'Tu rutina seguirá la metodología HYROX/functional fitness: fuerza + condicionamiento metabólico.',
    bodybuilding: 'Rutina de culturismo: máximo volumen por grupo muscular, splits de un músculo por día.',
    aesthetics: 'Rutina orientada a la estética: hipertrofia equilibrada enfocada en proporciones visuales.',
    strength: 'Rutina de fuerza máxima: cargas pesadas, baja repetición, progresión en los levantamientos básicos.',
    standard: '',
  };

  if (modalityDescriptions[modality]) {
    parts.push(modalityDescriptions[modality]);
  }

  if (matched.length) {
    parts.push(`Detectamos: ${matched.map((m) => m.label.toLowerCase()).join(', ')}.`);
  } else {
    parts.push('Tomamos tu descripción como guía para ajustar el plan.');
  }

  parts.push(`Tu texto: «${raw.slice(0, 150)}${raw.length > 150 ? '…' : ''}».`);

  if (sexo === 'mujer' && matched.some((m) => ['gluteos', 'piernas', 'futbol'].includes(m.id))) {
    parts.push('La rutina priorizará tren inferior y glúteos cuando encaje con el objetivo.');
  }

  return parts.join(' ');
}
