# Integración IA (OpenAI)

## Por qué OpenAI GPT-4o

| Modelo | Uso | Motivo |
|--------|-----|--------|
| **gpt-4o-mini** | Refinar dietas y rutinas (texto) | Rápido, económico, JSON fiable |
| **gpt-4o** | Análisis de fotos de progreso | Visión + texto en un solo proveedor |

Alternativas (Claude, Gemini) posibles en el futuro; la capa está en `backend/services/openaiService.js`.

## Arquitectura segura

```
Navegador (Pages)  →  Cloudflare Worker  →  OpenAI API
                      (OPENAI_API_KEY secret)

Local / Cloud      →  Express /api/ai     →  OpenAI API
                      (backend/.env)
```

**La clave NUNCA va en el frontend ni en GitHub.**

## Flujo al generar plan

1. Motor de **reglas** genera plan base (`shared/generatePlan.js`) — siempre, instantáneo.
2. Si IA activa y hay personalización → **GPT-4o-mini** refina (reglas extra, sustituciones ejercicios, notas entrenador).
3. `shared/ai/mergeEnhancement.js` fusiona respuesta JSON en el plan.

## Activar en GitHub Pages (ahora)

1. Despliega Worker: [[Cloudflare Worker IA]] o `cloudflare/ai-proxy/README.md`
2. Edita `deploy-config.json`:
   ```json
   { "aiEnabled": true, "aiProxyUrl": "https://tu-worker.workers.dev" }
   ```
3. Push → Pages recarga config.

## Activar en local

```powershell
cd backend
copy .env.example .env
# Edita OPENAI_API_KEY=sk-...
npm install
npm start
```

## Activar en servidor cloud (próximo mes)

Mismo backend Express; variable `OPENAI_API_KEY` en el servidor. Sin Worker.

## API endpoints

| Ruta | Descripción |
|------|-------------|
| `GET /api/ai/status` | ¿IA configurada? |
| `POST /api/ai/enhance-plan` | `{ input, basePlan }` → plan refinado |
| `POST /api/ai/analyze-photo` | `{ imageBase64, context }` → análisis GPT-4o |

Worker expone las mismas rutas sin prefijo `/api/ai`.

## Fotos de progreso (futuro)

- Endpoint listo: `analyzeProgressPhoto()` en `frontend/js/api.js`
- Falta UI de cuentas + subida semanal → [[Pendiente]]
- Ejemplo respuesta: zonas mejoradas, «flotador» abdominal, recomendaciones.

## Archivos

- `shared/ai/prompts.js` — prompts profesionales
- `shared/ai/mergeEnhancement.js` — fusión segura
- `backend/services/openaiService.js` — cliente OpenAI
- `cloudflare/ai-proxy/` — proxy Pages

Ver: [[Personalizacion y modos]], [[CONTEXTO-IA]]
