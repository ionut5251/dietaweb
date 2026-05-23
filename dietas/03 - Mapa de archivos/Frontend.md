# Carpeta `frontend/`

## Rol

Interfaz de usuario (fuente de diseño). En producción se **copia** a la raíz del repo.

## Archivos

```
frontend/
├── index.html
├── css/
│   ├── variables.css   # tokens de color
│   ├── base.css
│   └── components.css  # cards, calendario, acordeones, pesos
└── js/
    ├── main.js         # formulario, submit
    ├── api.js          # fetch API vs shared
    ├── config.js       # base path, github.io
    ├── render.js       # HTML de resultados
    ├── interactions.js # calendario dieta, acordeón gym
    └── tracking.js     # localStorage pesos
```

## Flujo UI

1. `main.js` carga opciones (`fetchOptions`)
2. Submit → `generatePlan` → `renderProfile`, `renderDiet`, `renderExercise`
3. `bindPlanInteractions()` — calendario y semanas

## Después de editar

```powershell
npm run sync:pages
```

Ver: [[Sincronizar Pages]], [[Raiz y despliegue]].
