# Carpeta `shared/`

## Rol

**Única fuente de verdad** para generar planes. Usada por:

- `backend/routes/plans.js` (API local)
- `frontend/js/api.js` (import dinámico en GitHub Pages)

## Archivos

```
shared/
├── config/constants.js      # ACTIVITY_FACTORS, GOALS, LIMITS
├── data/mealTemplates.js    # Platos por slot (desayuno, comida…)
├── services/
│   ├── nutritionCalculator.js
│   ├── dietPlanGenerator.js
│   └── exercisePlanGenerator.js
├── utils/validateInput.js
├── generatePlan.js          # buildFullPlan()
└── getOptions.js            # opciones del formulario
```

## Puntos de extensión

| Cambio | Archivo |
|--------|---------|
| Nuevo objetivo (ej. recomposición) | `constants.js` + `nutritionCalculator.js` |
| Más variedad comida | `mealTemplates.js` |
| Nueva split de gym (8 días…) | `exercisePlanGenerator.js` → `SPLIT_TEMPLATES` |
| Nuevo campo formulario | `validateInput.js` + HTML + `render.js` |

## Consumo en Pages

URL efectiva: `https://ionut5251.github.io/dietaweb/shared/generatePlan.js`  
(import desde `api.js` con `getBasePath()`)

Ver: [[Flujo de datos]], [[Que tocar y que no]].
