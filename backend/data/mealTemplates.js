/** Plantillas ampliadas para rotar 4 semanas × 7 días sin repetir el mismo plato cada día */
export const MEAL_TEMPLATES = {
  desayuno: [
    { nombre: 'Avena con leche y fruta', descripcion: '50 g avena + 200 ml leche + plátano o manzana.' },
    { nombre: 'Tostadas integrales con huevo', descripcion: '2 rebanadas + 2 huevos revueltos + tomate.' },
    { nombre: 'Yogur griego con frutos secos', descripcion: '150 g yogur + 20 g almendras + arándanos.' },
    { nombre: 'Tortilla francesa con pan', descripcion: '2 huevos en tortilla + 1 rebanada pan integral.' },
    { nombre: 'Batido avena-plátano', descripcion: 'Leche 250 ml + 40 g avena + plátano + canela.' },
    { nombre: 'Requesón con miel y nueces', descripcion: '150 g requesón + 1 cdta miel + 15 g nueces.' },
    { nombre: 'Porridge de quinoa', descripcion: '50 g quinoa cocida + leche + frutos rojos.' },
    { nombre: 'Huevos pochados y aguacate', descripcion: '2 huevos pochados + 1/2 aguacate + pan integral.' },
  ],
  media_manana: [
    { nombre: 'Fruta y puñado de nueces', descripcion: '1 pieza de fruta + 15 g nueces.' },
    { nombre: 'Batido ligero proteico', descripcion: 'Leche o vegetal + 1 cdta mantequilla cacahuete.' },
    { nombre: 'Zanahoria y hummus', descripcion: 'Bastones zanahoria + 3 cdas hummus.' },
    { nombre: 'Yogur natural', descripcion: '125 g yogur + 1 cucharada semillas chía.' },
    { nombre: 'Manzana con queso fresco', descripcion: '1 manzana + 40 g queso fresco.' },
  ],
  comida: [
    { nombre: 'Pollo al horno con arroz integral', descripcion: '150 g pollo + 80 g arroz + brócoli al vapor.' },
    { nombre: 'Pasta integral con atún', descripcion: '80 g pasta + 1 lata atún + aceite oliva 1 cda.' },
    { nombre: 'Lentejas estofadas con huevo', descripcion: 'Plato legumbre + huevo cocido + ensalada verde.' },
    { nombre: 'Pavo salteado con quinoa', descripcion: '150 g pavo + 60 g quinoa + pimientos.' },
    { nombre: 'Merluza con patata y ensalada', descripcion: '180 g pescado + patata mediana + ensalada.' },
    { nombre: 'Garbanzos con arroz y verduras', descripcion: 'Legumbre + arroz + mix verduras salteadas.' },
    { nombre: 'Ternera magra con boniatos', descripcion: '120 g ternera + boniato asado + espárragos.' },
    { nombre: 'Ensalada completa con huevo', descripcion: 'Lechuga, tomate, atún/huevo, aguacate, garbanzos.' },
    { nombre: 'Wok de tofu o pollo', descripcion: 'Proteína 150 g + verduras + arroz basmati 70 g.' },
    { nombre: 'Pechuga rellena con ensalada', descripcion: 'Pechuga rellena espinacas + ensalada grande.' },
  ],
  merienda: [
    { nombre: 'Requesón con pan integral', descripcion: '150 g requesón + 1 rebanada pan.' },
    { nombre: 'Batido casero avena-plátano', descripcion: 'Leche 250 ml + plátano + 20 g avena.' },
    { nombre: 'Hummus con crudités', descripcion: 'Hummus 4 cdas + pepino y zanahoria.' },
    { nombre: 'Fruta con yogur', descripcion: 'Yogur 125 g + fruta de temporada.' },
    { nombre: 'Tortitas de arroz con mantequilla cacahuete', descripcion: '2 tortitas + 1 cdta mantequilla cacahuete.' },
  ],
  cena: [
    { nombre: 'Pescado blanco con verdura', descripcion: '180 g merluza + calabacín y zanahoria al vapor.' },
    { nombre: 'Tortilla de verduras', descripcion: '2-3 huevos + calabacín, cebolla + ensalada.' },
    { nombre: 'Pavo con ensalada templada', descripcion: '150 g pavo + ensalada grande + aceite oliva.' },
    { nombre: 'Revuelto de huevos y espárragos', descripcion: '2 huevos + espárragos + pan integral opcional.' },
    { nombre: 'Salmón al horno con brócoli', descripcion: '150 g salmón + brócoli + limón.' },
    { nombre: 'Crema de verduras con pollo', descripcion: 'Crema casera + 100 g pollo desmenuzado.' },
    { nombre: 'Ensalada de garbanzos', descripcion: 'Garbanzos + tomate, pepino, atún o huevo.' },
    { nombre: 'Pisto con huevo pochado', descripcion: 'Pisto casero + 1-2 huevos pochados.' },
  ],
};

export const MEAL_SLOTS_BY_COUNT = {
  1: ['comida'],
  2: ['comida', 'cena'],
  3: ['desayuno', 'comida', 'cena'],
  4: ['desayuno', 'comida', 'merienda', 'cena'],
  5: ['desayuno', 'media_manana', 'comida', 'merienda', 'cena'],
};

export const MEAL_LABELS = {
  desayuno: 'Desayuno',
  media_manana: 'Media mañana',
  comida: 'Comida',
  merienda: 'Merienda',
  cena: 'Cena',
};

export const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
