# Git y GitHub

## Remoto

- **URL:** https://github.com/ionut5251/dietaweb
- **Rama:** `main`
- **Pages:** https://ionut5251.github.io/dietaweb/

## Flujo estándar

```powershell
cd "ruta\al\proyecto\web dieta"

# Si cambiaste frontend/
npm run sync:pages

git add .
git status
git commit -m "tipo: descripción clara"
git push origin main
```

## Tipos de commit sugeridos

| Prefijo | Uso |
|---------|-----|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `docs:` | Solo bóveda Obsidian / README |
| `chore:` | sync pages, deps, workflow |

## Pages: dos modos válidos

1. **GitHub Actions** (workflow `deploy-pages.yml`) — recomendado
2. **Branch `main` / root** — funciona con `index.html` + `.nojekyll` en raíz

## Problemas frecuentes

| Síntoma | Solución |
|---------|----------|
| Se ve README en vez de la app | Comprobar `index.html` y `.nojekyll` en raíz; Ctrl+F5 |
| Cambios en frontend no en web | `npm run sync:pages` y push |
| Push rechazado | `git pull origin main` antes de push |

Ver también: `docs/GITHUB.md` (guía corta en repo).

Relacionado: [[Sincronizar Pages]], [[Protocolo de cambios]].
