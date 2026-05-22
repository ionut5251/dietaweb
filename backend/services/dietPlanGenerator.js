import {
  MEAL_TEMPLATES,
  MEAL_SLOTS_BY_COUNT,
  MEAL_LABELS,
  DAY_NAMES,
} from '../data/mealTemplates.js';

const WEEKS_IN_PLAN = 4;

function distributeMacros(targets, numMeals) {
  return {
    calorias: Math.round(targets.calorias / numMeals),
    proteinasG: Math.round(targets.proteinasG / numMeals),
    carbohidratosG: Math.round(targets.carbohidratosG / numMeals),
    grasasG: Math.round(targets.grasasG / numMeals),
  };
}

function pickMeal(slot, globalIndex) {
  const options = MEAL_TEMPLATES[slot] ?? MEAL_TEMPLATES.comida;
  return options[globalIndex % options.length];
}

function buildDayMeals(slots, perMeal, globalDayIndex, objetivoLabel) {
  return slots.map((slot, mealIdx) => {
    const index = globalDayIndex * 5 + mealIdx;
    const opcion = pickMeal(slot, index);
    return {
      momento: MEAL_LABELS[slot],
      horarioSugerido: suggestTime(slot, slots.length),
      objetivoComida: perMeal,
      plato: opcion.nombre,
      instrucciones: opcion.descripcion,
      consejo: mealTip(slot, objetivoLabel),
    };
  });
}

function buildMonthlyWeeks(slots, perMeal, objetivoLabel) {
  const semanas = [];

  for (let w = 0; w < WEEKS_IN_PLAN; w++) {
    const dias = [];
    for (let d = 0; d < 7; d++) {
      const globalDayIndex = w * 7 + d;
      dias.push({
        diaSemana: DAY_NAMES[d],
        numeroDia: d + 1,
        diaDelMes: globalDayIndex + 1,
        comidas: buildDayMeals(slots, perMeal, globalDayIndex, objetivoLabel),
      });
    }
    semanas.push({
      numero: w + 1,
      label: `Semana ${w + 1}`,
      dias,
    });
  }

  return semanas;
}

export function generateDietPlan(input, targets) {
  const numMeals = input.comidasPorDia;
  const slots = MEAL_SLOTS_BY_COUNT[numMeals] ?? MEAL_SLOTS_BY_COUNT[3];
  const perMeal = distributeMacros(targets, numMeals);
  const semanas = buildMonthlyWeeks(slots, perMeal, targets.objetivoLabel);
  const hidratacionMl = Math.round(input.pesoKg * 35);

  const todosPlatos = new Set();
  semanas.forEach((s) =>
    s.dias.forEach((d) => d.comidas.forEach((c) => todosPlatos.add(c.plato))),
  );

  return {
    resumen: {
      objetivo: targets.objetivoLabel,
      caloriasDiarias: targets.calorias,
      macros: {
        proteinas: `${targets.proteinasG} g`,
        carbohidratos: `${targets.carbohidratosG} g`,
        grasas: `${targets.grasasG} g`,
      },
      comidasAlDia: numMeals,
      duracionSemanas: WEEKS_IN_PLAN,
      hidratacion: `${hidratacionMl} ml de agua al día (aprox.)`,
    },
    reglasGenerales: [
      'Plan mensual: cada semana repite la estructura de 7 días con menús distintos para no aburrirte.',
      'Puedes intercambiar comidas del mismo tipo (ej. dos cenas de pescado) si un día no te apetece ese plato.',
      'Prioriza alimentos reales: verdura, proteína magra, legumbres, cereales integrales.',
      'Cocina con poca sal; usa especias, limón y hierbas.',
      'Este plan es orientativo: consulta a un dietista si tienes patologías o embarazo.',
    ],
    planMensual: {
      semanas,
      nota:
        'Menú semanal variado durante 4 semanas. Usa el calendario para ver cada día; los platos cambian respecto al día anterior.',
    },
    listaCompraSemanal: buildShoppingList([...todosPlatos]),
  };
}

function suggestTime(slot, total) {
  const times = {
    desayuno: '08:00',
    media_manana: '11:00',
    comida: total <= 2 ? '14:00' : '13:30',
    merienda: '17:30',
    cena: '21:00',
  };
  return times[slot] ?? '12:00';
}

function mealTip(slot, objetivo) {
  if (slot === 'cena') return 'Cena ligera pero con proteína; evita fritos y refrescos.';
  if (objetivo.includes('Perder')) return 'En esta comida, llena la mitad del plato con verdura.';
  return 'Come con calma (15-20 min) para mejorar la saciedad.';
}

function buildShoppingList(platos) {
  const base = [
    'Proteínas: huevos, pollo/pavo, pescado, legumbres, yogur o requesón',
    'Carbohidratos: avena, arroz integral, pasta integral, pan integral, patata/boniato',
    'Grasas saludables: aceite de oliva, frutos secos (porción pequeña)',
    'Verdura y fruta: variada, de temporada (5 raciones/día como referencia)',
  ];
  return {
    base,
    platosPlan: platos.slice(0, 20).join(', ') + (platos.length > 20 ? '…' : ''),
    totalPlatosUnicos: platos.length,
  };
}
