# Carpeta `backend/`

## Rol

Servidor **solo para desarrollo local**. No se ejecuta en GitHub Pages.

## Archivos activos

| Archivo | Función |
|---------|---------|
| `server.js` | Express, CORS, estáticos `frontend/` + `/shared` |
| `routes/plans.js` | GET options, POST generate → llama `shared/` |
| `package.json` | express, cors |

## Archivos legacy (no editar)

- `services/*.js`
- `data/mealTemplates.js`
- `config/constants.js`
- `utils/validateInput.js`

Son copias antiguas antes de extraer `shared/`. Plan: eliminar en [[Pendiente]].

## Arranque

```powershell
npm run install:all
npm start   # puerto 3000
npm run dev # --watch
```

Ver: [[Local vs GitHub Pages]], [[Arquitectura general]].
