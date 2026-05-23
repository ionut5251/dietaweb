# Qué tocar y qué no

## Matriz de decisión rápida

| Quiero cambiar… | Editar primero | Luego |
|-----------------|----------------|-------|
| Calorías / macros / fórmulas | `shared/services/nutritionCalculator.js` | Probar local + Pages |
| Menús / platos | `shared/data/mealTemplates.js`, `dietPlanGenerator.js` | Igual |
| Rutinas / variantes gym | `shared/services/exercisePlanGenerator.js` | Igual |
| Validación campos | `shared/utils/validateInput.js` | Igual |
| Diseño / textos UI | `frontend/**` | `npm run sync:pages` |
| API REST local | `backend/routes/plans.js` | — |
| Publicar en web | `npm run sync:pages` + push | — |
| Documentación | `dietas/**` | push |

## ✅ Carpetas seguras (fuente activa)

- `shared/` — **núcleo del producto**
- `frontend/` — **fuente de la interfaz**
- `backend/server.js`, `backend/routes/` — servidor local
- `dietas/` — documentación
- `scripts/` — automatización
- `.github/workflows/` — CI/Pages

## ⚠️ Copias / sincronizadas (no editar a mano como fuente)

| Archivo/carpeta | Regla |
|-----------------|--------|
| `index.html`, `css/`, `js/` en **raíz** | Generados por `npm run sync:pages` desde `frontend/` |
| `backend/services/`, `backend/data/`, `backend/config/` | Legacy duplicado de `shared/` — **pendiente eliminar** |

## ❌ No tocar sin razón

- `node_modules/` (generado)
- `dietas/.obsidian/` (preferencias Obsidian)
- `.env` con secretos (no hay aún)
- `backend/package-lock.json` salvo `npm install` en backend

## Si la IA va a refactorizar

1. Consolidar todo en `shared/` y borrar duplicados backend.
2. No romper `getBasePath()` ni `useLocalEngine()`.
3. Tras mover archivos, actualizar esta nota y [[CONTEXTO-IA]].

Enlaces: [[Shared]], [[Frontend]], [[Backend]], [[Raiz y despliegue]].
