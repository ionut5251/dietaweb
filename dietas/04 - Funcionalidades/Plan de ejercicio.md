# Plan de ejercicio

## Qué ve el usuario

- 4 acordeones: **Semana 1 … 4**
- Bloque A (sem. 1–2) y Bloque B (sem. 3–4) — misma sesión, **ejercicio alternativo**
- Por sesión: calentamiento, lista de ejercicios (series/reps/descanso), enfriamiento
- Campo **Peso usado (kg)** bajo ejercicios de fuerza

## Lógica

- `shared/services/exercisePlanGenerator.js`
- `SPLIT_TEMPLATES` según días/semana (2–7)
- Cada ejercicio es un `slot` con `varianteA` y `varianteB`
- Ejemplo: curl mancuernas (A) → curl barra Z (B)

## UI

- `render.js` → `renderExercise()`, `renderWeekAccordion()`
- `interactions.js` → acordeones + primera semana abierta por defecto

## Cardio extra

Texto según objetivo `perder_grasa` en `resumen.cardioExtra`.

Estado: ✅ Completado.

Ver: [[Registro de pesos]].
