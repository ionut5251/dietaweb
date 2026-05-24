/**
 * Detecta nivel de intensidad desde texto libre y datos del formulario.
 */
const ADVANCED_PATTERNS = [
  /avanzad/i,
  /metab[oó]lic/i,
  /hiit/i,
  /amrap/i,
  /finisher/i,
  /duro/i,
  /intenso/i,
  /influencer/i,
  /instagram/i,
  /profesional/i,
  /sergio peinado/i,
  /much[oa] carga/i,
  /explosiv/i,
  /potencia/i,
];

const METABOLIC_PATTERNS = [/metab[oó]lic/i, /hiit/i, /amrap/i, /finisher/i, /circuito/i, /cardio/i];

export function detectIntensityProfile(input) {
  const text = `${input.queBuscaMejorar || ''} ${input.lesionesLimitaciones || ''}`.toLowerCase();
  const exp = input.experiencia || 'intermedio';

  const wantsAdvanced = ADVANCED_PATTERNS.some((p) => p.test(text)) || exp === 'avanzado';
  const wantsMetabolic = METABOLIC_PATTERNS.some((p) => p.test(text));

  if (wantsAdvanced && wantsMetabolic) return 'avanzado_metabolico';
  if (wantsAdvanced) return 'avanzado';
  if (wantsMetabolic) return 'metabolico';
  if (exp === 'avanzado') return 'avanzado';
  return 'estandar';
}

export function applyIntensityToInput(input) {
  const intensityProfile = detectIntensityProfile(input);
  let experiencia = input.experiencia || 'intermedio';

  if (
    (intensityProfile === 'avanzado' || intensityProfile === 'avanzado_metabolico') &&
    experiencia !== 'avanzado'
  ) {
    experiencia = 'avanzado';
  }

  return { ...input, experiencia, intensityProfile };
}

/** Ejercicio predefinido para plantillas avanzadas */
export function exAdv(nombre, enfoque, series, reps, como, notas = '') {
  return { nombre, enfoque, series, repeticiones: reps, como, notas, descanso: '90-120 s', registrarPeso: true };
}

export function exCardio(nombre, como, duracion = '15-20 min') {
  return {
    nombre,
    enfoque: 'Cardio',
    series: '1',
    repeticiones: duracion,
    como,
    notas: '',
    descanso: '—',
    registrarPeso: false,
  };
}

export function buildAdvancedSplit(dias, metabolic) {
  const splits = {
    4: [
      {
        dia: 'Día 1 — Pecho + Hombro + Core',
        enfoque: 'Torso empuje + abdomen',
        bloques: [
          {
            nombre: 'Principal',
            ejercicios: [
              exAdv('Press banca', 'Pecho', '4', '8-10', 'Subida explosiva controlada', 'Ejercicio rey del día'),
              exAdv('Press inclinado mancuernas', 'Pecho', '3', '8-10', 'Banco 30-45°'),
              exAdv('Press declinado máquina', 'Pecho', '3', '8-10', 'Pecho inferior'),
              exAdv('Aperturas mancuernas', 'Pecho', '3', '12', 'Estiramiento controlado'),
              exAdv('Press militar', 'Hombro', '3', '8', 'Core activo'),
              exAdv('Elevaciones laterales', 'Hombro', '4', '15', 'Sin impulso'),
              exAdv('Fondos o press cerrado', 'Tríceps', '3', '8-10', 'Codos cerca del cuerpo'),
            ],
          },
          {
            nombre: 'Core',
            ejercicios: [
              exAdv('Elevaciones de piernas', 'Core', '3', '12-15', 'Sin balanceo'),
              exAdv('Crunch lento', 'Core', '3', '15', '2 s arriba y abajo'),
              exAdv('Dead bug', 'Core', '3', '12/lado', 'Lumbar pegada'),
              exAdv('Russian twist', 'Core', '3', '12', 'Con peso moderado'),
              exAdv('Plancha frontal', 'Core', '3', '45-60 s', 'Glúteo apretado'),
              exAdv('Plancha lateral', 'Core', '2', '30-45 s/lado', ''),
              exAdv('Pallof press', 'Core', '2', '30 s/lado', 'Resiste rotación'),
            ],
          },
          ...(metabolic
            ? [{ nombre: 'Cardio', ejercicios: [exCardio('Cinta inclinada', 'RPE 7/10, agarre sin apoyarte', '15-20 min')] }]
            : []),
        ],
      },
      {
        dia: 'Día 2 — Piernas + Finisher',
        enfoque: 'Fuerza pierna + condición metabólica',
        bloques: [
          {
            nombre: 'Principal',
            ejercicios: [
              exAdv('Sentadilla barra', 'Pierna', '3', '10', 'Profundidad controlada'),
              exAdv('Sentadilla goblet', 'Pierna', '4', '8', 'Peso al pecho'),
              exAdv('Peso muerto rumano', 'Pierna', '3', '8', 'Bisagra de cadera'),
              exAdv('Hip thrust', 'Glúteo', '3', '10', 'Pausa arriba 2 s'),
              exAdv('Sentadilla búlgara', 'Pierna', '3', '10/pierna', 'Torso erguido'),
              exAdv('Salto al cajón', 'Potencia', '4', '12', 'Aterrizaje suave'),
              exAdv('Gemelo de pie', 'Gemelos', '4', '10+15', '10 explosivo + 15 controlado'),
            ],
          },
          ...(metabolic
            ? [
                {
                  nombre: 'Finisher AMRAP 12-15 min',
                  ejercicios: [
                    exAdv('Assault bike / bici', 'Cardio', '1', '20 cal', 'Ritmo fuerte'),
                    exAdv('Wall balls / sentadilla+press', 'Full body', '1', '15', 'Fluido'),
                    exAdv('Kettlebell swings', 'Cadena posterior', '1', '15', 'Cadera explosiva'),
                    exAdv('Remo en cuerda', 'Espalda', '1', '10', 'Si no hay cuerda: remo mancuerna'),
                    exAdv('Saltos laterales', 'Cardio', '1', '15', 'Side to side'),
                  ],
                },
              ]
            : []),
        ],
      },
      {
        dia: 'Día 3 — Espalda + Bíceps',
        enfoque: 'Tirón horizontal y vertical',
        bloques: [
          {
            nombre: 'Principal',
            ejercicios: [
              exAdv('Dominadas o jalón', 'Espalda', '4', '8-10', 'Pecho alto'),
              exAdv('Remo barra o mancuerna', 'Espalda', '3', '8-10', 'Aprieta omóplatos'),
              exAdv('Remo polea baja', 'Espalda', '3', '12', 'Sin balanceo'),
              exAdv('Face pull', 'Hombro posterior', '3', '15', 'Salud articular'),
              exAdv('Curl barra Z — superserie', 'Bíceps', '3', '10', 'Sin impulso'),
              exAdv('Extensiones tríceps — superserie', 'Tríceps', '3', '10', 'Alterna con curl'),
            ],
          },
          {
            nombre: 'Core (corto)',
            ejercicios: [
              exAdv('Plancha', 'Core', '3', '45 s', ''),
              exAdv('Crunch bicicleta', 'Core', '3', '15/lado', ''),
            ],
          },
          ...(metabolic
            ? [{ nombre: 'Cardio', ejercicios: [exCardio('Cinta inclinada', '8-12% inclinación', '20 min')] }]
            : []),
        ],
      },
      {
        dia: 'Día 4 — Pierna + HIIT',
        enfoque: 'Pierna + circuito intenso',
        bloques: [
          {
            nombre: 'Principal',
            ejercicios: [
              exAdv('Prensa o sentadilla barra', 'Pierna', '3', '10', ''),
              exAdv('Extensión cuádriceps', 'Pierna', '3', '8+8', 'Pierna/pierna + ambas'),
              exAdv('Sentadilla abierta/cerrada', 'Pierna', '3', '12+10', '12 reps + 10 s isométrico'),
              exAdv('Zancadas caminando', 'Pierna', '2', '12/pierna', ''),
              exAdv('Zancadas hacia atrás', 'Pierna', '2', '12/pierna', ''),
              exAdv('Salto al cajón', 'Potencia', '4', '10', ''),
              exAdv('Curl femoral fitball', 'Isquios', '3', '12', 'Cadera estable'),
            ],
          },
          ...(metabolic
            ? [
                {
                  nombre: 'Circuito HIIT 3-4 rondas',
                  ejercicios: [
                    exAdv('Burpees', 'HIIT', '1', '10', 'Sin pausa entre estaciones'),
                    exAdv('Thrusters', 'HIIT', '1', '15', 'Mancuerna o barra ligera'),
                    exAdv('Mountain climbers', 'HIIT', '1', '20', 'Ritmo alto'),
                    exAdv('Battle ropes / skipping', 'HIIT', '1', '30 s', 'Máximo ritmo sostenible'),
                  ],
                },
              ]
            : []),
        ],
      },
    ],
    5: [
      {
        dia: 'Día 1 — Pecho + Hombro + Core',
        enfoque: 'Empuje + abdomen',
        bloques: buildAdvancedSplit(4, metabolic)[0].bloques,
      },
      {
        dia: 'Día 2 — Espalda + Bíceps',
        enfoque: 'Tirón',
        bloques: buildAdvancedSplit(4, metabolic)[2].bloques.filter((b) => b.nombre !== 'Cardio'),
      },
      {
        dia: 'Día 3 — Piernas + Finisher',
        enfoque: 'Fuerza pierna',
        bloques: buildAdvancedSplit(4, metabolic)[1].bloques,
      },
      {
        dia: 'Día 4 — Hombros + Tríceps',
        enfoque: 'Deltoide y brazos',
        bloques: [
          {
            nombre: 'Principal',
            ejercicios: [
              exAdv('Press Arnold', 'Hombro', '4', '8-10', ''),
              exAdv('Elevaciones laterales', 'Hombro', '4', '15', ''),
              exAdv('Pájaros / face pull', 'Hombro posterior', '3', '15', ''),
              exAdv('Press francés', 'Tríceps', '3', '10', ''),
              exAdv('Extensiones polea', 'Tríceps', '3', '12', ''),
              exAdv('Fondos', 'Tríceps', '3', '8-10', ''),
            ],
          },
        ],
      },
      {
        dia: 'Día 5 — Pierna + HIIT',
        enfoque: 'Pierna + condición',
        bloques: buildAdvancedSplit(4, metabolic)[3].bloques,
      },
    ],
  };

  return splits[dias] || splits[4];
}
