# Formulario invitado

## Campos

| Campo | Tipo | Límites |
|-------|------|---------|
| Sexo | select | hombre / mujer |
| Edad | number | 14–90 |
| Peso (kg) | number | 35–250 |
| Altura (cm) | number | 120–220 |
| Actividad diaria | select | sedentario … muy_intenso |
| Objetivo | select | perder_grasa, mantener, ganar_musculo |
| Experiencia gym | select | principiante, intermedio, avanzado |
| Días entreno/semana | number | 2–7 |
| Comidas/día | number | 1–5 |
| Restricciones alimentarias | textarea opcional | |
| Lesiones/limitaciones | textarea opcional | |

## Archivos

- UI: `frontend/index.html`
- Validación: `shared/utils/validateInput.js`
- Opciones selects: `shared/getOptions.js` + `main.js` `loadOptions()`

## Comportamiento

- Sin login; datos no se envían a servidor en Pages (todo en cliente).
- Errores mostrados en `#error-container`.

Estado: ✅ Completado — ver [[Completado]].
