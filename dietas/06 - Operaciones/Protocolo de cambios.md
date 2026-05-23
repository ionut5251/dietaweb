# Protocolo de cambios

Checklist **obligatorio** en cada sesión de desarrollo (humano o IA).

## 1. Antes de codificar

- [ ] Leer [[CONTEXTO-IA]] o [[Que tocar y que no]]
- [ ] Confirmar si el cambio es en `shared/`, `frontend/` o ambos

## 2. Implementar

- [ ] Cambios mínimos y acordes al estilo existente
- [ ] Probar en local: `npm start` → http://localhost:3000

## 3. Sincronizar despliegue

- [ ] Si tocaste `frontend/` → `npm run sync:pages`
- [ ] Si tocaste solo `shared/` → no hace falta sync (ya está en raíz)

## 4. Documentar (bóveda Obsidian)

- [ ] Actualizar notas afectadas en `dietas/` (mapa, funcionalidad, estado)
- [ ] Mover ítems entre [[Completado]], [[En progreso]], [[Pendiente]]
- [ ] Actualizar fecha en [[Home]] si hubo cambios relevantes
- [ ] Si cambia arquitectura → [[CONTEXTO-IA]] y [[Arquitectura general]]

## 5. Publicar

```powershell
git add .
git commit -m "tipo: descripción"
git push origin main
```

- [ ] Verificar Actions en verde (si usas Pages por Actions)
- [ ] Probar https://ionut5251.github.io/dietaweb/

## 6. Para IA en otra máquina

Adjuntar o pegar el contenido de [[CONTEXTO-IA]] al inicio del chat.

---
Regla del proyecto: **código + documentación + Git** van juntos, nunca solo uno.
