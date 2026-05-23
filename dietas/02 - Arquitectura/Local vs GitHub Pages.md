# Local vs GitHub Pages

## Comparativa

| Aspecto | Local (`npm start`) | GitHub Pages |
|---------|---------------------|--------------|
| URL | http://localhost:3000 | https://ionut5251.github.io/dietaweb/ |
| Motor de planes | API Express `/api/plans` | `import` de `/dietaweb/shared/*.js` |
| Archivos servidos | `frontend/` + `/shared` | Raíz: `index.html`, `css/`, `js/`, `shared/` |
| Base path | `/` | `/dietaweb/` (ver `config.js`) |
| Backend Node | Sí | No |

## Detección en código

`frontend/js/config.js`:

- `useLocalEngine()` → `true` si `hostname.endsWith('github.io')`
- `getBasePath()` → `/dietaweb/` si la ruta empieza por `dietaweb`

## Sincronización raíz ↔ frontend

GitHub Pages (rama `main`) sirve la **raíz** del repo, no la carpeta `frontend/`.

Por eso existen **copias** en raíz (`index.html`, `css/`, `js/`).

Tras editar `frontend/`:

```powershell
npm run sync:pages
```

Script: `scripts/sync-pages-root.ps1`. Ver [[Sincronizar Pages]].

## Despliegue automático

Workflow: `.github/workflows/deploy-pages.yml`  
Empaqueta `index.html`, `css/`, `js/`, `shared/` en artefacto `_site`.

Si en Settings → Pages usas **GitHub Actions**, ese artefacto es lo publicado.  
Si usas **branch main / root**, se publican los mismos archivos del commit.

## Relacionado

- [[Git y GitHub]]
- [[Raiz y despliegue]]
