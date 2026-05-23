# Sincronizar Pages

## Por qué hace falta

- **Desarrollo:** editas en `frontend/`
- **GitHub Pages (rama main):** sirve archivos en la **raíz** del repo

Sin sincronizar, la web pública queda desactualizada aunque `frontend/` esté bien.

## Comando

```powershell
npm run sync:pages
```

Equivale a `scripts/sync-pages-root.ps1`:

1. Copia `frontend/index.html` → `index.html`
2. Reemplaza `css/` y `js/` en raíz

**No copia** `shared/` (ya vive en raíz y es única).

## Cuándo ejecutarlo

- Siempre después de cambiar HTML/CSS/JS en `frontend/`
- Antes de `git commit` si vas a publicar

## Workflow Actions

El workflow también empaqueta raíz (`index.html`, `css`, `js`, `shared`).  
Si solo usas Actions y **no** branch deploy, igual conviene sync para mantener raíz coherente en el repo.

Ver: [[Raiz y despliegue]], [[Local vs GitHub Pages]].
