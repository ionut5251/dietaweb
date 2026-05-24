import { buildAdvancedSplit } from './advancedWorkoutTemplates.js';

const EXPERIENCE_LEVEL = {
  principiante: { series: 3, reps: '10-12', descanso: '60-90 s' },
  intermedio: { series: 4, reps: '8-12', descanso: '60-90 s' },
  avanzado: { series: 4, reps: '6-10', descanso: '90-120 s' },
};

/** slot: mismo enfoque muscular, variante A (sem 1-2) y B (sem 3-4) */
function slot(id, enfoque, nombreA, nombreB, comoA, comoB, notas = '') {
  return {
    id,
    enfoque,
    varianteA: { nombre: nombreA, como: comoA, notas },
    varianteB: { nombre: nombreB, como: comoB, notas },
  };
}

const SPLIT_TEMPLATES = {
  2: [
    { dia: 'Día A — Cuerpo completo', enfoque: 'Empuje + pierna', slots: fullBodyPushLegSlots() },
    { dia: 'Día B — Cuerpo completo', enfoque: 'Tirón + core', slots: fullBodyPullCoreSlots() },
  ],
  3: [
    { dia: 'Día 1 — Empuje', enfoque: 'Pecho, hombro, tríceps', slots: pushDaySlots() },
    { dia: 'Día 2 — Tirón', enfoque: 'Espalda, bíceps', slots: pullDaySlots() },
    { dia: 'Día 3 — Piernas + core', enfoque: 'Pierna y abdomen', slots: legDaySlots() },
  ],
  4: [
    { dia: 'Día 1 — Torso superior', enfoque: 'Pecho y espalda', slots: upperMixSlots() },
    { dia: 'Día 2 — Piernas', enfoque: 'Cuádriceps y glúteo', slots: legDaySlots() },
    { dia: 'Día 3 — Hombros y brazos', enfoque: 'Hombro, bíceps, tríceps', slots: armsShouldersSlots() },
    { dia: 'Día 4 — Full body metabólico', enfoque: 'Circuito moderado', slots: metabolicSlots() },
  ],
  5: [
    { dia: 'Día 1 — Pecho', enfoque: 'Pectoral', slots: chestDaySlots() },
    { dia: 'Día 2 — Espalda', enfoque: 'Dorsal y trapecio', slots: backDaySlots() },
    { dia: 'Día 3 — Piernas', enfoque: 'Fuerza pierna', slots: legDaySlots() },
    { dia: 'Día 4 — Hombros', enfoque: 'Deltoides', slots: shoulderDaySlots() },
    { dia: 'Día 5 — Brazos + core', enfoque: 'Brazos y abdomen', slots: armsCoreSlots() },
  ],
  6: [
    { dia: 'Día 1 — Pecho', enfoque: 'Pectoral', slots: chestDaySlots() },
    { dia: 'Día 2 — Espalda', enfoque: 'Espalda', slots: backDaySlots() },
    { dia: 'Día 3 — Piernas', enfoque: 'Pierna', slots: legDaySlots() },
    { dia: 'Día 4 — Hombros', enfoque: 'Hombros', slots: shoulderDaySlots() },
    { dia: 'Día 5 — Brazos', enfoque: 'Bíceps/tríceps', slots: armsDaySlots() },
    { dia: 'Día 6 — Cardio + core', enfoque: 'Resistencia', slots: cardioCoreSlots() },
  ],
  7: [
    { dia: 'Lunes — Pecho', enfoque: 'Pectoral', slots: chestDaySlots() },
    { dia: 'Martes — Espalda', enfoque: 'Espalda', slots: backDaySlots() },
    { dia: 'Miércoles — Piernas', enfoque: 'Pierna', slots: legDaySlots() },
    { dia: 'Jueves — Hombros', enfoque: 'Hombros', slots: shoulderDaySlots() },
    { dia: 'Viernes — Brazos', enfoque: 'Brazos', slots: armsDaySlots() },
    { dia: 'Sábado — Cardio moderado', enfoque: '30-40 min caminar/bici', slots: cardioOnlySlots() },
    { dia: 'Domingo — Movilidad', enfoque: 'Estiramientos 20 min', slots: mobilitySlots() },
  ],
};

function fullBodyPushLegSlots() {
  return [
    slot('sentadilla', 'Pierna', 'Sentadilla con barra', 'Goblet squat con mancuerna', 'Pies ancho hombros, muslos paralelos.', 'Mancuerna al pecho, baja controlado.', 'Calienta 5 min.'),
    slot('press_pecho', 'Pecho', 'Press banca con barra', 'Flexiones inclinadas en banco', 'Barra al pecho medio, pies firmes.', 'Manos en banco, cuerpo recto.'),
    slot('zancadas', 'Pierna', 'Zancadas con mancuernas', 'Zancadas búlgaras', 'Paso largo, rodilla trasera casi toca suelo.', 'Pie trasero elevado, torso erguido.'),
    slot('plancha', 'Core', 'Plancha frontal', 'Plancha con elevación de pierna alterna', '30-45 s abdomen apretado.', 'Misma base, sube pierna sin rotar cadera.'),
  ];
}

function fullBodyPullCoreSlots() {
  return [
    slot('remo', 'Espalda', 'Remo con mancuerna', 'Remo en máquina sentado', 'Espalda neutra, codos atrás.', 'Pecho apoyado, aprieta omóplatos.'),
    slot('peso_muerto', 'Cadena posterior', 'Peso muerto rumano con barra', 'Peso muerto rumano con mancuernas', 'Bisagra cadera, barra cerca piernas.', 'Igual técnica, mancuernas a los lados.'),
    slot('jalon', 'Espalda', 'Jalón al pecho en polea', 'Dominadas asistidas', 'No balancees, pecho alto.', 'Controla bajada 2-3 s.'),
    slot('core_rotacion', 'Core', 'Crunch bicicleta', 'Dead bug', '20 reps/lado sin tirar cuello.', 'Brazos/piernas opuestos, lumbar pegada al suelo.'),
  ];
}

function pushDaySlots() {
  return [
    slot('press_pecho', 'Pecho', 'Press banca con barra', 'Press en máquina o mancuernas', '4 s bajada si eres principiante.', 'Máquina o banco plano con mancuernas.'),
    slot('press_hombro', 'Hombro', 'Press hombro con mancuernas', 'Press Arnold', 'No arquees exceso lumbar.', 'Rotación controlada de mancuernas.'),
    slot('triceps', 'Tríceps', 'Fondos en banco', 'Extensiones en polea alta', 'Codos cerca del cuerpo.', 'Codos fijos, solo mueve antebrazo.'),
  ];
}

function pullDaySlots() {
  return [
    slot('remo', 'Espalda', 'Remo con barra', 'Remo en polea baja', 'Aprieta omóplatos al final.', 'Pecho alto, tira al ombligo.'),
    slot('jalon', 'Espalda', 'Dominadas asistidas', 'Jalón agarre neutro', 'Controla la bajada.', 'Agarre neutro, pecho al bar.'),
    slot('curl_biceps', 'Bíceps', 'Curl bíceps con mancuernas', 'Curl bíceps barra Z', 'Sin balanceo de espalda.', 'Barra Z, codos quietos al torso.'),
  ];
}

function legDaySlots() {
  return [
    slot('sentadilla', 'Pierna', 'Sentadilla trasera', 'Sentadilla frontal ligera', 'Profundidad cómoda con técnica.', 'Barra al frente, codos altos.'),
    slot('peso_muerto', 'Cadena posterior', 'Peso muerto rumano', 'Hip thrust con barra', 'Siente isquios en el rumano.', 'Espalda apoyada en banco, aprieta glúteo arriba.'),
    slot('gemelos', 'Gemelos', 'Elevación de talones de pie', 'Elevación en prensa', 'Pausa 1 s arriba.', 'Solo mueve tobillos.'),
    slot('core_lateral', 'Core', 'Plancha lateral', 'Side crunch en polea', '20-30 s cada lado.', 'Controla oblicuos sin tirar cuello.'),
  ];
}

function upperMixSlots() {
  return [...pushDaySlots().slice(0, 2), ...pullDaySlots().slice(0, 2)];
}

function armsShouldersSlots() {
  return [
    slot('elevacion_lateral', 'Hombro', 'Elevaciones laterales con mancuernas', 'Elevaciones en máquina', 'Peso moderado, sin impulso.'),
    slot('curl_biceps', 'Bíceps', 'Curl bíceps con mancuernas', 'Curl bíceps barra Z', '3 s subida y bajada.', 'Barra Z, codos quietos.'),
    slot('triceps', 'Tríceps', 'Extensiones en polea', 'Press francés con mancuerna', 'Codos fijos.', 'Solo flexiona codos, codo apunta al techo.'),
  ];
}

function metabolicSlots() {
  return [
    slot('burpees', 'Cardio', 'Burpees modificados', 'Step-ups rápidos al cajón', '30 s trabajo / 30 s descanso x4.', 'Alterna piernas, ritmo constante.'),
    slot('mountain', 'Cardio', 'Mountain climbers', 'Skipping alto', 'Misma estructura de intervalos.'),
    slot('sentadilla_aire', 'Pierna', 'Sentadillas al aire', 'Sentadilla con salto pequeño', 'Misma estructura; salto solo si rodillas OK.'),
  ];
}

function chestDaySlots() {
  return [
    slot('press_pecho', 'Pecho', 'Press banca con barra', 'Press inclinado con mancuernas', 'Progresión gradual.'),
    slot('aperturas', 'Pecho', 'Aperturas con mancuernas', 'Flexiones diamante', 'Estiramiento controlado pectoral.'),
  ];
}

function backDaySlots() {
  return [
    slot('remo', 'Espalda', 'Remo con barra', 'Remo unilateral mancuerna', '8-12 reps limpias.'),
    slot('jalon', 'Espalda', 'Jalón al pecho', 'Pullover en polea', 'Sin balanceo de torso.'),
  ];
}

function shoulderDaySlots() {
  return [
    slot('press_hombro', 'Hombro', 'Press militar sentado', 'Press en máquina de hombros', 'Core activo.'),
    slot('deltoide_posterior', 'Hombro', 'Pájaros con mancuernas', 'Face pull en polea', 'Salud articular de hombro.'),
  ];
}

function armsDaySlots() {
  return [
    slot('curl_biceps', 'Bíceps', 'Curl bíceps con mancuernas o máquina', 'Curl bíceps barra Z', 'Semanas 1-2: mancuernas o máquina.', 'Semanas 3-4: barra Z.'),
    slot('triceps', 'Tríceps', 'Press francés', 'Fondos en paralelas asistidas', ''),
  ];
}

function armsCoreSlots() {
  return [...armsDaySlots(), slot('plancha', 'Core', 'Plancha frontal', 'Plancha con rodillas alternas', '3 series al fallo técnico.')];
}

function cardioCoreSlots() {
  return [
    slot('cardio', 'Cardio', 'Caminata rápida o bici', 'Elíptica moderada', '30 min ritmo conversación difícil.'),
    slot('core', 'Core', 'Plancha', 'Dead bug', '3 series cada uno.'),
  ];
}

function cardioOnlySlots() {
  return [slot('cardio', 'Cardio', 'Cardio continuo caminar/bici', 'Remo ergómetro suave', 'RPE 5-6/10.')];
}

function mobilitySlots() {
  return [
    slot('estiramiento', 'Movilidad', 'Estiramiento cuádriceps e isquios', 'Estiramiento con foam roller', '30 s por lado.'),
    slot('movilidad', 'Movilidad', 'Gato-vaca y rotación torácica', 'Círculos de hombros y cadera', '10 repeticiones.'),
    slot('respiracion', 'Recuperación', 'Respiración diafragmática', 'Caminata suave 10 min', '2 min respiración.'),
  ];
}

function footballLegSlots() {
  return [
    slot('sentadilla', 'Pierna — potencia', 'Sentadilla con barra', 'Sentadilla búlgara con mancuernas', 'Explosión controlada en la subida.', 'Pie trasero elevado, torso erguido.'),
    slot('zancada_lateral', 'Pierna — estabilidad', 'Zancadas laterales con mancuerna', 'Skater squat al banco', 'Simula cambios de dirección en fútbol.', 'Paso lateral amplio, rodilla estable.'),
    slot('puente_gluteo', 'Glúteo', 'Hip thrust con barra', 'Puente de glúteo a una pierna', 'Aprieta arriba 2 s.', 'Versión unilateral si domina la básica.'),
    slot('gemelos', 'Gemelos', 'Elevación de talones de pie', 'Saltos de gemelo suaves', 'Prevención de lesiones en sprint.'),
    slot('core_rotacion', 'Core', 'Plancha con rotación', 'Pallof press en polea', 'Estabilidad para gestos de torsión.', 'Resiste rotación, brazos extendidos.'),
  ];
}

function gluteFocusedLegSlots() {
  return [
    slot('puente_gluteo', 'Glúteo', 'Hip thrust con barra', 'Abducción de cadera en máquina', 'Prioridad máxima en contracción de glúteo.'),
    slot('sentadilla', 'Pierna', 'Sentadilla sumo con mancuerna', 'Sentadilla búlgara', 'Pies más abiertos para activar glúteo.', 'Paso largo, inclina torso ligero.'),
    slot('peso_muerto', 'Cadena posterior', 'Peso muerto rumano', 'Patada de glúteo en polea', 'Siente estiramiento en isquios.', 'Cadera fija, no arquees lumbar.'),
    slot('zancadas', 'Pierna', 'Zancadas búlgaras', 'Step-up alto al banco', 'Profundidad cómoda.', 'Empuja con talón delantero.'),
    slot('core_lateral', 'Core', 'Plancha lateral con elevación de cadera', 'Clamshell con banda', 'Activa glúteo medio.', 'Rodillas flexionadas, banda en rodillas.'),
  ];
}

function piernasIntensoSlots() {
  return [
    slot('sentadilla', 'Pierna', 'Sentadilla trasera', 'Prensa inclinada pies altos', 'Profundidad según movilidad.'),
    slot('peso_muerto', 'Cadena posterior', 'Peso muerto rumano', 'Curl femoral tumbado', 'Control en excéntrica.'),
    slot('zancadas', 'Pierna', 'Zancadas caminando', 'Hack squat o goblet profundo', 'Series largas posibles.'),
    slot('gemelos', 'Gemelos', 'Gemelo en prensa', 'Gemelo de pie unilateral', 'Rango completo.'),
  ];
}

function isLegSession(session) {
  const t = `${session.dia} ${session.enfoque}`.toLowerCase();
  return /pierna|leg|glúteo|gluteo|inferior|cuádriceps/.test(t);
}

function applyPersonalizationToTemplate(template, focus) {
  if (focus === 'general') return template;

  return template.map((session) => {
    if (!isLegSession(session)) return session;

    if (focus === 'futbol') {
      return {
        ...session,
        dia: session.dia.replace(/Piernas?/i, 'Piernas — fútbol'),
        enfoque: 'Potencia, estabilidad y resistencia para fútbol',
        slots: footballLegSlots(),
      };
    }
    if (focus === 'gluteos') {
      return {
        ...session,
        dia: session.dia.replace(/Piernas?/i, 'Piernas y glúteos'),
        enfoque: 'Prioridad glúteo + pierna',
        slots: gluteFocusedLegSlots(),
      };
    }
    if (focus === 'piernas') {
      return {
        ...session,
        enfoque: 'Fuerza e hipertrofia de pierna',
        slots: piernasIntensoSlots(),
      };
    }
    return session;
  });
}

function resolveFocus(personalizacion) {
  if (!personalizacion) return 'general';
  const f = personalizacion.exerciseFocus;
  if (['futbol', 'gluteos', 'piernas'].includes(f)) return f;
  if (personalizacion.etiquetas?.includes('futbol')) return 'futbol';
  if (personalizacion.etiquetas?.includes('gluteos')) return 'gluteos';
  if (personalizacion.etiquetas?.includes('piernas')) return 'piernas';
  return 'general';
}

function resolveSlot(s, bloque, nivel, sessionIndex) {
  const variant = bloque === 'A' ? s.varianteA : s.varianteB;
  return {
    id: `${s.id}-s${sessionIndex}`,
    enfoque: s.enfoque,
    nombre: variant.nombre,
    como: variant.como,
    notas: variant.notas,
    varianteUsada: bloque === 'A' ? 'Semanas 1-2' : 'Semanas 3-4',
    series: nivel.series,
    repeticiones: nivel.reps,
    descanso: nivel.descanso,
    registrarPeso: !['cardio', 'movilidad', 'estiramiento', 'respiracion', 'burpees', 'mountain'].includes(s.id),
  };
}

function buildSesiones(template, nivel, dias, bloque) {
  return template.map((t, idx) => ({
    dia: t.dia,
    enfoque: t.enfoque,
    duracionEstimada: dias <= 3 ? '45-55 min' : '50-65 min',
    calentamiento: '5-8 min: movilidad articular + 2 series ligeras del primer ejercicio.',
    ejercicios: t.slots.map((s) => resolveSlot(s, bloque, nivel, idx)),
    enfriamiento: '5 min estiramientos suaves de los músculos trabajados.',
    diaSemana: suggestWeekday(idx, dias),
  }));
}

function mapAdvancedExercise(e, sessionIdx, bloqueIdx, ejIdx, bloqueNombre) {
  return {
    id: `adv-s${sessionIdx}-b${bloqueIdx}-e${ejIdx}`,
    enfoque: e.enfoque,
    nombre: e.nombre,
    como: e.como,
    notas: e.notas || '',
    series: String(e.series),
    repeticiones: e.repeticiones,
    descanso: e.descanso || '90-120 s',
    varianteUsada: bloqueNombre,
    registrarPeso: e.registrarPeso !== false,
    bloque: bloqueNombre,
  };
}

function buildAdvancedSesiones(advancedTemplate, dias) {
  return advancedTemplate.map((t, idx) => {
    const bloques = t.bloques.map((b, bi) => ({
      nombre: b.nombre,
      ejercicios: b.ejercicios.map((e, ei) => mapAdvancedExercise(e, idx, bi, ei, b.nombre)),
    }));
    const ejercicios = bloques.flatMap((b) => b.ejercicios);
    return {
      dia: t.dia,
      enfoque: t.enfoque,
      duracionEstimada: '60-75 min',
      calentamiento: '8-10 min: movilidad articular, activación y 2 series progresivas del primer lift.',
      bloques,
      ejercicios,
      enfriamiento: '5-8 min estiramientos de músculos trabajados + respiración.',
      diaSemana: suggestWeekday(idx, dias),
      esAvanzada: true,
    };
  });
}

function usesAdvancedTemplate(input) {
  const profile = input.intensityProfile;
  return (
    profile === 'avanzado' ||
    profile === 'avanzado_metabolico' ||
    profile === 'metabolico' ||
    input.experiencia === 'avanzado'
  );
}

export function generateExercisePlan(input) {
  const dias = input.diasEntrenoSemana;
  const nivel = EXPERIENCE_LEVEL[input.experiencia] ?? EXPERIENCE_LEVEL.principiante;
  const focus = resolveFocus(input.personalizacion);
  const advanced = usesAdvancedTemplate(input);
  const metabolic =
    input.intensityProfile === 'avanzado_metabolico' || input.intensityProfile === 'metabolico';

  let buildWeekSessions;
  if (advanced && (dias === 4 || dias === 5)) {
    const advTpl = buildAdvancedSplit(dias, metabolic);
    buildWeekSessions = () => buildAdvancedSesiones(advTpl, dias);
  } else {
    let template = SPLIT_TEMPLATES[dias] ?? SPLIT_TEMPLATES[3];
    template = applyPersonalizationToTemplate(template, focus);
    buildWeekSessions = (bloque) => buildSesiones(template, nivel, dias, bloque);
  }

  const semanas = [1, 2, 3, 4].map((num) => {
    const bloque = num <= 2 ? 'A' : 'B';
    const sesiones = advanced && (dias === 4 || dias === 5)
      ? buildWeekSessions()
      : buildWeekSessions(bloque);
    return {
      numero: num,
      label: `Semana ${num}`,
      bloque,
      bloqueDescripcion: advanced
        ? 'Rutina avanzada: semanas 1-2 intensidad base; semanas 3-4 sube 5-10 % peso o 1-2 reps por serie.'
        : bloque === 'A'
          ? 'Bloque A: mismos grupos musculares, variante 1 (semanas 1 y 2).'
          : 'Bloque B: mismo enfoque, variante 2 para evitar monotonía (semanas 3 y 4).',
      sesiones,
    };
  });

  const cardioExtra = advanced
    ? 'Sesión exigente: prioriza sueño, comida pre/post entreno e hidratación. Descansa mínimo 48 h entre piernas.'
    : focus === 'futbol'
      ? 'Complementa con 1 sesión de carrera continua suave o partido recreativo.'
      : input.objetivo === 'perder_grasa'
        ? 'Añade 2 sesiones de 20-30 min cardio suave en días sin fuerza.'
        : 'Opcional: 1 sesión cardio ligero para salud cardiovascular.';

  const principios = [
    'Progresión: cuando completes el rango alto de repeticiones en todas las series, sube peso un 5-10 %.',
    'Anota el peso usado en cada ejercicio para ver tu evolución semana a semana.',
    'Técnica antes que peso: mejor 10 reps limpias que 15 mal hechas.',
    'Duerme 7-9 h; el músculo crece con descanso y nutrición.',
    'Si hay dolor articular agudo, para y consulta a un profesional.',
  ];

  if (advanced) {
    principios.unshift(
      'Rutina de nivel avanzado: volumen alto. Si eres intermedio, baja series un 25 % las primeras 2 semanas.',
    );
  }

  if (input.personalizacion?.detectado) {
    principios.unshift(`Rutina adaptada a: ${input.personalizacion.label}.`);
    principios.push(input.personalizacion.interpretacion);
  }

  return {
    resumen: {
      diasPorSemana: dias,
      semanasPlan: 4,
      experiencia: input.experiencia,
      nivelLabel: labelExperience(input.experiencia),
      objetivo: input.objetivo,
      enfoquePersonalizado: input.personalizacion?.label || null,
      focusTecnico: focus,
      intensityProfile: input.intensityProfile || 'estandar',
      esRutinaAvanzada: advanced && (dias === 4 || dias === 5),
      cardioExtra,
      rotacion: advanced
        ? 'Semanas 3-4: mismo esquema, más carga o más densidad (menos descanso).'
        : 'Cada 2 semanas cambia la variante del ejercicio. Semanas 1-2 bloque A; semanas 3-4 bloque B.',
    },
    principios,
    semanas,
    descansoEntreSesiones:
      dias >= 6
        ? 'Alterna grupos musculares; evita entrenar el mismo músculo dolorido dos días seguidos.'
        : 'Deja al menos 48 h entre sesiones del mismo grupo muscular.',
  };
}

function suggestWeekday(index, totalDays) {
  const names = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  if (totalDays === 7) return names[index];
  const spacing = Math.floor(7 / totalDays);
  return names[Math.min(index * spacing, 6)];
}

function labelExperience(exp) {
  const map = { principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' };
  return map[exp] ?? 'Principiante';
}
