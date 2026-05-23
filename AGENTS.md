# Instrucciones para agentes de código (IA)

Antes de modificar este repositorio, lee la documentación del proyecto:

1. **Contexto completo:** `dietas/00 - Inicio/CONTEXTO-IA.md`
2. **Índice Obsidian:** `dietas/00 - Inicio/Home.md`
3. **Protocolo obligatorio:** `dietas/06 - Operaciones/Protocolo de cambios.md`

## Reglas rápidas

- Lógica de planes → editar `shared/`, no `backend/services/` (legacy).
- Interfaz → `frontend/` y luego `npm run sync:pages`.
- Tras cambios → actualizar notas en `dietas/` y hacer `git push`.
- No commitear secretos ni `node_modules/`.

Demo: https://ionut5251.github.io/dietaweb/
