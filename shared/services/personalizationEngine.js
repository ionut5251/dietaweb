/**
 * Interpreta el texto libre "Qué buscas mejorar" con detección por palabras clave.
 * No usa IA externa: reglas en español para personalizar dieta y gym.
 */

const RULES = [
  {
    id: 'futbol',
    patterns: [/f[uú]tbol/i, /football/i, /soccer/i, /fútbol/i, /bal[oó]n/i, /cancha/i, /césped/i],
    label: 'Rendimiento en fútbol',
    muscles: ['pierna', 'gluteo', 'core', 'resistencia'],
    dietTips: [
      'Prioriza carbohidratos alrededor de entrenamientos o partidos (2-3 h antes y recuperación después).',
      'Hidratación extra los días de partido; añade electrolitos si sudas mucho.',
      'Proteína estable para recuperar fibras musculares de pierna.',
    ],
    exerciseFocus: 'futbol',
  },
  {
    id: 'gluteos',
    patterns: [/gl[uú]teo/i, /gluteos/i, /glúteos/i, /cadera/i, /tonificar.*trasero/i, /bumbum/i],
    label: 'Enfoque en glúteos',
    muscles: ['gluteo', 'pierna'],
    dietTips: [
      'Proteína en cada comida para desarrollar tejido muscular en tren inferior.',
      'No elimines carbohidratos por completo: dan energía para entrenar pierna fuerte.',
      'Grasas saludables (aguacate, frutos secos) en moderación apoyan recuperación.',
    ],
    exerciseFocus: 'gluteos',
  },
  {
    id: 'piernas',
    patterns: [/pierna/i, /cu[aá]driceps/i, /isquio/i, /tren inferior/i, /gemelo/i, /zancada/i],
    label: 'Fortalecimiento de piernas',
    muscles: ['pierna', 'gluteo'],
    dietTips: [
      'Incluye carbohidratos complejos en comidas previas a entrenar pierna.',
      'Proteína post-entreno ayuda a recuperar cuádriceps e isquios.',
    ],
    exerciseFocus: 'piernas',
  },
  {
    id: 'espalda',
    patterns: [/espalda/i, /dorsal/i, /postura/i, /hombro.*echado/i],
    label: 'Espalda y postura',
    muscles: ['espalda', 'core'],
    dietTips: ['Mantén proteína adecuada para sostener masa muscular de espalda.'],
    exerciseFocus: 'espalda',
  },
  {
    id: 'brazos',
    patterns: [/brazo/i, /b[ií]ceps/i, /tr[ií]ceps/i, /hombro/i],
    label: 'Brazos y hombros',
    muscles: ['brazos', 'hombro'],
    dietTips: ['Distribuye proteína a lo largo del día para hipertrofia de brazos.'],
    exerciseFocus: 'brazos',
  },
  {
    id: 'resistencia',
    patterns: [/resistencia/i, /cardio/i, /correr/i, /running/i, /marat[oó]n/i, /ciclismo/i],
    label: 'Resistencia cardiovascular',
    muscles: ['pierna', 'resistencia'],
    dietTips: [
      'Aumenta ligeramente carbohidratos en días de sesiones largas.',
      'Hidratación y sales minerales en esfuerzos superiores a 60 min.',
    ],
    exerciseFocus: 'resistencia',
  },
  {
    id: 'definicion',
    patterns: [/defin/i, /marcar/i, /tonificar/i, /bajar grasa/i, /ver abdom/i],
    label: 'Definición muscular',
    muscles: ['general'],
    dietTips: [
      'Prioriza saciedad: verdura, proteína magra y fibra en cada comida.',
      'Evita ultraprocesados; el déficit moderado es más sostenible.',
    ],
    exerciseFocus: 'definicion',
  },
];

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
      dietTips: [],
      sexoHint: sexo === 'mujer' ? 'mujer' : sexo === 'hombre' ? 'hombre' : null,
    };
  }

  const normalized = raw.toLowerCase();
  const matched = RULES.filter((rule) => rule.patterns.some((p) => p.test(normalized)));

  let exerciseFocus = 'general';
  const muscles = new Set();
  const dietTips = [];
  const etiquetas = [];

  matched.forEach((rule) => {
    etiquetas.push(rule.id);
    rule.muscles.forEach((m) => muscles.add(m));
    rule.dietTips.forEach((t) => dietTips.push(t));
    if (rule.exerciseFocus !== 'general') exerciseFocus = rule.exerciseFocus;
  });

  // Refuerzo suave por sexo solo si no hay match fuerte de glúteos
  if (sexo === 'mujer' && !etiquetas.includes('gluteos') && /gl[uú]teo|pierna|tonificar/i.test(normalized)) {
    muscles.add('gluteo');
  }

  const labels = matched.map((r) => r.label);
  const label =
    labels.length > 0 ? labels.join(' + ') : inferGenericLabel(normalized);

  const interpretacion = buildInterpretacion(raw, matched, sexo);

  return {
    detectado: matched.length > 0 || raw.length > 10,
    textoOriginal: raw,
    etiquetas,
    label,
    interpretacion,
    muscles: [...muscles],
    exerciseFocus: etiquetas.length > 1 ? prioritizeFocus(etiquetas) : exerciseFocus,
    dietTips: [...new Set(dietTips)],
    sexoHint: sexo || null,
  };
}

function prioritizeFocus(tags) {
  const order = ['futbol', 'gluteos', 'piernas', 'espalda', 'brazos', 'resistencia', 'definicion'];
  for (const id of order) {
    if (tags.includes(id)) return id === 'futbol' ? 'futbol' : id;
  }
  return 'general';
}

function inferGenericLabel(text) {
  if (text.length > 20) return 'Objetivos personalizados descritos por ti';
  return 'Preferencias generales';
}

function buildInterpretacion(raw, matched, sexo) {
  const parts = [];
  if (matched.length) {
    parts.push(
      `Hemos detectado enfoque en: ${matched.map((m) => m.label.toLowerCase()).join(', ')}.`,
    );
  } else {
    parts.push('Tomamos tu descripción como guía para ajustar detalles del plan.');
  }
  parts.push(`Tu mensaje: «${raw.slice(0, 120)}${raw.length > 120 ? '…' : ''}».`);
  if (sexo === 'mujer' && matched.some((m) => ['gluteos', 'piernas', 'futbol'].includes(m.id))) {
    parts.push('La rutina priorizará tren inferior y glúteos cuando encaje con tu objetivo.');
  }
  return parts.join(' ');
}
