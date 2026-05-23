# Registro de pesos

## Comportamiento

- Input numérico bajo cada ejercicio con `registrarPeso: true`
- Se guarda en **localStorage** del navegador
- Clave: `web-dieta-pesos:{planId}:s{semana}:ses{sesion}:{exerciseId}`
- `planId` nuevo en cada “Generar mi plan” (`sessionStorage`)

## Archivos

- `frontend/js/tracking.js` — load/save/bind
- `frontend/js/render.js` — genera inputs con `data-exercise-id`, `data-semana`, `data-sesion`
- `main.js` — `setPlanId()` al generar

## Limitaciones

- No sincroniza entre dispositivos
- Se pierde si limpias datos del navegador
- Nuevo plan = nuevo `planId` (pesos anteriores no se migran)

## Mejoras futuras

- Export CSV de progreso
- Gráfica simple por ejercicio

Estado: ✅ Completado (MVP localStorage).
