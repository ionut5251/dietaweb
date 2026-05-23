# Raíz del repositorio y despliegue

## Archivos en la raíz relevantes para Pages

| Archivo | Propósito |
|---------|-----------|
| `index.html` | Entrada de la app (copia de frontend) |
| `css/`, `js/` | Assets (copia de frontend) |
| `shared/` | Motor de planes en el navegador |
| `.nojekyll` | Evita que GitHub muestre README en vez de la app |
| `README.md` | Descripción para humanos en GitHub (no es la app) |
| `package.json` | Scripts raíz |
| `docs/GITHUB.md` | Guía Git resumida |
| `.github/workflows/deploy-pages.yml` | CI |

## Qué NO es la app

- `README.md` en GitHub web — solo documentación del repo
- Carpeta `dietas/` — bóveda Obsidian, no se sirve como web pública
- Carpeta `backend/` — no se despliega

## Scripts

| Comando | Efecto |
|---------|--------|
| `npm run sync:pages` | `frontend/` → raíz (`index`, `css`, `js`) |
| `npm start` | Levanta backend + sirve frontend |

## Workflow GitHub Actions

1. Push a `main`
2. Action copia `index.html`, `css`, `js`, `shared` → `_site`
3. Publica en Pages

Ver: [[Git y GitHub]], [[Sincronizar Pages]].
