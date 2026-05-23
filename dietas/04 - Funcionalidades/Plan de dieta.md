# Plan de dieta

## Qué ve el usuario

- Resumen: calorías, macros, hidratación, 4 semanas
- **Calendario:** pestañas Semana 1–4 + días Lu–Do
- Detalle por día: cada comida con plato, instrucciones, macros aproximados
- Reglas generales + lista de la compra

## Lógica

- `shared/services/dietPlanGenerator.js`
- Plantillas: `shared/data/mealTemplates.js`
- 28 índices de rotación (4×7) para variar platos
- Slots según `comidasPorDia` (1–5 comidas)

## UI

- `frontend/js/render.js` → `renderDiet()`
- `frontend/js/interactions.js` → `bindDietCalendar()`

## Mejoras futuras

- Más plantillas por temporada
- Respetar restricciones sustituyendo platos automáticamente (hoy solo texto en reglas)

Estado: ✅ Completado.

Relacionado: [[Flujo de datos]], [[Plan de ejercicio]].
