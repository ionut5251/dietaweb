# Actualizar documentación

## Qué actualizar según el cambio

| Cambio en código | Notas a revisar |
|------------------|-----------------|
| Nuevo campo formulario | [[Formulario invitado]], `validateInput`, [[CONTEXTO-IA]] §6 |
| Lógica dieta | [[Plan de dieta]], [[Shared]], [[Flujo de datos]] |
| Lógica gym | [[Plan de ejercicio]], [[Shared]] |
| UI / CSS | [[Frontend]], [[Raiz y despliegue]] |
| Git/Pages/deploy | [[Git y GitHub]], [[Sincronizar Pages]] |
| Feature terminada | [[Completado]], quitar de [[Pendiente]], [[Roadmap]] |
| Feature nueva planeada | [[Pendiente]], [[Roadmap]] |
| Archivo movido/eliminado | [[Que tocar y que no]], mapas de carpeta |

## Archivo principal para IA

**[[CONTEXTO-IA]]** — debe reflejar siempre el estado actual del proyecto (sección §6 Estado).

## Obsidian

- Usar wikilinks `[[Nombre de nota]]` entre archivos
- Vista grafo: enlaces desde [[Home]]
- Carpeta de la bóveda: `dietas/` (en el repo, se versiona en Git)

## No duplicar sin controlar

- `README.md` — resumen público en GitHub
- `docs/GITHUB.md` — comandos Git; la bóveda es la fuente detallada
- Si hay conflicto, **priorizar la bóveda** y alinear README

## Plantilla de entrada en bitácora (opcional)

Crear nota en `dietas/07 - Bitacora/YYYY-MM-DD - titulo.md`:

```markdown
# YYYY-MM-DD — título

## Cambios
- ...

## Archivos
- ...

## Siguiente
- [[Pendiente]]
```

Ver: [[Protocolo de cambios]].
