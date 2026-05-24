# CONTEXTO-IA — Pegar esto a una IA sin historial previo

> Documento maestro. Si solo puedes leer un archivo, que sea este. Detalle ampliado en las notas enlazadas con `[[wikilinks]]`.

---

## 1. Resumen ejecutivo

**Web Dieta** (`web-dieta` / repo `dietaweb`) es una SPA que, como **invitado**, pide datos corporales y de estilo de vida y devuelve:

1. Perfil energético (BMR, TDEE, calorías, macros).
2. **Plan de dieta:** 4 semanas × 7 días, menú distinto cada día, calendario interactivo.
3. **Plan de ejercicio:** 4 semanas en acordeón; bloques A (sem. 1–2) y B (sem. 3–4) con variantes del mismo músculo; campo de **peso usado (kg)** guardado en `localStorage`.

**No hay base de datos ni login.** Los planes son orientativos, no médicos.

---

## 2. Por qué existe y hacia dónde va

| | |
|---|---|
| **Problema** | Obtener un plan de dieta + gym comprensible sin pagar dietista/entrenador de entrada. |
| **Objetivo actual** | MVP funcional en local y en GitHub Pages. |
| **Dirección** | Mejorar variedad de menús, feedback de usuarios (Issues), export PDF. **Hecho:** 3 modos de plan + personalización por texto. Ver [[Personalizacion y modos]]. |

---

## 3. Arquitectura en 30 segundos

```
Usuario → index.html (formulario)
       → api.js
            ├─ localhost → POST /api/plans/* (Express)
            └─ github.io → import /shared/*.js (sin servidor)
       → render.js + interactions.js + tracking.js
       → Plan en pantalla
```

- **Fuente de verdad de la lógica:** carpeta `shared/` (cálculos, validación, generadores).
- **Desarrollo local:** `backend/` sirve API + estáticos desde `frontend/`.
- **Producción (Pages):** raíz del repo: `index.html`, `css/`, `js/`, `shared/` + `.nojekyll`.

Detalle: [[Arquitectura general]], [[Flujo de datos]], [[Local vs GitHub Pages]].

---

## 4. Estructura de carpetas (repo)

```
web dieta/
├── dietas/              ← BÓVEDA OBSIDIAN (documentación, esta carpeta)
├── shared/              ← TOCAR para lógica de planes (prioridad)
├── frontend/            ← TOCAR para UI (fuente de diseño)
├── backend/             ← TOCAR para API local
├── css/, js/, index.html  ← COPIA para Pages; sync con npm run sync:pages
├── scripts/             ← sync-pages-root.ps1
├── docs/GITHUB.md       ← guía Git/Pages (resumida en bóveda)
└── .github/workflows/   ← deploy Pages
```

---

## 5. Qué TOCAR y qué NO

### ✅ Modificar con normalidad

| Ruta | Cuándo |
|------|--------|
| `shared/**` | Cambiar cálculos, menús, rutinas, validación |
| `frontend/**` | HTML, CSS, JS de interfaz |
| `backend/routes/`, `backend/server.js` | Solo si cambia la API local |
| `dietas/**` | Siempre al documentar cambios |
| `index.html`, `css/`, `js/` en raíz | Tras `npm run sync:pages` si cambiaste `frontend/` |

### ⚠️ Modificar con cuidado

| Ruta | Motivo |
|------|--------|
| `frontend/js/config.js` | Detecta `github.io` vs localhost y `getBasePath()` (`/dietaweb/`) |
| `frontend/js/api.js` | Bifurca motor local vs API |
| `.github/workflows/deploy-pages.yml` | Despliegue automático |

### ❌ Evitar sin motivo

| Ruta | Motivo |
|------|--------|
| `backend/services/`, `backend/data/` | **Duplicados legacy**; la lógica viva está en `shared/`. No editar aquí salvo migración/eliminación planificada |
| `backend/config/constants.js` | Duplicado de `shared/config/constants.js` |
| `dietas/.obsidian/` | Config del editor; no afecta la app |
| `.env`, secretos | No usados aún; no commitear |

Tabla completa: [[Que tocar y que no]].

---

## 6. Estado de funcionalidades (2026-05-22)

### Completado ✅

- Formulario invitado con validación → [[Formulario invitado]]
- Cálculo BMR/TDEE/macros (Mifflin-St Jeor) → `shared/services/nutritionCalculator.js`
- Plan dieta 4 semanas, menú diario variado, calendario → [[Plan de dieta]]
- Plan ejercicio 4 semanas, bloques A/B, acordeones → [[Plan de ejercicio]]
- Registro peso por ejercicio (localStorage) → [[Registro de pesos]]
- **Tres modos:** solo dieta, solo gym, completo → [[Personalizacion y modos]]
- Campo «Qué buscas mejorar» con detección de enfoque (fútbol, glúteos, piernas…)
- Objetivo **Recomposición corporal**
- GitHub repo + Pages + `index.html` en raíz → [[Git y GitHub]]
- Motor en navegador para Pages (`shared/`) → [[Local vs GitHub Pages]]

### En progreso 🟡

- Documentación Obsidian (esta bóveda) — en curso de mantenimiento continuo

### Pendiente ⬜

- Eliminar duplicados `backend/services` (usar solo `shared`)
- Tests automatizados
- Export PDF / imprimir plan
- Issues plantilla para testers
- Backend en la nube (opcional; hoy no hace falta para Pages)

Listas vivas: [[Completado]], [[En progreso]], [[Pendiente]].

---

## 7. Flujo de trabajo obligatorio al cambiar código

1. Editar código (respetar `shared/` como núcleo).
2. Si tocaste `frontend/`: `npm run sync:pages`.
3. Probar local: `npm start` → http://localhost:3000
4. Actualizar notas en `dietas/` (estado, mapa de archivos si aplica).
5. `git add .` → `git commit -m "..."` → `git push`
6. Esperar Actions (Pages) 1–2 min; probar https://ionut5251.github.io/dietaweb/

Detalle: [[Protocolo de cambios]], [[Actualizar documentacion]].

---

## 8. Comandos esenciales

```powershell
cd "ruta\al\proyecto\web dieta"
npm run install:all   # primera vez
npm start             # local
npm run sync:pages    # copiar frontend → raíz (Pages)
git add . ; git commit -m "mensaje" ; git push
```

---

## 9. API local (solo desarrollo)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/plans/options` | Opciones de formulario |
| POST | `/api/plans/generate` | Body JSON del formulario → plan completo |

Implementación: `backend/routes/plans.js` → importa `shared/generatePlan.js` y `shared/getOptions.js`.

---

## 10. Enlaces a notas detalladas

- [[Home]] — índice visual de la bóveda
- [[Proposito]] · [[Roadmap]]
- [[Arquitectura general]] · [[Flujo de datos]]
- [[Shared]] · [[Frontend]] · [[Backend]]
- [[Plan de dieta]] · [[Plan de ejercicio]]
- [[Git y GitHub]] · [[Sincronizar Pages]]

---

## 11. Meta

| Campo | Valor |
|-------|--------|
| Repo | `ionut5251/dietaweb` |
| Rama principal | `main` |
| URL Pages | https://ionut5251.github.io/dietaweb/ |
| Bóveda Obsidian | `dietas/` (carpeta en el repo) |
| Idioma UI | Español |
| Stack | Node.js Express, HTML/CSS/JS vanilla, ES modules |

*Al terminar una sesión de desarrollo, actualiza la fecha en [[Home]] y las listas de [[Completado]] / [[Pendiente]].*
