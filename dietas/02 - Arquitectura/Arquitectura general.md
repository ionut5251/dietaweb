# Arquitectura general

## Capas

```
┌─────────────────────────────────────────┐
│  Presentación (frontend/ + raíz Pages)   │
│  index.html, css/, js/render, main...    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Acceso a datos (frontend/js/api.js)     │
│  localhost → API  |  github.io → shared  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Dominio (shared/)                       │
│  validate, nutrition, diet, exercise     │
└─────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Infra local (backend/)                  │
│  Express, estáticos, /api/plans          │
└─────────────────────────────────────────┘
```

## Módulos clave en `shared/`

| Archivo | Responsabilidad |
|---------|-----------------|
| `config/constants.js` | Límites, objetivos, factores actividad |
| `data/mealTemplates.js` | Platos por tipo de comida |
| `services/nutritionCalculator.js` | BMR, TDEE, macros |
| `services/dietPlanGenerator.js` | 4 semanas × 7 días de comidas |
| `services/exercisePlanGenerator.js` | 4 semanas, slots con variante A/B |
| `utils/validateInput.js` | Validación del formulario |
| `generatePlan.js` | Orquesta todo el plan |
| `getOptions.js` | Opciones de selects |

## Duplicación conocida (deuda técnica)

Existen copias antiguas en `backend/services/` y `backend/data/`. **No editar**; usar `shared/`. Ver [[Que tocar y que no]].

## Relacionado

- [[Flujo de datos]]
- [[Local vs GitHub Pages]]
- [[Shared]]
- [[Backend]]
- [[Frontend]]
