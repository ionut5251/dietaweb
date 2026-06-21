/**
 * Generador de planes de ejercicio.
 * Rutinas adaptadas al tiempo disponible (30-90 min) y al tipo de entrenamiento.
 * Splits completamente distintos según lo que describe el usuario.
 */

// ─── HELPERS ────────────────────────────────────────────────────────────────

/**
 * Crea un slot (ejercicio) con variante A (semanas 1-2) y B (semanas 3-4).
 * tipoSlot: 'compound' (multimuscular) | 'accessory' | 'isolation' | 'core' | 'cardio'
 * Con tiempos cortos (30-45 min) solo se usan 'compound'.
 * Con tiempos medios (60 min) se incluyen también 'accessory'.
 * Con tiempos largos (75-90 min) se incluyen también 'isolation'.
 */
function slot(id, enfoque, nombreA, nombreB, comoA = '', comoB = '', notas = '', ov = {}) {
  return {
    id, enfoque,
    varianteA: { nombre: nombreA, como: comoA, notas },
    varianteB: { nombre: nombreB, como: comoB, notas },
    tipoSlot: ov.tipoSlot || 'accessory',
    ...ov,
  };
}

/** Ejercicio de cardio o funcional sin registro de peso */
function cardioSlot(id, enfoque, nombreA, nombreB, comoA = '', comoB = '') {
  return slot(id, enfoque, nombreA, nombreB, comoA, comoB, '', {
    noRegistro: true, seriesOv: '1', repsOv: '', tipoSlot: 'cardio',
  });
}

// ─── PERFILES DE TIEMPO ───────────────────────────────────────────────────────
// Determina cuántos slots tomar y qué tipo de ejercicios incluir según los minutos.
const TIME_PROFILES = {
  // 30 min: 3 ejercicios (2 compuestos + 1 accesorio), 3 series, descansos cortos
  30: { slotsMax: 3, tiposPermitidos: ['compound', 'accessory', 'cardio'],                    seriesMod: -1, descansoMod: 0.5,  label: '30 min' },
  // 45 min: 4 ejercicios, compuestos + accesorios clave, sin aislamientos puros
  45: { slotsMax: 4, tiposPermitidos: ['compound', 'accessory', 'cardio'],                    seriesMod: -1, descansoMod: 0.65, label: '45 min' },
  // 60 min: 6 ejercicios, añade core
  60: { slotsMax: 6, tiposPermitidos: ['compound', 'accessory', 'core', 'cardio'],             seriesMod: 0,  descansoMod: 0.8,  label: '60 min' },
  // 75 min: 8 ejercicios, incluye aislamientos
  75: { slotsMax: 8, tiposPermitidos: ['compound', 'accessory', 'isolation', 'core', 'cardio'],seriesMod: 0,  descansoMod: 1.0,  label: '75 min' },
  // 90 min: todo, más series
  90: { slotsMax: 11, tiposPermitidos: ['compound', 'accessory', 'isolation', 'core', 'cardio'],seriesMod: 1, descansoMod: 1.0,  label: '90 min' },
};

function getTimeProfile(tiempoSesion) {
  const t = Number(tiempoSesion) || 60;
  return TIME_PROFILES[t] || TIME_PROFILES[60];
}

/** Filtra y limita los slots según el perfil de tiempo */
function applyTimeProfile(slots, profile) {
  const filtered = slots.filter((s) => profile.tiposPermitidos.includes(s.tipoSlot || 'accessory'));
  return filtered.slice(0, profile.slotsMax);
}

/** Ajusta series según modificador de tiempo (+1 / 0 / -1) */
function adjustSeries(baseSeries, mod) {
  const n = Number(baseSeries) || 3;
  return String(Math.max(2, Math.min(5, n + mod)));
}

const EXPERIENCE_LEVEL = {
  principiante: { series: '3', reps: '12-15', descanso: '60-90 s' },
  intermedio:   { series: '4', reps: '8-12',  descanso: '60-90 s' },
  avanzado:     { series: '4', reps: '6-10',  descanso: '90-120 s' },
};

function resolveSlot(s, bloque, nivel, sessionIndex, timeProfile) {
  const variant = bloque === 'A' ? s.varianteA : s.varianteB;
  const noReg = s.noRegistro || ['cardio', 'movilidad', 'estiramiento', 'respiracion'].includes(s.id);

  const baseSeries = s.seriesOv ?? nivel.series;
  const finalSeries = timeProfile ? adjustSeries(baseSeries, timeProfile.seriesMod) : baseSeries;

  return {
    id: `${s.id}-s${sessionIndex}`,
    enfoque: s.enfoque,
    nombre: variant.nombre,
    como: variant.como || '',
    notas: variant.notas || '',
    varianteUsada: bloque === 'A' ? 'Semanas 1-2' : 'Semanas 3-4',
    series: finalSeries,
    repeticiones: s.repsOv ?? nivel.reps,
    descanso: s.descansoOv ?? nivel.descanso,
    registrarPeso: !noReg,
    bloque: 'Principal',
  };
}

function buildSesiones(template, nivel, dias, bloque, timeProfile) {
  return template.map((t, idx) => {
    const rawSlots = t.slots || [];
    const filteredSlots = timeProfile ? applyTimeProfile(rawSlots, timeProfile) : rawSlots;
    return {
      dia: t.dia,
      enfoque: t.enfoque,
      duracionEstimada: timeProfile ? timeProfile.label : estimateDuration(filteredSlots.length, t.tipoSesion),
      calentamiento: t.calentamiento || defaultWarmup(t.enfoque),
      ejercicios: filteredSlots.map((s) => resolveSlot(s, bloque, nivel, idx, timeProfile)),
      enfriamiento: t.enfriamiento || '5-8 min estiramientos suaves de los músculos trabajados.',
      diaSemana: suggestWeekday(idx, dias),
    };
  });
}

function estimateDuration(numExercises, tipo) {
  if (tipo === 'cardio') return '45-60 min';
  if (tipo === 'functional') return '60-75 min';
  if (numExercises >= 8) return '75-90 min';
  if (numExercises >= 6) return '60-75 min';
  return '50-65 min';
}

function defaultWarmup(enfoque) {
  const e = (enfoque || '').toLowerCase();
  if (/pecho|empuje|hombro|trícep|press/.test(e))
    return '8-10 min: rotaciones de hombro, band pull-aparts, 2 series ligeras de press banca (50 % del peso de trabajo).';
  if (/espalda|tirón|dorsal|bícep/.test(e))
    return '8 min: dislocaciones con banda, jalones ligeros, remo con goma 2×15 reps.';
  if (/pierna|cuádricep|isquio|glúteo|sentadilla/.test(e))
    return '10 min: sentadillas con peso corporal ×20, movilidad de cadera, 2-3 series progresivas del primer ejercicio.';
  if (/hombro|deltoid/.test(e))
    return '8 min: rotaciones internas/externas con banda, elevaciones frontales vacías, press militar vacío.';
  if (/brazo|bícep|trícep/.test(e))
    return '5 min: curl con goma, extensiones de tríceps vacías, articulación de codos.';
  if (/cardio|running|carrera/.test(e))
    return '10 min: trote suave 5 min + ejercicios de carrera (skipping, talones, zancadas dinámicas).';
  if (/funcional|hyrox|circuito/.test(e))
    return '10 min: movilidad general, 30 s box step, 30 s jumping jacks, 30 s sentadilla, 30 s remo ligero.';
  return '8-10 min: movilidad articular general + 2 series ligeras del primer ejercicio.';
}

function suggestWeekday(index, totalDays) {
  const names = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  if (totalDays === 7) return names[index];
  const patterns = {
    2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4],
    5: [0, 1, 2, 3, 4], 6: [0, 1, 2, 3, 4, 5],
  };
  const idx = (patterns[totalDays] || [0, 2, 4])[index] ?? index;
  return names[Math.min(idx, 6)];
}

function labelExperience(exp) {
  const map = { principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' };
  return map[exp] ?? 'Principiante';
}

// ─── SLOTS POR GRUPO MUSCULAR ────────────────────────────────────────────────
// Series/reps fuerza principales: 4×6-8 / 90-120 s
// Accesorios:  3-4×10-12 / 60-90 s
// Aislamientos: 3×12-15 / 60 s

function pushSlots() {
  return [
    slot('pb_plano',   'Pecho',           'Press banca con barra',              'Press banca con mancuernas',        'Bajada 2-3 s, pausa 1 s en pecho.', 'Más ROM, palmas neutras abajo.', '', { seriesOv: '4', repsOv: '6-10', descansoOv: '90-120 s', tipoSlot: 'compound' }),
    slot('press_mil',  'Hombro',          'Press militar sentado con mancuernas','Press Arnold sentado',              'Core activo, no arquees lumbar.',    'Rotación de neutro a prono.',    '', { seriesOv: '4', repsOv: '8-10', descansoOv: '90 s',      tipoSlot: 'compound' }),
    slot('pb_incl',    'Pecho',           'Press inclinado con mancuernas',      'Press inclinado en máquina',        'Banco 30-45°, activa pectoral superior.', 'Excéntrica 2-3 s.', '', { seriesOv: '4', repsOv: '8-10', descansoOv: '90 s', tipoSlot: 'accessory' }),
    slot('tric_polea', 'Tríceps',         'Extensiones en polea alta con cuerda','Press cerrado con barra',           'Codos pegados al torso.',           'Agarre estrecho, subida explosiva.', '', { seriesOv: '3', repsOv: '10-12', descansoOv: '60 s', tipoSlot: 'accessory' }),
    slot('elev_lat',   'Hombro',          'Elevaciones laterales con mancuernas','Elevaciones laterales en polea baja','Sin impulso de torso.',            'Tensión constante en cable.',   '', { seriesOv: '4', repsOv: '12-15', descansoOv: '60 s', tipoSlot: 'accessory' }),
    slot('pb_decl',    'Pecho',           'Press declinado en máquina o barra',  'Fondos en paralelas con carga',     'Pectoral inferior. Codos a 45°.',  'Inclinado ligeramente hacia adelante.', '', { seriesOv: '3', repsOv: '8-10', descansoOv: '90 s', tipoSlot: 'accessory' }),
    slot('fp_salud',   'Hombro posterior','Face pull en polea alta con cuerda',  'Pájaros inversos en banco 45°',     'Tira a la nariz, codos hacia afuera.', 'Mancuernas pequeñas.', '', { seriesOv: '3', repsOv: '15', descansoOv: '60 s', tipoSlot: 'accessory' }),
    slot('apertura',   'Pecho',           'Aperturas con mancuernas en plano',   'Cruces en polea media',             'Estiramiento controlado.',         'Polea media, manos al centro.', '', { seriesOv: '3', repsOv: '12-15', descansoOv: '60 s', tipoSlot: 'isolation' }),
    slot('tric_franc', 'Tríceps',         'Press francés con barra Z',           'Fondos en paralelas asistidas',     'Activa cabeza larga.',             'Sin asistencia si puedes.',      '', { seriesOv: '3', repsOv: '10-12', descansoOv: '60 s', tipoSlot: 'isolation' }),
  ];
}

function pullSlots() {
  return [
    slot('jalon_ancho',  'Espalda',          'Jalón al pecho agarre ancho',      'Dominadas asistidas',             'Pecho alto, escápulas hacia atrás y abajo.', 'Controla bajada 2-3 s.', '', { seriesOv: '4', repsOv: '6-10', descansoOv: '90-120 s', tipoSlot: 'compound' }),
    slot('remo_barra',   'Espalda',          'Remo inclinado con barra',         'Remo con mancuerna apoyado en banco','Tira al ombligo, codos pegados.','Pecho en banco, retrae escápulas.', '', { seriesOv: '4', repsOv: '8-10', descansoOv: '90 s', tipoSlot: 'compound' }),
    slot('curl_barra',   'Bíceps',           'Curl bíceps con barra Z',          'Curl bíceps con barra recta',     'Codos fijos al torso.',           'Agarre a la anchura de hombros.', '', { seriesOv: '4', repsOv: '8-10', descansoOv: '60-90 s', tipoSlot: 'accessory' }),
    slot('jalon_neutro', 'Espalda',          'Jalón agarre neutro',              'Pullover en polea con cuerda',    'Mayor activación dorsal inferior.','Brazos casi rectos.',           '', { seriesOv: '3', repsOv: '8-10', descansoOv: '90 s', tipoSlot: 'accessory' }),
    slot('remo_polea',   'Espalda',          'Remo en polea baja con barra V',   'Remo en máquina sentado',         'No arquees lumbar en el tirón.',  'Aprieta escápulas al final.',   '', { seriesOv: '3', repsOv: '10-12', descansoOv: '60-90 s', tipoSlot: 'accessory' }),
    slot('fp_espalda',   'Hombro posterior', 'Face pull en polea alta',          'Abducción horizontal con mancuernas','Salud del manguito rotador.',  'Hombros bajos, no encogidos.', '', { seriesOv: '3', repsOv: '15', descansoOv: '60 s', tipoSlot: 'accessory' }),
    slot('curl_manc',    'Bíceps',           'Curl con mancuernas alterno',      'Curl martillo bilateral',         'Alterna brazos, controla bajada 2 s.','Activa braquial.',          '', { seriesOv: '3', repsOv: '10-12', descansoOv: '60 s', tipoSlot: 'isolation' }),
    slot('curl_conc',    'Bíceps',           'Curl de concentración en banco',   'Curl en polea baja',              'Codo en muslo interior, pico máximo.','Tensión constante.',        '', { seriesOv: '3', repsOv: '12-15', descansoOv: '60 s', tipoSlot: 'isolation' }),
  ];
}

function legSlots() {
  return [
    slot('sentadilla',  'Cuádriceps',    'Sentadilla trasera con barra',          'Sentadilla goblet con mancuerna',  'Profundidad cómoda, rodillas alineadas.', 'Mancuerna al pecho, espalda recta.', '', { seriesOv: '4', repsOv: '6-10', descansoOv: '120-180 s', tipoSlot: 'compound' }),
    slot('rdl',         'Isquiotibiales','Peso muerto rumano con barra',           'Peso muerto rumano con mancuernas','Bisagra de cadera, barra cerca del cuerpo.','Mismo patrón.', '', { seriesOv: '4', repsOv: '8-10', descansoOv: '90-120 s', tipoSlot: 'compound' }),
    slot('hip_thrust',  'Glúteo',        'Hip thrust con barra en banco',          'Puente de glúteo unilateral',      'Pausa 2 s arriba, aprieta glúteo.',     'Pie sobre elevación.',               '', { seriesOv: '4', repsOv: '10-12', descansoOv: '90 s', tipoSlot: 'compound' }),
    slot('prensa',      'Cuádriceps',    'Prensa inclinada pies a la anchura',     'Hack squat en máquina',            'No bloquees rodillas arriba.',          'Talones más altos en la plataforma.', '', { seriesOv: '4', repsOv: '8-10', descansoOv: '90-120 s', tipoSlot: 'accessory' }),
    slot('curl_fem',    'Isquiotibiales','Curl femoral tumbado en máquina',        'Nordic curl o curl con fitball',   'Caderas en mesa, no eleves pelvis.',    'Máximo control excéntrico.',          '', { seriesOv: '3', repsOv: '10-12', descansoOv: '60-90 s', tipoSlot: 'accessory' }),
    slot('extension',   'Cuádriceps',    'Extensión de cuádriceps en máquina',     'Sentadilla búlgara con mancuernas','Pausa 1 s arriba, activa VMO.',         'Paso largo, torso erguido.',          '', { seriesOv: '3', repsOv: '10-12', descansoOv: '60-90 s', tipoSlot: 'accessory' }),
    slot('gemelo_pie',  'Gemelos',       'Elevación de talones de pie (unilateral)','Gemelo en prensa',                'Pausa 2 s arriba, rango completo.',     'Punta del pie en borde.',             '', { seriesOv: '4', repsOv: '12-15', descansoOv: '60 s', tipoSlot: 'isolation' }),
    slot('gemelo_sent', 'Sóleo',         'Elevación de talones sentado con mancuerna','Gemelo sentado en máquina',    'Rodilla 90°, trabaja sóleo profundo.',  'Mayor rango con máquina.',            '', { seriesOv: '3', repsOv: '15-20', descansoOv: '60 s', tipoSlot: 'isolation' }),
  ];
}

function shoulderSlots() {
  return [
    slot('press_mil',   'Hombro',          'Press militar con barra de pie',        'Press militar con mancuernas sentado','Core activo, no arquees lumbares.',   'ROM completo.',              '', { seriesOv: '4', repsOv: '6-8', descansoOv: '90-120 s', tipoSlot: 'compound' }),
    slot('press_arn',   'Hombro',          'Press Arnold sentado',                  'Press en máquina de hombros',         'Rotación de neutro a prono.',         'ROM completo.',              '', { seriesOv: '3', repsOv: '10-12', descansoOv: '90 s', tipoSlot: 'accessory' }),
    slot('elev_lat2',   'Hombro lateral',  'Elevaciones laterales con mancuernas',  'Elevaciones en polea cruzada',        'Sin impulso.',                        'Tensión constante.',         '', { seriesOv: '4', repsOv: '12-15', descansoOv: '60 s', tipoSlot: 'accessory' }),
    slot('fp_hombro',   'Hombro posterior','Face pull en polea alta con cuerda',    'Abducción horizontal con mancuernas', 'Tira a la nariz, codos afuera.',      'Hombros bajos.',             '', { seriesOv: '3', repsOv: '15', descansoOv: '60 s', tipoSlot: 'accessory' }),
    slot('pajaro',      'Hombro posterior','Pájaros con mancuernas en banco 45°',   'Reverse fly en máquina',              'Codo ligeramente doblado.',           'Ajusta apoyo de pecho.',     '', { seriesOv: '4', repsOv: '12-15', descansoOv: '60 s', tipoSlot: 'isolation' }),
    slot('elev_front',  'Hombro anterior', 'Elevaciones frontales con mancuerna',   'Elevaciones frontales con disco',     'Horizontal al frente, sin balanceo.', 'Peso único.',                '', { seriesOv: '3', repsOv: '10-12', descansoOv: '60 s', tipoSlot: 'isolation' }),
    slot('encog',       'Trapecios',       'Encogimiento de hombros con mancuernas','Encogimiento en máquina Smith',       'Pausa 1 s arriba.',                   'Más estabilidad.',           '', { seriesOv: '3', repsOv: '12-15', descansoOv: '60 s', tipoSlot: 'isolation' }),
  ];
}

function armsSlots() {
  return [
    slot('curl_bz',    'Bíceps', 'Curl bíceps barra Z',                       'Curl bíceps con barra recta',          'Codos fijos al torso, sin balanceo.', 'ROM completo.',                '', { seriesOv: '4', repsOv: '8-10', descansoOv: '60-90 s', tipoSlot: 'accessory' }),
    slot('franc',      'Tríceps','Press francés con barra Z tumbado',          'Extensiones sobre cabeza con mancuerna','Codos no salen hacia los lados.',    'Mancuerna bilateral, codos quietos.', '', { seriesOv: '4', repsOv: '8-10', descansoOv: '60-90 s', tipoSlot: 'accessory' }),
    slot('curl_mc',    'Bíceps', 'Curl con mancuernas alterno',                'Curl en predicador con mancuerna',     'Controla bajada 2 s, supinación.',    'Codo bloqueado.',             '', { seriesOv: '3', repsOv: '10-12', descansoOv: '60 s', tipoSlot: 'isolation' }),
    slot('polea_tric', 'Tríceps','Extensiones en polea alta con cuerda',       'Extensiones con barra recta',          'Codos pegados al torso.',             'Aprieta al final.',           '', { seriesOv: '3', repsOv: '10-12', descansoOv: '60 s', tipoSlot: 'isolation' }),
    slot('curl_mart',  'Bíceps', 'Curl martillo con mancuernas',               'Curl de cuerda en polea baja',         'Activa braquial y braquiorradial.',   'Muñecas neutras.',            '', { seriesOv: '3', repsOv: '12', descansoOv: '60 s', tipoSlot: 'isolation' }),
    slot('fondos_tric','Tríceps','Fondos en paralelas (asistidos si es necesario)','Press cerrado en banco plano',     'Cuerpo recto.',                       'Manos a la anchura de hombros.', '', { seriesOv: '3', repsOv: '8-10', descansoOv: '60 s', tipoSlot: 'isolation' }),
  ];
}

function coreSlots() {
  return [
    slot('plancha',    'Core', 'Plancha frontal',              'Plancha con elevación de pierna', 'Glúteo apretado. 3×45-60 s.','Mantén cadera estable.',       '', { seriesOv: '3', repsOv: '45-60 s', descansoOv: '45 s', noRegistro: true, tipoSlot: 'core' }),
    slot('elev_pierna','Core', 'Elevaciones de piernas tumbado','Elevaciones en barra fija',      'Lumbar pegada al suelo.',    'Control en la bajada.',        '', { seriesOv: '3', repsOv: '12-15',   descansoOv: '60 s', noRegistro: true, tipoSlot: 'core' }),
    slot('crunch',     'Core', 'Crunch lento',                 'Crunch en polea o en máquina',   'Sin tirar de cuello.',       'Flexiona vértebra a vértebra.','', { seriesOv: '3', repsOv: '15-20',   descansoOv: '60 s', noRegistro: true, tipoSlot: 'core' }),
    slot('russian',    'Core', 'Russian twist con disco',      'Russian twist con balón medicinal','Rota desde torso.',         'Más inestabilidad.',           '', { seriesOv: '3', repsOv: '12/lado', descansoOv: '45 s', noRegistro: true, tipoSlot: 'core' }),
    slot('dead_bug',   'Core', 'Dead bug',                     'Bird dog en cuadrupedia',         'Lumbar pegada.',            'No arquees lumbar.',           '', { seriesOv: '3', repsOv: '10/lado', descansoOv: '45 s', noRegistro: true, tipoSlot: 'core' }),
  ];
}

function fullBodyPushLegSlots() {
  return [
    slot('sq_fb', 'Pierna', 'Sentadilla con barra o goblet', 'Prensa inclinada',         'Técnica primero.', 'Pies a anchura de hombros.',   '', { seriesOv: '3', repsOv: '8-10', tipoSlot: 'compound' }),
    slot('pb_fb', 'Pecho',  'Press banca con barra',         'Flexiones inclinadas banco','Compuesto del día.','Cuerpo recto.',               '', { seriesOv: '3', repsOv: '8-10', tipoSlot: 'compound' }),
    slot('rdl_fb','Isquiotibiales','Peso muerto rumano con barra','Peso muerto con mancuernas','Bisagra de cadera.','Mismo patrón.',           '', { seriesOv: '3', repsOv: '10',   tipoSlot: 'compound' }),
    slot('pm_fb', 'Hombro', 'Press militar con mancuernas',  'Elevaciones laterales',     'Core activo.',     'Sin impulso.',                '', { seriesOv: '3', repsOv: '10-12',tipoSlot: 'accessory'}),
    slot('zan_fb','Pierna', 'Zancadas caminando con mancuernas','Step-up al cajón',        'Paso largo.',      'Empuja con talón.',           '', { seriesOv: '3', repsOv: '10/pierna', tipoSlot: 'accessory' }),
    slot('pla_fb','Core',   'Plancha frontal',               'Dead bug',                  '3×45 s apretado.', 'Brazos y piernas opuestos.',  '', { seriesOv: '3', repsOv: '40-60 s', noRegistro: true, tipoSlot: 'core' }),
  ];
}

function fullBodyPullCoreSlots() {
  return [
    slot('jalon_fb','Espalda',  'Jalón al pecho',              'Dominadas asistidas',       'Escápulas activas.', 'Controla bajada 2-3 s.',  '', { seriesOv: '3', repsOv: '8-10',   tipoSlot: 'compound' }),
    slot('rdl2_fb', 'Glúteo',   'Hip thrust con barra',        'Puente de glúteo unilateral','Pausa 2 s arriba.','Contracción glútea máx.',  '', { seriesOv: '3', repsOv: '10-12',  tipoSlot: 'compound' }),
    slot('remo_fb', 'Espalda',  'Remo con mancuerna unilateral','Remo en máquina sentado',  'Espalda neutra.',   'Aprieta omóplatos.',       '', { seriesOv: '3', repsOv: '10-12',  tipoSlot: 'accessory' }),
    slot('curl_fb', 'Bíceps',   'Curl bíceps con mancuernas alterno','Curl martillo',       'Sin balanceo.',     'Activa braquial.',         '', { seriesOv: '3', repsOv: '10-12',  tipoSlot: 'isolation' }),
    slot('gem_fb',  'Gemelos',  'Elevación de talones de pie', 'Gemelo en prensa',          'Pausa arriba 2 s.', 'Rango completo.',          '', { seriesOv: '3', repsOv: '15',     tipoSlot: 'isolation' }),
    slot('core_fb', 'Core',     'Crunch bicicleta',            'Elevaciones de piernas',    '20/lado, sin cuello.','Lumbar pegada.',          '', { seriesOv: '3', repsOv: '12-15',  noRegistro: true, tipoSlot: 'core' }),
  ];
}

// ─── TEMPLATES ESTÁNDAR (Hipertrofia / Fitness general) ─────────────────────
const STANDARD_TEMPLATES = {
  2: [
    {
      dia: 'Día A — Cuerpo completo',
      enfoque: 'Empuje + pierna (Full Body A)',
      calentamiento: '8-10 min: movilidad general, sentadillas vacías ×20, rotaciones de hombro.',
      slots: fullBodyPushLegSlots(),
    },
    {
      dia: 'Día B — Cuerpo completo',
      enfoque: 'Tirón + core (Full Body B)',
      calentamiento: '8 min: dislocaciones con banda, jalones ligeros, activación core.',
      slots: fullBodyPullCoreSlots(),
    },
  ],
  3: [
    {
      dia: 'Día 1 — Empuje',
      enfoque: 'Pecho + Hombro + Tríceps',
      slots: pushSlots(),
    },
    {
      dia: 'Día 2 — Tirón',
      enfoque: 'Espalda + Bíceps',
      slots: pullSlots(),
    },
    {
      dia: 'Día 3 — Piernas',
      enfoque: 'Cuádriceps + Isquiotibiales + Glúteo + Gemelos',
      slots: legSlots(),
    },
  ],
  4: [
    {
      dia: 'Día 1 — Empuje',
      enfoque: 'Pecho + Hombro + Tríceps',
      slots: pushSlots(),
    },
    {
      dia: 'Día 2 — Piernas fuerza',
      enfoque: 'Cuádriceps + Isquiotibiales + Glúteo + Gemelos',
      slots: legSlots(),
    },
    {
      dia: 'Día 3 — Tirón',
      enfoque: 'Espalda + Bíceps',
      slots: pullSlots(),
    },
    {
      dia: 'Día 4 — Hombros + Brazos + Core',
      enfoque: 'Deltoides + Bíceps + Tríceps + Abdomen',
      slots: [...shoulderSlots().slice(0, 4), ...armsSlots().slice(0, 4), ...coreSlots().slice(0, 3)],
    },
  ],
  5: [
    {
      dia: 'Día 1 — Empuje',
      enfoque: 'Pecho + Hombro + Tríceps',
      slots: pushSlots(),
    },
    {
      dia: 'Día 2 — Piernas fuerza',
      enfoque: 'Cuádriceps + Isquiotibiales + Glúteo + Gemelos',
      slots: legSlots(),
    },
    {
      dia: 'Día 3 — Tirón',
      enfoque: 'Espalda + Bíceps',
      slots: pullSlots(),
    },
    {
      dia: 'Día 4 — Hombros + Core',
      enfoque: 'Deltoides + Abdomen',
      slots: [...shoulderSlots(), ...coreSlots().slice(0, 3)],
    },
    {
      dia: 'Día 5 — Piernas metabólico + Brazos',
      enfoque: 'Pierna (posterior) + Bíceps + Tríceps',
      slots: [
        ...legSlots().filter(s => ['rdl', 'curl_fem', 'hip_thrust', 'gemelo_pie'].includes(s.id)),
        ...armsSlots(),
      ],
    },
  ],
  6: [
    { dia: 'Día 1 — Pecho', enfoque: 'Pectoral completo', slots: pushSlots().filter(s => ['pb_plano', 'pb_incl', 'pb_decl', 'apertura', 'tric_polea', 'tric_franc'].includes(s.id)) },
    { dia: 'Día 2 — Espalda', enfoque: 'Espalda completa', slots: pullSlots().filter(s => !['curl_barra', 'curl_manc', 'curl_conc'].includes(s.id)) },
    { dia: 'Día 3 — Piernas', enfoque: 'Piernas completas', slots: legSlots() },
    { dia: 'Día 4 — Hombros', enfoque: 'Deltoides', slots: shoulderSlots() },
    { dia: 'Día 5 — Brazos + Core', enfoque: 'Bíceps + Tríceps + Abdomen', slots: [...armsSlots(), ...coreSlots().slice(0, 3)] },
    { dia: 'Día 6 — Cardio + Core', enfoque: 'Resistencia + Abdomen', tipoSesion: 'cardio', calentamiento: '10 min: trote suave.', slots: [
      cardioSlot('cardio_mod', 'Cardio', 'Caminata rápida o bici (zona 2)', 'Remo ergómetro o elíptica', '30-35 min RPE 6-7/10.', '35 min ritmo sostenido.'),
      ...coreSlots(),
    ]},
  ],
};

// ─── TEMPLATES CULTURISMO (Bodybuilding) ─────────────────────────────────────
// Un grupo muscular por día, máximo volumen e isolación.
function chestBBSlots() {
  return [
    slot('bb_pb1',  'Pecho', 'Press banca con barra', 'Press banca con mancuernas', 'Principal del día, 4 s bajada.', 'Mayor ROM, palmas neutras abajo.', '', { seriesOv: '5', repsOv: '6-8', descansoOv: '120-180 s' }),
    slot('bb_pb2',  'Pecho', 'Press inclinado con mancuernas', 'Press inclinado en máquina', 'Banco 30°, activa pecho superior.', 'Ajusta banco a 40°.', '', { seriesOv: '4', repsOv: '8-10', descansoOv: '90-120 s' }),
    slot('bb_pb3',  'Pecho', 'Press declinado con barra o máquina', 'Fondos lastrados en paralelas', 'Pecho inferior. Barra al pecho bajo.', 'Inclinación ligera hacia adelante.', '', { seriesOv: '4', repsOv: '8-10', descansoOv: '90 s' }),
    slot('bb_ap1',  'Pecho', 'Aperturas con mancuernas plano', 'Aperturas inclinadas 30°', 'Máximo estiramiento pectoral.', 'Activa pecho superior.', '', { seriesOv: '3', repsOv: '12-15', descansoOv: '60 s' }),
    slot('bb_cruz', 'Pecho', 'Cruces en polea alta (high cable fly)', 'Cruces en polea baja (low cable fly)', 'Tensión constante. Sprinta la contracción.', 'Activa pecho inferior.', '', { seriesOv: '3', repsOv: '12-15', descansoOv: '60 s' }),
    slot('bb_pdeck','Pecho', 'Pec deck (máquina de aperturas)', 'Push-up lento con bandas', 'Aisla pectoral. Pausa en contracción.', '3-4 s bajada, explosivo arriba.', '', { seriesOv: '3', repsOv: '12-15', descansoOv: '60 s' }),
    slot('bb_tric', 'Tríceps', 'Extensiones en polea alta con cuerda', 'Press cerrado en máquina Smith', 'Coda del día para tríceps.', 'No falles técnica al final.', '', { seriesOv: '3', repsOv: '10-12', descansoOv: '60 s' }),
  ];
}

function backBBSlots() {
  return [
    slot('bb_dead', 'Espalda', 'Peso muerto convencional con barra', 'Peso muerto sumo', 'Rey de los compuestos. Espalda neutra.', 'Pies más abiertos, punta de pies afuera.', '', { seriesOv: '5', repsOv: '4-6', descansoOv: '180-240 s' }),
    slot('bb_jalon','Espalda', 'Jalón al pecho agarre ancho', 'Dominadas con lastre', 'Pecho al bar, escápulas activas.', 'Añade lastre cuando dominas >10 reps.', '', { seriesOv: '4', repsOv: '8-10', descansoOv: '90-120 s' }),
    slot('bb_rem1', 'Espalda', 'Remo inclinado con barra', 'Remo Pendlay', 'Tira al ombligo, columna neutral.', 'Barra al suelo entre reps.', '', { seriesOv: '4', repsOv: '8-10', descansoOv: '90-120 s' }),
    slot('bb_rem2', 'Espalda', 'Remo con mancuerna (unilateral)', 'Remo en máquina sentado', 'Pecho en banco, máxima retracción.', 'Aprieta escápulas al final.', '', { seriesOv: '4', repsOv: '10-12', descansoOv: '60-90 s' }),
    slot('bb_plov', 'Espalda', 'Pullover en polea con cuerda', 'Pullover con mancuerna en banco', 'Activa dorsal inferior. Brazos casi rectos.', 'Brazos a 90°, codo fijo.', '', { seriesOv: '3', repsOv: '12-15', descansoOv: '60 s' }),
    slot('bb_fp2',  'Hombro posterior', 'Face pull en polea', 'Pájaros inversos con mancuernas', 'Salud articular de hombro.', 'Pecho en banco 45°.', '', { seriesOv: '3', repsOv: '15', descansoOv: '60 s' }),
  ];
}

function legsBBSlots() {
  return [
    slot('bb_sq',   'Cuádriceps', 'Sentadilla trasera con barra (fuerza)', 'Sentadilla pausa en fondo', 'Núcleo del día. Profundidad competitiva.', '2 s de pausa abajo, subida explosiva.', '', { seriesOv: '5', repsOv: '6-8', descansoOv: '180-240 s' }),
    slot('bb_hackq','Cuádriceps', 'Hack squat en máquina', 'Prensa inclinada pies bajos', 'Activa cuádriceps más que prensa.', 'Rango completo, pies bajos y juntos.', '', { seriesOv: '4', repsOv: '8-10', descansoOv: '120 s' }),
    slot('bb_ext',  'Cuádriceps', 'Extensión de cuádriceps (drop set semana 3-4)', 'Extensión unilateral en máquina', 'Pausa 2 s arriba. Drop set en semanas avanzadas.', 'Leg press unilateral alternativo.', '', { seriesOv: '4', repsOv: '10-12', descansoOv: '60-90 s' }),
    slot('bb_rdl',  'Isquiotibiales', 'Peso muerto rumano con barra', 'Curl femoral en banco de pie', 'Isquios al máximo.', 'ROM completo de pie.', '', { seriesOv: '4', repsOv: '8-10', descansoOv: '90-120 s' }),
    slot('bb_curl', 'Isquiotibiales', 'Curl femoral tumbado', 'Nordic curl excéntrico', 'Caderas en cojín, excéntrica 3 s.', 'Máximo control excéntrico.', '', { seriesOv: '4', repsOv: '10-12', descansoOv: '60-90 s' }),
    slot('bb_ht',   'Glúteo', 'Hip thrust con barra (pesado)', 'Patada de glúteo en polea baja', 'Pausa 2 s arriba apretando glúteo.', 'Cadera extendida, no arquees lumbar.', '', { seriesOv: '4', repsOv: '10-12', descansoOv: '90 s' }),
    slot('bb_gem',  'Gemelos', 'Gemelo de pie unilateral (rango completo)', 'Gemelo sentado en máquina', 'Pausa 2 s arriba. Rango completo.', 'Trabaja sóleo profundo.', '', { seriesOv: '5', repsOv: '12-15', descansoOv: '60 s' }),
  ];
}

function shouldersBBSlots() {
  return [
    slot('bb_pm',   'Hombro', 'Press militar con barra de pie', 'Press militar sentado en rack', 'Fuerza base de hombro. Espalda neutra.', 'Banco respaldo recto, más estabilidad.', '', { seriesOv: '5', repsOv: '6-8', descansoOv: '120-180 s' }),
    slot('bb_arn',  'Hombro', 'Press Arnold con mancuernas', 'Press con mancuernas sentado', 'Rotación completa.', 'Sube a los lados.', '', { seriesOv: '4', repsOv: '8-10', descansoOv: '90 s' }),
    slot('bb_el1',  'Hombro lateral', 'Elevaciones laterales (técnica estricta)', 'Elevaciones laterales en polea', 'Sin impulso. Codo levemente flexionado.', 'Tensión constante con cable.', '', { seriesOv: '5', repsOv: '10-15', descansoOv: '60 s' }),
    slot('bb_ef',   'Hombro anterior', 'Elevaciones frontales con placa', 'Elevaciones frontales con mancuernas alternas', 'Horizontal al frente. Sin balanceo.', 'Alterna para más control.', '', { seriesOv: '3', repsOv: '10-12', descansoOv: '60 s' }),
    slot('bb_paj',  'Hombro posterior', 'Pájaros en banco 45° con mancuernas', 'Reverse fly en máquina', 'Deltoides posterior subdesarrollado: cuídalo.', 'Ajusta apoyo.', '', { seriesOv: '4', repsOv: '12-15', descansoOv: '60 s' }),
    slot('bb_fp3',  'Hombro posterior', 'Face pull en polea alta', 'Tirón con banda a la cara', 'Salud del manguito. Siempre en la sesión.', 'Goma fuerte a la cara, codos altos.', '', { seriesOv: '3', repsOv: '15-20', descansoOv: '45 s' }),
  ];
}

function armsBBSlots() {
  return [
    slot('bb_cz',  'Bíceps', 'Curl bíceps con barra Z (pesado)', 'Curl bíceps barra recta', 'Codos fijos, ROM completo.', 'Mismo patrón.', '', { seriesOv: '5', repsOv: '6-8', descansoOv: '60-90 s' }),
    slot('bb_cm',  'Bíceps', 'Curl en predicador con barra', 'Curl concentrado con mancuerna', 'Codo bloqueado en banco.', 'Pico máximo, 1 s contracción.', '', { seriesOv: '4', repsOv: '10-12', descansoOv: '60 s' }),
    slot('bb_cm2', 'Bíceps', 'Curl martillo bilateral', 'Curl de araña (spider curl)', 'Activa braquial. Muñecas neutras.', 'Pecho al banco inclinado 45°.', '', { seriesOv: '3', repsOv: '10-12', descansoOv: '60 s' }),
    slot('bb_fr',  'Tríceps', 'Press francés con barra Z (skull crusher)', 'Extensions con mancuerna sobre cabeza', 'Cabeza larga, codos quietos.', 'Mancuerna bilateral, ROM completo.', '', { seriesOv: '5', repsOv: '8-10', descansoOv: '60-90 s' }),
    slot('bb_pl',  'Tríceps', 'Extensiones en polea alta con cuerda', 'Extensiones con barra recta', 'Aprieta al máximo al final.', 'Barra recta, más intensidad.', '', { seriesOv: '4', repsOv: '10-12', descansoOv: '60 s' }),
    slot('bb_fd',  'Tríceps', 'Fondos lastrados en paralelas', 'Dips en máquina asistida (pesado)', 'No uses asistencia si puedes sin ella.', 'Peso suficiente para 8-10 reps.', '', { seriesOv: '3', repsOv: '8-10', descansoOv: '60-90 s' }),
    slot('bb_cor', 'Core', 'Crunches con polea o máquina (pesos)', 'Elevaciones de piernas en barra', 'Core también se entrena como músculo.', 'Máximo control.', '', { seriesOv: '4', repsOv: '15-20', descansoOv: '45 s', noRegistro: true }),
  ];
}

const BODYBUILDING_TEMPLATES = {
  3: [
    { dia: 'Día 1 — Pecho + Tríceps', enfoque: 'Pectoral + Tríceps (empuje)', slots: [...chestBBSlots(), ...armsSlots().filter(s => ['franc', 'polea_tric', 'fondos_tric'].includes(s.id))] },
    { dia: 'Día 2 — Espalda + Bíceps', enfoque: 'Dorsal + Bíceps (tirón)', slots: [...backBBSlots(), ...armsBBSlots().filter(s => ['bb_cz', 'bb_cm', 'bb_cm2'].includes(s.id))] },
    { dia: 'Día 3 — Piernas + Hombros', enfoque: 'Tren inferior + Deltoides', slots: [...legsBBSlots().slice(0, 5), ...shouldersBBSlots().slice(0, 4)] },
  ],
  4: [
    { dia: 'Día 1 — Pecho', enfoque: 'Pectoral completo', slots: chestBBSlots() },
    { dia: 'Día 2 — Espalda', enfoque: 'Dorsal + Trapecios', slots: backBBSlots() },
    { dia: 'Día 3 — Piernas', enfoque: 'Tren inferior completo', slots: legsBBSlots() },
    { dia: 'Día 4 — Hombros + Brazos', enfoque: 'Deltoides + Bíceps + Tríceps', slots: [...shouldersBBSlots().slice(0, 4), ...armsBBSlots().slice(0, 5)] },
  ],
  5: [
    { dia: 'Día 1 — Pecho', enfoque: 'Pectoral completo', slots: chestBBSlots() },
    { dia: 'Día 2 — Espalda', enfoque: 'Dorsal + Trapecios', slots: backBBSlots() },
    { dia: 'Día 3 — Piernas', enfoque: 'Tren inferior completo', slots: legsBBSlots() },
    { dia: 'Día 4 — Hombros', enfoque: 'Deltoides completo', slots: shouldersBBSlots() },
    { dia: 'Día 5 — Brazos + Core', enfoque: 'Bíceps + Tríceps + Abdomen', slots: armsBBSlots() },
  ],
  6: [
    { dia: 'Día 1 — Pecho', enfoque: 'Pectoral', slots: chestBBSlots() },
    { dia: 'Día 2 — Espalda', enfoque: 'Espalda', slots: backBBSlots() },
    { dia: 'Día 3 — Piernas', enfoque: 'Tren inferior', slots: legsBBSlots() },
    { dia: 'Día 4 — Hombros', enfoque: 'Deltoides', slots: shouldersBBSlots() },
    { dia: 'Día 5 — Brazos', enfoque: 'Bíceps + Tríceps', slots: armsBBSlots() },
    { dia: 'Día 6 — Pecho + Espalda (accesorios)', enfoque: 'Volumen accesorio', slots: [
      ...chestBBSlots().slice(3, 6),
      ...backBBSlots().slice(3),
      ...coreSlots(),
    ]},
  ],
};

// ─── TEMPLATES ESTÉTICA (Similar a BB pero más equilibrado) ──────────────────
const AESTHETICS_TEMPLATES = {
  3: BODYBUILDING_TEMPLATES[3],
  4: [
    { dia: 'Día 1 — Empuje (Pecho + Hombro + Tríceps)', enfoque: 'Pectoral + Deltoides + Tríceps', slots: [...pushSlots(), ...coreSlots().slice(0, 2)] },
    { dia: 'Día 2 — Piernas + Glúteo', enfoque: 'Tren inferior completo', slots: legSlots() },
    { dia: 'Día 3 — Tirón (Espalda + Bíceps)', enfoque: 'Dorsal + Bíceps', slots: pullSlots() },
    { dia: 'Día 4 — Hombros + Brazos + Core', enfoque: 'Músculos de "exposición" + Abdomen', slots: [...shoulderSlots().slice(0, 5), ...armsSlots().slice(0, 4), ...coreSlots().slice(0, 3)] },
  ],
  5: BODYBUILDING_TEMPLATES[5],
  6: BODYBUILDING_TEMPLATES[6],
};

// ─── TEMPLATES MARATÓN / RUNNING ─────────────────────────────────────────────
function runningLegStrengthSlots() {
  return [
    slot('run_sq',    'Cuádriceps', 'Sentadilla trasera con barra (moderado)', 'Sentadilla goblet', 'Fuerza base para running. Moderado.', 'Técnica primero.', '', { seriesOv: '3', repsOv: '8-10' }),
    slot('run_rdl',   'Isquiotibiales', 'Peso muerto rumano con barra', 'Peso muerto rumano con mancuernas', 'Isquios: prevención de lesiones en running.', 'Mismo patrón.', '', { seriesOv: '3', repsOv: '8-10' }),
    slot('run_zan',   'Pierna', 'Zancadas caminando con mancuernas', 'Step-up al cajón', 'Simula patrón de zancada. Control.', 'Empuja con talón.', '', { seriesOv: '3', repsOv: '10/pierna' }),
    slot('run_bul',   'Pierna', 'Sentadilla búlgara', 'Hip thrust con barra', 'Fuerza unilateral: clave para running.', 'Activa glúteo.', '', { seriesOv: '3', repsOv: '8/pierna' }),
    slot('run_gem',   'Gemelos', 'Elevación de talones de pie unilateral', 'Elevación en escalón', 'Prevención de tendinitis de Aquiles.', 'Rango completo.', '', { seriesOv: '4', repsOv: '15-20' }),
    slot('run_core1', 'Core', 'Plancha frontal', 'Plancha lateral', 'Core fuerte = mejor zancada.', '30-40 s cada lado.', '', { seriesOv: '3', repsOv: '45-60 s', noRegistro: true }),
    slot('run_core2', 'Core', 'Dead bug', 'Bird dog', 'Control lumbopélvico para eficiencia de carrera.', '10 reps/lado.', '', { seriesOv: '3', repsOv: '10/lado', noRegistro: true }),
  ];
}

function runningUpperSlots() {
  return [
    slot('run_jal',  'Espalda', 'Jalón al pecho agarre ancho', 'Remo con mancuerna unilateral', 'Postura en carrera: espalda fuerte.', 'Espalda neutra.', '', { seriesOv: '3', repsOv: '10-12' }),
    slot('run_rem',  'Espalda', 'Remo en polea baja', 'Remo en máquina sentado', 'Retracción escapular para hombros sanos.', 'Aprieta omóplatos.', '', { seriesOv: '3', repsOv: '12' }),
    slot('run_pm',   'Hombro', 'Press militar con mancuernas ligero', 'Elevaciones laterales', 'Hombros fuertes = brazos eficientes en running.', 'Sin impulso.', '', { seriesOv: '3', repsOv: '12-15' }),
    slot('run_fp',   'Hombro posterior', 'Face pull en polea alta', 'Pájaros en banco', 'Salud articular.', 'Carga mínima.', '', { seriesOv: '3', repsOv: '15' }),
    slot('run_core3','Core', 'Crunch lento con peso', 'Russian twist con disco', 'Core = potencia transferida al suelo.', 'Rota desde torso.', '', { seriesOv: '3', repsOv: '15', noRegistro: true }),
    slot('run_core4','Core', 'Plancha con toque de hombro', 'Elevaciones de piernas tumbado', 'Estabilidad anti-rotación para la zancada.', 'Lumbar pegada.', '', { seriesOv: '3', repsOv: '12/lado', noRegistro: true }),
  ];
}

const ENDURANCE_TEMPLATES = {
  3: [
    {
      dia: 'Día 1 — Fuerza pierna (apoyo running)',
      enfoque: 'Cuádriceps + Isquiotibiales + Core',
      calentamiento: '10 min: trote suave + skipping + talones al glúteo + zancadas dinámicas.',
      slots: runningLegStrengthSlots(),
    },
    {
      dia: 'Día 2 — Cardio largo (zona 2) + Core',
      enfoque: 'Resistencia cardiovascular + estabilidad',
      tipoSesion: 'cardio',
      calentamiento: '5-10 min: trote muy suave. Empieza al 50 % del ritmo objetivo.',
      slots: [
        cardioSlot('rod_z2', 'Cardio zona 2', 'Rodaje largo zona 2 (35-60 min)', 'Bicicleta en zona 2 (40-60 min)', 'Ritmo en el que puedes hablar frases cortas. FC 60-70 % máx.', 'Si no puedes correr: bicicleta o elíptica al mismo %FC.'),
        ...coreSlots(),
      ],
    },
    {
      dia: 'Día 3 — Fuerza superior + Series de velocidad',
      enfoque: 'Tren superior + Estímulo anaeróbico',
      calentamiento: '8 min: rotaciones de hombro, bandas, activación dorsal.',
      slots: [
        ...runningUpperSlots(),
        cardioSlot('series', 'Cardio anaeróbico', 'Series 6×400 m al 80-85 % VO2max', 'Intervalos 8×200 m en cinta', '2 min descanso entre series.', '200 m rápido / 100 m suave.'),
      ],
    },
  ],
  4: [
    { dia: 'Día 1 — Fuerza pierna (prevención lesiones)', enfoque: 'Tren inferior + Core', calentamiento: '10 min: trote suave + movilidad dinámica.', slots: runningLegStrengthSlots() },
    { dia: 'Día 2 — Rodaje largo zona 2', enfoque: 'Resistencia aeróbica de base', tipoSesion: 'cardio', calentamiento: '5 min trote muy suave.', slots: [cardioSlot('rod_l', 'Cardio zona 2', 'Rodaje largo 45-75 min zona 2', 'Elíptica o bicicleta 50-70 min zona 2', 'FC 60-70 % máximo. Ritmo conversacional.', 'Si no puedes correr fuera, usa máquina.'), ...coreSlots().slice(0, 3)] },
    { dia: 'Día 3 — Fuerza superior + Core', enfoque: 'Tren superior + Estabilidad', calentamiento: '8 min: movilidad hombro y espalda.', slots: runningUpperSlots() },
    { dia: 'Día 4 — Series de velocidad + Pierna potencia', enfoque: 'Velocidad + Fuerza explosiva', tipoSesion: 'functional', calentamiento: '10 min: trote + ejercicios de carrera.', slots: [
      cardioSlot('ser2', 'Intervalos', 'Series 8×400 m al 85 % / 90 s descanso', 'HIIT en cinta: 20 s sprint / 40 s suave ×12', '90 s de recuperación andando.', 'Ritmo alto, no al máximo.'),
      slot('run_sal', 'Potencia pierna', 'Saltos al cajón', 'Drop jump desde cajón', 'Aterrizaje suave, rodillas amortiguadas.', 'Cae y vuelve a saltar sin pausa.', '', { seriesOv: '4', repsOv: '8-10' }),
      slot('run_sk',  'Pierna potencia', 'Skater squat o pistol asistido', 'Step-up explosivo', 'Unilateral, fuerza específica de running.', 'Explosión en la extensión.', '', { seriesOv: '3', repsOv: '8/pierna' }),
      ...coreSlots().slice(0, 3),
    ]},
  ],
  5: [
    { dia: 'Día 1 — Fuerza pierna', enfoque: 'Tren inferior + Core', calentamiento: '10 min: trote + movilidad.', slots: runningLegStrengthSlots() },
    { dia: 'Día 2 — Rodaje largo zona 2', enfoque: 'Resistencia base', tipoSesion: 'cardio', calentamiento: '5 min trote suave.', slots: [cardioSlot('rl2', 'Zona 2', 'Rodaje largo 50-80 min zona 2', 'Bicicleta 60-80 min zona 2', 'FC 60-70 %. Conversar casi sin problemas.', 'Mismo % FC en bicicleta.'), ...coreSlots().slice(0, 3)] },
    { dia: 'Día 3 — Fuerza superior + Movilidad', enfoque: 'Tren superior', calentamiento: '8 min: movilidad.', slots: runningUpperSlots() },
    { dia: 'Día 4 — Series cortas + Potencia pierna', enfoque: 'Velocidad + Explosividad', tipoSesion: 'functional', calentamiento: '10 min: trote + skipping.', slots: [
      cardioSlot('ser3', 'Intervalos', 'Series 10×200 m al 90 % / 90 s descanso', 'HIIT 15 s máximo / 45 s suave ×15', '200 m muy rápido, caminas la vuelta.', 'Bicicleta en el mismo formato.'),
      ...runningLegStrengthSlots().slice(2, 5),
      ...coreSlots().slice(0, 2),
    ]},
    { dia: 'Día 5 — Rodaje suave + Estiramientos', enfoque: 'Recuperación activa', tipoSesion: 'cardio', calentamiento: '5 min caminata.', slots: [
      cardioSlot('jog', 'Recuperación', 'Rodaje suave 25-35 min zona 1', 'Caminata rápida o elíptica suave', 'Muy fácil. Solo mueve las piernas.', 'Lo mismo pero más fácil aún.'),
      ...coreSlots().slice(3),
    ]},
  ],
};

// ─── TEMPLATES HYROX / FUNCIONAL ─────────────────────────────────────────────
function hyroxStrengthSlots() {
  return [
    slot('hx_rdl',   'Cadena posterior', 'Peso muerto con barra', 'Peso muerto con mancuernas', 'Fuerza base para sled y carries.', 'Mismo patrón con mancuernas.', '', { seriesOv: '4', repsOv: '5-8', descansoOv: '120-180 s' }),
    slot('hx_sq',    'Cuádriceps', 'Sentadilla con barra', 'Sentadilla con kettlebell (goblet)', 'Profundidad competitiva HYROX.', 'Peso frente, espalda recta.', '', { seriesOv: '4', repsOv: '6-8', descansoOv: '120 s' }),
    slot('hx_pm',    'Hombro/Pecho', 'Press militar con barra de pie', 'Thrusters con mancuernas', 'Fuerza de empuje vertical. Clave en wall balls.', 'Sentadilla + press en un movimiento.', '', { seriesOv: '4', repsOv: '6-10', descansoOv: '90-120 s' }),
    slot('hx_rem',   'Espalda', 'Remo ergómetro (5 min ritmo HYROX)', 'Remo en máquina o con barra', '3-4 min al ritmo de competición.', 'Tirón al ombligo, espalda recta.', '', { seriesOv: '4', repsOv: '12', descansoOv: '90 s' }),
    slot('hx_lunge', 'Pierna', 'Zancadas caminando con peso (mancuernas o barra)', 'Farmer carry + zancadas', 'Simula la prueba de lunges HYROX.', '2 pesos en manos + zancadas.', '', { seriesOv: '4', repsOv: '12/pierna', descansoOv: '90 s' }),
    slot('hx_pull',  'Espalda', 'Jalón al pecho o dominadas', 'TRX row explosivo', 'Fuerza de tirón. Mejora el sled pull.', 'Explosión en la subida.', '', { seriesOv: '3', repsOv: '8-10', descansoOv: '90 s' }),
    slot('hx_core',  'Core', 'Plancha frontal', 'Hollow body hold', 'Core: evita lesiones en circuitos.', '20-30 s mantenido.', '', { seriesOv: '3', repsOv: '45-60 s', noRegistro: true }),
  ];
}

function hyroxCondSlots() {
  return [
    cardioSlot('hx_ski', 'Cardio / Ski erg', 'Remo ergómetro (simulador ski erg) 4×1000 m', 'Cuerda de batalla 4×30 s / 30 s', 'Ritmo de competición. 2 min descanso.', '30 s máximo, 30 s suave.'),
    slot('hx_wb',    'Full body', 'Sentadilla + press con balón medicinal (wall ball)', 'Thruster con mancuerna + salto', 'Simula wall balls HYROX. Patrón continuo.', 'Thruster + salto encima de un step.', '', { seriesOv: '4', repsOv: '15-20', descansoOv: '90 s' }),
    slot('hx_burp',  'HIIT', 'Burpee + salto al cajón', 'Burpee broad jump', 'Sin pausa entre reps. Ritmo sostenible.', 'Salto de longitud.', '', { seriesOv: '4', repsOv: '10-12', descansoOv: '60-90 s' }),
    slot('hx_fc',    'Full body', 'Farmer carry (2 mancuernas pesadas 20-30 m)', 'Bolsa de arena o mochila cargada 30 m', 'Muñecas neutras, no inclines torso.', 'Simula sandbag carry.', '', { seriesOv: '4', repsOv: '30 m', descansoOv: '60 s', noRegistro: true }),
    slot('hx_box',   'Pierna / Potencia', 'Saltos al cajón (box jump)', 'Step-up explosivo al cajón', 'Aterrizaje suave. Sin bloquear rodillas.', 'Empuja con talón, explosión.', '', { seriesOv: '4', repsOv: '10', descansoOv: '60 s' }),
    slot('hx_mtn',   'HIIT', 'Mountain climbers (20 s) + plank (20 s)', 'Skipping alto 20 s + sentadilla 10 reps', 'Sin descanso entre los dos ejercicios.', 'Mismo formato de trabajo.', '', { seriesOv: '4', repsOv: '20 s cada', descansoOv: '45 s', noRegistro: true }),
  ];
}

function hyroxSimulacroSlots() {
  return [
    cardioSlot('hx_sim1', 'HYROX simulacro', 'Circuito HYROX completo (55-75 min)', 'Versión reducida 30 min (4 estaciones)', 'Remo 1000 m → Ski erg 1000 m → Burpee box 50 → Wall ball 100 → Farmer carry 200 m → Sled/prensa 8×10.', '4 estaciones ×3 vueltas, 1 min descanso entre.'),
    slot('hx_mob', 'Recuperación', 'Estiramientos dinámicos + movilidad cadera 15 min', 'Foam roller + estiramientos 10 min', 'Post-simulacro: recupera bien.', 'Rodillo en isquios, gemelos y espalda.', '', { seriesOv: '1', repsOv: '15 min', noRegistro: true }),
  ];
}

const HYROX_TEMPLATES = {
  3: [
    { dia: 'Día 1 — Fuerza base (sled, carries, rowing)', enfoque: 'Fuerza funcional compuesta', slots: hyroxStrengthSlots() },
    { dia: 'Día 2 — Acondicionamiento metabólico', enfoque: 'Cardio + HIIT funcional', tipoSesion: 'functional', calentamiento: '10 min: movilidad general, box step, jumping jacks, sentadillas.', slots: hyroxCondSlots() },
    { dia: 'Día 3 — Simulacro HYROX + Recuperación', enfoque: 'Competición simulada', tipoSesion: 'functional', calentamiento: '10 min: trote suave + ejercicios de activación.', slots: hyroxSimulacroSlots() },
  ],
  4: [
    { dia: 'Día 1 — Fuerza base', enfoque: 'Fuerza funcional compuesta', slots: hyroxStrengthSlots() },
    { dia: 'Día 2 — Acondicionamiento metabólico A', enfoque: 'Cardio + HIIT', tipoSesion: 'functional', calentamiento: '10 min activación.', slots: hyroxCondSlots() },
    { dia: 'Día 3 — Fuerza accesoria + Remo', enfoque: 'Espalda + Pierna + Cardio', calentamiento: '8 min: remo suave + movilidad.', slots: [
      ...pullSlots().slice(0, 4),
      slot('hx_hip', 'Glúteo', 'Hip thrust con barra', 'Sentadilla búlgara', 'Potencia de cadera = mejor sled.', 'Unilateral, paso largo.', '', { seriesOv: '4', repsOv: '10', descansoOv: '90 s' }),
      cardioSlot('hx_row2', 'Remo', 'Remo ergómetro 3×2000 m (ritmo progresivo)', 'Remo en cinta o simulador 20 min progresivo', '2 min de descanso activo entre series.', 'Empieza suave, termina fuerte.'),
    ]},
    { dia: 'Día 4 — Simulacro / AMRAP', enfoque: 'Competición simulada + Pierna', tipoSesion: 'functional', calentamiento: '10 min trote + activación.', slots: [
      ...hyroxCondSlots().slice(1),
      ...runningLegStrengthSlots().slice(0, 3),
    ]},
  ],
  5: [
    { dia: 'Día 1 — Fuerza base pesada', enfoque: 'Fuerza funcional', slots: hyroxStrengthSlots() },
    { dia: 'Día 2 — Remo + Acondicionamiento', enfoque: 'Cardio + HIIT funcional', tipoSesion: 'functional', calentamiento: '10 min activación.', slots: hyroxCondSlots() },
    { dia: 'Día 3 — Espalda + Pierna accesoria', enfoque: 'Tirón + Pierna posterior', calentamiento: '8 min: remo ligero.', slots: [...pullSlots().slice(0, 5), ...legSlots().filter(s => ['rdl', 'curl_fem', 'hip_thrust'].includes(s.id))] },
    { dia: 'Día 4 — Simulacro HYROX completo', enfoque: 'Competición simulada', tipoSesion: 'functional', calentamiento: '10 min: trote + activación completa.', slots: hyroxSimulacroSlots() },
    { dia: 'Día 5 — Zonas 2 + Core + Movilidad', enfoque: 'Recuperación activa + Resistencia base', tipoSesion: 'cardio', calentamiento: '5 min suave.', slots: [
      cardioSlot('hx_z2', 'Zona 2', 'Remo ergómetro 30 min zona 2', 'Bicicleta o caminata rápida 35 min zona 2', 'FC 60-70 %. No te canses para el lunes.', 'FC 60-70 %.'),
      ...coreSlots(),
    ]},
  ],
};

// ─── TEMPLATES FUERZA MÁXIMA (Powerlifting) ──────────────────────────────────
function strengthSquatSlots() {
  return [
    slot('pl_sq1', 'Cuádriceps', 'Sentadilla trasera con barra (trabajo pesado 85-90 %)', 'Sentadilla pausa', 'Sets de 3-5 reps. Mínimo 5 min entre series.', '2-3 s abajo, explosivo arriba.', '', { seriesOv: '5', repsOv: '3-5', descansoOv: '240-300 s' }),
    slot('pl_sq2', 'Cuádriceps', 'Sentadilla de volumen (70-75 %)', 'Sentadilla box', 'Sets de 6-8 con buena técnica.', 'Llega al box, no te sientes.', '', { seriesOv: '4', repsOv: '5-8', descansoOv: '180 s' }),
    slot('pl_zan', 'Pierna', 'Zancadas búlgaras con barra', 'Prensa inclinada pies altos', 'Accesorio para fuerza unilateral.', 'ROM completo.', '', { seriesOv: '3', repsOv: '8/pierna', descansoOv: '120 s' }),
    slot('pl_gem', 'Gemelos', 'Elevación de talones', 'Gemelo en prensa', 'Prevención y recuperación.', 'Rango completo.', '', { seriesOv: '4', repsOv: '15', descansoOv: '60 s' }),
    slot('pl_core1','Core', 'Plancha con peso en espalda', 'Ab wheel rollout', 'Core fuerte = mejor sentadilla.', 'Sin perder lumbar.', '', { seriesOv: '3', repsOv: '45 s', noRegistro: true }),
  ];
}

function strengthBenchSlots() {
  return [
    slot('pl_bp1', 'Pecho', 'Press banca con barra (trabajo pesado 85-90 %)', 'Press banca con pausa', 'Sets de 3-5 reps. Descanso completo.', 'Pausa 1-2 s en pecho, subida explosiva.', '', { seriesOv: '5', repsOv: '3-5', descansoOv: '240-300 s' }),
    slot('pl_bp2', 'Pecho', 'Press banca volumen (70-75 %)', 'Press inclinado con barra', '5×5 o 4×8 según programación.', 'Banco 30°, compuesto.', '', { seriesOv: '4', repsOv: '5-8', descansoOv: '180 s' }),
    slot('pl_dip', 'Tríceps', 'Fondos en paralelas lastrados', 'Press cerrado con barra', 'Tríceps: clave en la extensión del banca.', 'Agarre estrecho, codos no excesivo.', '', { seriesOv: '4', repsOv: '8-10', descansoOv: '120 s' }),
    slot('pl_fp',  'Hombro posterior', 'Face pull en polea alta', 'Pájaros inversos', 'Salud articular. Siempre incluir.', 'Mancuernas pequeñas.', '', { seriesOv: '3', repsOv: '15-20', descansoOv: '60 s' }),
    slot('pl_tric','Tríceps', 'Extensiones en polea alta (cuerda)', 'Press francés con mancuerna', 'Volumen accesorio.', 'Codo quieto.', '', { seriesOv: '3', repsOv: '10-12', descansoOv: '60 s' }),
  ];
}

function strengthDeadliftSlots() {
  return [
    slot('pl_dl1', 'Espalda', 'Peso muerto convencional (trabajo pesado 85-90 %)', 'Peso muerto sumo (variante)', 'El rey. Espalda neutra. Mínimo 5 min descanso.', 'Pies más abiertos, punta afuera.', '', { seriesOv: '4', repsOv: '2-4', descansoOv: '300-360 s' }),
    slot('pl_dl2', 'Espalda', 'Peso muerto rumano (volumen, 60-65 %)', 'Peso muerto en déficit', 'Isquios y lumbar. Excelente accesorio.', 'Pie en plataforma de 5-10 cm.', '', { seriesOv: '4', repsOv: '6-8', descansoOv: '180 s' }),
    slot('pl_row', 'Espalda', 'Remo inclinado con barra (pesado)', 'Remo Pendlay', 'Espalda fuerte = mejor peso muerto.', 'Barra al suelo entre cada rep.', '', { seriesOv: '4', repsOv: '6-8', descansoOv: '120-180 s' }),
    slot('pl_jalon','Espalda', 'Jalón al pecho o dominadas', 'Pullover en polea', 'Dorsal: crucial para bloquear peso muerto.', 'Brazos casi rectos, tira desde codos.', '', { seriesOv: '3', repsOv: '8-10', descansoOv: '90 s' }),
    slot('pl_core2','Core', 'Pallof press en polea', 'Ab wheel rollout', 'Anti-rotación para peso muerto.', 'Extiende sin arquear.', '', { seriesOv: '3', repsOv: '12/lado', noRegistro: true }),
  ];
}

const STRENGTH_TEMPLATES = {
  3: [
    { dia: 'Día 1 — Sentadilla (Squat day)', enfoque: 'Cuádriceps + Core (fuerza máxima)', calentamiento: '12-15 min: movilidad cadera/tobillo, sentadillas vacías ×20, series progresivas hasta el 60-70-80 % del peso de trabajo.', slots: strengthSquatSlots() },
    { dia: 'Día 2 — Banca (Bench day)', enfoque: 'Pecho + Tríceps (fuerza máxima)', calentamiento: '10 min: rotaciones de hombro, bandas pull-apart, series progresivas banca al 60-70-80 %.', slots: strengthBenchSlots() },
    { dia: 'Día 3 — Peso muerto (Deadlift day)', enfoque: 'Espalda + Cadena posterior (fuerza máxima)', calentamiento: '12 min: movilidad de cadera, peso muerto ligero ×10, series progresivas al 60-70-80 %.', slots: strengthDeadliftSlots() },
  ],
  4: [
    { dia: 'Día 1 — Sentadilla pesada', enfoque: 'Cuádriceps + Core', calentamiento: '12-15 min: sentadillas vacías + series progresivas.', slots: strengthSquatSlots() },
    { dia: 'Día 2 — Banca pesada + Hombros accesorios', enfoque: 'Pecho + Hombros + Tríceps', calentamiento: '10 min: rotaciones + series progresivas banca.', slots: [...strengthBenchSlots(), ...shoulderSlots().slice(2, 5)] },
    { dia: 'Día 3 — Peso muerto pesado', enfoque: 'Espalda + Cadena posterior', calentamiento: '12 min: activación + series progresivas peso muerto.', slots: strengthDeadliftSlots() },
    { dia: 'Día 4 — Sentadilla volumen + Banca volumen (accesorios)', enfoque: 'Volumen accesorio en los tres levantamientos', calentamiento: '10 min: movilidad general.', slots: [
      ...strengthSquatSlots().slice(1, 3),
      ...strengthBenchSlots().slice(1, 4),
      ...coreSlots().slice(0, 3),
    ]},
  ],
  5: [
    { dia: 'Día 1 — Sentadilla pesada', enfoque: 'Squat day', calentamiento: '12-15 min: series progresivas.', slots: strengthSquatSlots() },
    { dia: 'Día 2 — Banca pesada', enfoque: 'Bench day', calentamiento: '10 min: rotaciones + series progresivas.', slots: strengthBenchSlots() },
    { dia: 'Día 3 — Peso muerto pesado', enfoque: 'Deadlift day', calentamiento: '12 min: activación + progresivas.', slots: strengthDeadliftSlots() },
    { dia: 'Día 4 — Sentadilla volumen + Accesorios pierna', enfoque: 'Volumen pierna', calentamiento: '10 min.', slots: [...strengthSquatSlots().slice(1), ...legSlots().filter(s => ['curl_fem', 'hip_thrust', 'gemelo_pie'].includes(s.id))] },
    { dia: 'Día 5 — Banca volumen + Espalda + Core', enfoque: 'Volumen empuje + Tirón + Core', calentamiento: '10 min: rotaciones.', slots: [...strengthBenchSlots().slice(1), ...pullSlots().slice(0, 4), ...coreSlots().slice(0, 2)] },
  ],
};

// ─── GLÚTEO / FÚTBOL focus (hereda standard, modifica días de piernas) ────────
function gluteFocusedLegSlots() {
  return [
    slot('glt_ht',   'Glúteo', 'Hip thrust con barra (pesado)', 'Hip thrust unilateral', 'Prioridad máxima. Pausa 2 s arriba.', 'Más difícil. Máxima contracción.', '', { seriesOv: '5', repsOv: '8-10', descansoOv: '90-120 s' }),
    slot('glt_sq',   'Cuádriceps', 'Sentadilla sumo con barra o mancuerna', 'Sentadilla búlgara', 'Pies más abiertos: más glúteo.', 'Paso largo, torso erguido.', '', { seriesOv: '4', repsOv: '8-10', descansoOv: '90 s' }),
    slot('glt_rdl',  'Isquiotibiales', 'Peso muerto rumano con barra', 'Curl de femoral en fitball', 'Máximo estiramiento isquios.', 'Control excéntrico máximo.', '', { seriesOv: '4', repsOv: '10', descansoOv: '90 s' }),
    slot('glt_abd',  'Glúteo medio', 'Abducción de cadera en máquina', 'Clamshell con banda de resistencia', 'Glúteo medio: estabilidad de cadera.', 'Rodillas flexionadas.', '', { seriesOv: '4', repsOv: '15-20', descansoOv: '60 s' }),
    slot('glt_zan',  'Glúteo/Pierna', 'Zancadas búlgaras con mancuernas', 'Step-up al cajón con mancuernas', 'Talón delantero empujando: más glúteo.', 'Sube con el talón.', '', { seriesOv: '3', repsOv: '10/pierna', descansoOv: '90 s' }),
    slot('glt_pat',  'Glúteo', 'Patada de glúteo en polea baja', 'Extensión de cadera en máquina', 'Aisla glúteo. Cadera fija.', 'No arquees lumbar.', '', { seriesOv: '3', repsOv: '15/pierna', descansoOv: '60 s' }),
    slot('glt_gem',  'Gemelos', 'Elevación de talones de pie unilateral', 'Gemelo en prensa', 'Pausa arriba 2 s.', 'Rango completo.', '', { seriesOv: '4', repsOv: '15', descansoOv: '60 s' }),
  ];
}

function footballLegSlots() {
  return [
    slot('fb_sq',  'Cuádriceps', 'Sentadilla con barra (explosiva)', 'Sentadilla búlgara', 'Subida explosiva. Potencia para sprint.', 'Unilateral, simula salida rápida.', '', { seriesOv: '4', repsOv: '6-8', descansoOv: '120 s' }),
    slot('fb_ht',  'Glúteo', 'Hip thrust con barra', 'Puente glúteo unilateral', 'Potencia de cadera = más sprint.', 'Máxima extensión arriba.', '', { seriesOv: '4', repsOv: '8-10', descansoOv: '90 s' }),
    slot('fb_rdl', 'Isquiotibiales', 'Peso muerto rumano', 'Nordic curl', 'Prevención de lesiones de isquios.', 'Excéntrica lenta, previene rotura.', '', { seriesOv: '4', repsOv: '8-10', descansoOv: '90 s' }),
    slot('fb_sk',  'Estabilidad', 'Skater squat asistido', 'Zancada lateral con mancuerna', 'Cambios de dirección. Cadera estable.', 'Paso lateral amplio, rodilla estable.', '', { seriesOv: '3', repsOv: '8/pierna', descansoOv: '90 s' }),
    slot('fb_cj',  'Potencia', 'Salto al cajón (box jump)', 'Drop jump desde cajón', 'Potencia explosiva. Aterrizaje amortiguado.', 'Aterriza y salta sin pausa.', '', { seriesOv: '4', repsOv: '6-8', descansoOv: '90-120 s' }),
    slot('fb_gem', 'Gemelos', 'Elevación de talones de pie', 'Saltos de gemelo', 'Prevención de lesiones en sprint.', 'Explosivo, simula sprint.', '', { seriesOv: '4', repsOv: '15', descansoOv: '60 s' }),
    slot('fb_cor', 'Core', 'Plancha con rotación de cadera', 'Pallof press en polea', 'Estabilidad anti-rotación: clave en fútbol.', 'Resiste rotación con brazos al frente.', '', { seriesOv: '3', repsOv: '45 s / 12/lado', noRegistro: true }),
  ];
}

// ─── SELECTOR PRINCIPAL DE TEMPLATES ─────────────────────────────────────────
const TEMPLATE_MAP = {
  standard:     STANDARD_TEMPLATES,
  bodybuilding: BODYBUILDING_TEMPLATES,
  aesthetics:   AESTHETICS_TEMPLATES,
  endurance:    ENDURANCE_TEMPLATES,
  functional:   HYROX_TEMPLATES,
  strength:     STRENGTH_TEMPLATES,
};

function selectTemplate(input) {
  const modality = input.personalizacion?.trainingModality || 'standard';
  const dias = input.diasEntrenoSemana;

  // Templates especializados por modality
  const map = TEMPLATE_MAP[modality];
  if (map) {
    const template = map[dias] || map[Math.min(dias, Math.max(...Object.keys(map).map(Number)))] || map[Object.keys(map)[0]];
    if (template) return { template, modality };
  }

  // Glúteo o fútbol: standard con override de días de piernas
  const focus = input.personalizacion?.exerciseFocus;
  const standardTpl = STANDARD_TEMPLATES[dias] || STANDARD_TEMPLATES[3];
  if (focus === 'gluteos') {
    return {
      template: standardTpl.map(s => isLegSession(s) ? { ...s, dia: s.dia.replace(/Piernas?/i, 'Piernas + Glúteos'), enfoque: 'Glúteo + Tren inferior', slots: gluteFocusedLegSlots() } : s),
      modality: 'standard',
    };
  }
  if (focus === 'futbol') {
    return {
      template: standardTpl.map(s => isLegSession(s) ? { ...s, dia: s.dia.replace(/Piernas?/i, 'Piernas — Fútbol'), enfoque: 'Potencia, estabilidad y resistencia para fútbol', slots: footballLegSlots() } : s),
      modality: 'standard',
    };
  }

  return { template: standardTpl, modality: 'standard' };
}

function isLegSession(session) {
  return /pierna|leg|glúteo|gluteo|inferior|cuádriceps/i.test(`${session.dia} ${session.enfoque}`);
}

// ─── SELECTOR DE TEMPLATE CON AJUSTE POR OBJETIVO ────────────────────────────
function selectTemplateWithGoal(input) {
  // Si el objetivo es ganar_fuerza y no hay modality específica detectada → usar strength
  const { template, modality } = selectTemplate(input);
  if (modality === 'standard' && input.objetivo === 'ganar_fuerza') {
    const strengthTpl = STRENGTH_TEMPLATES;
    const dias = input.diasEntrenoSemana;
    const t = strengthTpl[dias] || strengthTpl[Math.min(dias, Math.max(...Object.keys(strengthTpl).map(Number)))];
    if (t) return { template: t, modality: 'strength' };
  }
  return { template, modality };
}

// ─── GENERADOR PRINCIPAL ──────────────────────────────────────────────────────
export function generateExercisePlan(input) {
  const dias = input.diasEntrenoSemana;
  const nivel = EXPERIENCE_LEVEL[input.experiencia] ?? EXPERIENCE_LEVEL.principiante;
  const { template, modality } = selectTemplateWithGoal(input);
  const timeProfile = getTimeProfile(input.tiempoSesion || 60);

  const semanas = [1, 2, 3, 4].map((num) => {
    const bloque = num <= 2 ? 'A' : 'B';
    return {
      numero: num,
      label: `Semana ${num}`,
      bloque,
      bloqueDescripcion: buildWeekDescription(num, modality),
      sesiones: buildSesiones(template, nivel, dias, bloque, timeProfile),
    };
  });

  const resumen = buildResumen(input, dias, modality, nivel);
  const principios = buildPrincipios(input, modality);

  return {
    resumen,
    principios,
    semanas,
    descansoEntreSesiones: buildDescanso(dias, modality),
  };
}

function buildWeekDescription(num, modality) {
  const base = {
    standard: ['Base de volumen e intensidad.', 'Igual que semana 1. Intenta añadir 2.5-5 kg en ejercicios principales.', 'Cambia a variante B. Sube intensidad o baja descansos 10-15 s.', 'Pico de intensidad. Máximo esfuerzo en los principales.'],
    bodybuilding: ['Volumen base. Aprende los ejercicios y los rangos.', 'Mismo esquema: añade peso donde llegues al límite superior de reps.', 'Introduce técnicas avanzadas: rest-pause, drop sets en el último set de aislamiento.', 'Semana pico: máximo volumen tolerable. Después descarga.'],
    aesthetics: ['Hipertrofia base. Foco en conexión mente-músculo.', 'Añade carga progresiva. Mantén técnica perfecta.', 'Introduce drop sets o supersets en ejercicios de aislamiento.', 'Intensidad máxima. Puedes reducir reps y añadir más peso.'],
    endurance: ['Base aeróbica. Acumula volumen de zona 2.', 'Misma estructura, añade 5 min a los rodajes largos.', 'Introduce más series en los intervalos o reduce tiempos de descanso.', 'Semana de carga máxima o semana de descarga (-30 % volumen) según plan de competición.'],
    functional: ['Aprende los patrones y las cargas. No vayas al máximo.', 'Añade 5-10 % de carga en los ejercicios de fuerza.', 'Reduce descansos 10-15 s en el acondicionamiento. Añade reps.', 'Simulacro a intensidad de competición. Después descarga.'],
    strength: ['Semana de adaptación. Trabaja al 75-80 % del 1RM.', '80-85 % del 1RM. Añade 2.5 kg si completaste todas las series.', '85-90 % del 1RM. Aquí empieza la fuerza real.', 'Test de fuerza o semana de descarga (50-60 % del 1RM, técnica perfecta).'],
  };
  const desc = base[modality] || base.standard;
  return desc[num - 1] || `Semana ${num}: progresión continua.`;
}

function buildResumen(input, dias, modality, nivel) {
  const modalityLabels = {
    standard: 'Hipertrofia / Fitness general',
    bodybuilding: 'Culturismo competitivo',
    aesthetics: 'Estética y proporción',
    endurance: 'Resistencia / Running',
    functional: 'HYROX / Fitness funcional',
    strength: 'Fuerza máxima / Powerlifting',
  };

  const cardioExtra = {
    standard: dias <= 3
      ? 'Añade 1-2 sesiones de cardio suave (20-30 min) en los días libres si tu objetivo incluye definición.'
      : 'Cardio opcional: 1-2 sesiones de 20 min caminata rápida o bici en días de descanso.',
    bodybuilding: 'Cardio post-entreno (20 min bici/cinta zona 2) en días de piernas para mejorar recuperación y definición.',
    aesthetics: 'Añade 2-3 sesiones de cardio moderado (25-30 min) en días libres para mejorar la composición corporal.',
    endurance: 'Los rodajes están integrados en el plan. Prioriza el sueño y la nutrición alrededor de los rodajes largos.',
    functional: 'El acondicionamiento metabólico ya está en el plan. No añadas cardio extra los primeros meses: recupera bien.',
    strength: 'Cardio mínimo: 1-2 sesiones suaves de 20-25 min (zona 2). No comprometas la recuperación para los levantamientos pesados.',
  };

  const tiempo = input.tiempoSesion || 60;
  const tiempoLabel = `${tiempo} min/sesión`;

  return {
    diasPorSemana: dias,
    semanasPlan: 4,
    experiencia: input.experiencia,
    nivelLabel: labelExperience(input.experiencia),
    objetivo: input.objetivo,
    modalidadEntrenamiento: modalityLabels[modality] || 'General',
    enfoquePersonalizado: input.personalizacion?.label || null,
    focusTecnico: modality,
    tiempoSesion: tiempoLabel,
    cardioExtra: cardioExtra[modality] || cardioExtra.standard,
    rotacion: 'Semanas 1-2 variante A; semanas 3-4 variante B con más carga o técnicas avanzadas.',
  };
}

function buildPrincipios(input, modality) {
  const base = [
    'Progresión: cuando alcances el límite alto de repeticiones en todas las series, sube el peso 2.5-5 kg.',
    'Anota el peso usado en cada sesión para ver tu evolución semana a semana.',
    'Técnica antes que peso: 10 reps limpias valen más que 15 mal hechas.',
    'Duerme 7-9 h; la recuperación ocurre fuera del gimnasio.',
    'Si sientes dolor articular agudo, detente y consulta con un profesional.',
  ];

  const extras = {
    bodybuilding: [
      'Conexión mente-músculo: siente el músculo que trabajas en cada rep, no solo muevas el peso.',
      'Drop sets (semanas 3-4): en el último set de aislamiento, baja el peso un 20-30 % y lleva al fallo.',
    ],
    aesthetics: [
      'Combina el plan con un déficit calórico moderado (-200-300 kcal) si buscas definición.',
      'Foco en los "músculos de exposición": hombros anchos, pecho definido, cintura estrecha con core fuerte.',
    ],
    endurance: [
      'Nunca hagas fuerza de pierna pesada el día antes de un rodaje largo.',
      'La semana de competición: reduce volumen al 50 %, mantén algo de intensidad el martes/miércoles.',
    ],
    functional: [
      'La clave en HYROX es la gestión del ritmo: practica el "pace" de competición desde el principio.',
      'Combina remo, ski erg y running en el mismo entrenamiento para acostumbrar las transiciones.',
    ],
    strength: [
      'Deloads cada 4-6 semanas: reduce el 40-50 % del volumen total. Es parte del progreso.',
      'Técnica impecable al 85 %+ del 1RM: si la pierdes, el peso es demasiado.',
    ],
  };

  const principios = [...base];
  if (extras[modality]) principios.unshift(...extras[modality]);
  if (input.personalizacion?.detectado) {
    principios.unshift(`Plan adaptado a: ${input.personalizacion.label}.`);
  }

  return principios;
}

function buildDescanso(dias, modality) {
  if (modality === 'strength') return 'Descansa al menos 72 h antes de volver a trabajar el mismo levantamiento principal (squat, banca, peso muerto).';
  if (modality === 'endurance') return 'Deja al menos 48 h entre la sesión de fuerza de pierna y el rodaje largo. Prioriza el descanso nocturno.';
  if (dias >= 6) return 'Alterna grupos musculares. Evita entrenar el mismo músculo si aún lo notas dolorido.';
  return 'Deja al menos 48 h entre sesiones del mismo grupo muscular.';
}
