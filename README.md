# Web Dieta — Plan personal (invitado)

Aplicación web para generar un **plan de dieta** y un **plan de ejercicio** a partir de los datos que normalmente darías a un dietista y a un entrenador personal.

**Demo online:** [https://ionut5251.github.io/dietaweb/](https://ionut5251.github.io/dietaweb/)

## Estructura del proyecto

```
web dieta/
├── README.md
├── package.json
├── shared/                   ← Lógica compartida (dieta + ejercicio)
├── backend/                  ← API Express (desarrollo local)
├── frontend/                 ← Interfaz web
├── docs/GITHUB.md            ← Guía Git + GitHub Pages
└── .github/workflows/        ← Despliegue automático al hacer push
```

## Cómo ejecutar en local

```bash
npm run install:all
npm start
```

Abre **http://localhost:3000**

## Publicar cambios en GitHub

```bash
git add .
git commit -m "Descripción del cambio"
git push
```

La web en GitHub Pages se actualiza sola en 1–2 minutos. Guía detallada: [docs/GITHUB.md](docs/GITHUB.md)

## Datos del formulario

| Campo | Uso |
|--------|-----|
| Sexo, edad, peso, altura | Cálculo metabólico (Mifflin-St Jeor) |
| Actividad diaria | Factor TDEE |
| Objetivo | Calorías y proteína |
| Días de entreno (2–7) | Rutina 4 semanas con rotación |
| Comidas al día (1–5) | Plan mensual con menú variado |
| Experiencia en gym | Series, reps y registro de peso |
| Restricciones / lesiones | Avisos personalizados |

## Aviso

Los planes son **orientativos** y no sustituyen asesoramiento médico o profesional presencial.
