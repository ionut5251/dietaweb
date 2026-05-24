# Personalización y modos de plan

## Tres modos (`modo` en API)

| Modo | ID | Genera |
|------|-----|--------|
| Solo dieta | `dieta` | `planDieta` |
| Solo gym | `ejercicio` | `planEjercicio` |
| Completo | `completo` | ambos |

Pantalla inicial: 3 tarjetas grandes → formulario adaptado.

## Campo «Qué buscas mejorar»

- Texto libre opcional (`queBuscaMejorar`, máx. 500 caracteres)
- **No usa IA externa**: motor de reglas en `shared/services/personalizationEngine.js`
- Detecta palabras clave: fútbol, glúteos, piernas, espalda, brazos, resistencia, definición…

## Efectos

| Detección | Dieta | Gym |
|-----------|-------|-----|
| Fútbol | +carbos, tips hidratación | Días pierna → rutina fútbol (potencia, lateral, core) |
| Glúteos | +proteína, tips | Pierna → hip thrust, sumo, patada glúteo |
| Piernas | carbs pre-entreno | Pierna intensiva |
| Recomposición (objetivo) | déficit ligero + proteína alta | — |

## Objetivo nuevo

`recomposicion_corporal` en `shared/config/constants.js` — déficit ~5 %, proteína 2.3 g/kg.

## Archivos clave

- `shared/services/personalizationEngine.js`
- `shared/utils/validateInput.js` — validación por modo
- `shared/generatePlan.js` — orquestación
- `frontend/index.html` — landing + formularios
- `frontend/js/main.js` — navegación modos

Ver: [[Formulario invitado]], [[Plan de dieta]], [[Plan de ejercicio]], [[CONTEXTO-IA]]
