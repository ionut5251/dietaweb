# Proxy IA para GitHub Pages

Despliega un Worker gratuito que guarda la clave OpenAI de forma segura.

## Requisitos

- Cuenta [Cloudflare](https://dash.cloudflare.com) (gratis)
- Clave [OpenAI API](https://platform.openai.com/api-keys)
- Node.js con `npm`

## Pasos

```powershell
cd cloudflare/ai-proxy
npm install -g wrangler
wrangler login
wrangler secret put OPENAI_API_KEY
# Pega tu clave sk-...

wrangler deploy
```

Copia la URL que devuelve (ej. `https://dietaweb-ai.tu-usuario.workers.dev`).

## Activar en la web

Edita `deploy-config.json` en la raíz del repo:

```json
{
  "aiEnabled": true,
  "aiProxyUrl": "https://dietaweb-ai.tu-usuario.workers.dev"
}
```

Commit + push. GitHub Pages cargará la config y usará IA al generar planes.

## Endpoints

| Ruta | Uso |
|------|-----|
| GET /status | Comprueba si la IA está activa |
| POST /enhance-plan | Refina plan base con GPT-4o-mini |
| POST /analyze-photo | Análisis visual con GPT-4o (futuro seguimiento) |

## Modelos usados

- **gpt-4o-mini** — texto (planes, barato y rápido)
- **gpt-4o** — visión (fotos de progreso)

## CORS

Por defecto permite `https://ionut5251.github.io`. Edita `ALLOWED_ORIGINS` en `wrangler.toml` si cambias dominio.
