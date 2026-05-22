# Publicar en GitHub y GitHub Pages

## 1. Subir el proyecto (solo la primera vez)

Abre PowerShell en la carpeta del proyecto:

```powershell
cd "c:\Users\Darth\Desktop\web dieta"

git init
git add .
git commit -m "Proyecto inicial: plan dieta y ejercicio con GitHub Pages"
git branch -M main
git remote add origin https://github.com/ionut5251/dietaweb.git
git push -u origin main
```

Si GitHub pide login, usa **GitHub CLI** (`gh auth login`) o un **Personal Access Token** como contraseña al hacer `git push`.

## 2. Activar GitHub Pages

1. Entra en https://github.com/ionut5251/dietaweb  
2. **Settings** → **Pages**  
3. En **Build and deployment** → **Source**, elige **GitHub Actions**  
4. Tras el primer `git push`, la acción *Deploy GitHub Pages* publicará la web  

URL pública (cuando termine el despliegue):

**https://ionut5251.github.io/dietaweb/**

## 3. Actualizar la web cada vez que cambies código

```powershell
git add .
git commit -m "Describe el cambio que hiciste"
git push
```

En 1–2 minutos GitHub Actions vuelve a desplegar y la página online se actualiza sola.

## 4. Cómo funciona técnicamente

| Entorno | Qué usa |
|---------|---------|
| **Local** (`npm start`) | Frontend + API Node en `backend/` |
| **GitHub Pages** | Solo archivos estáticos; la lógica está en `shared/` y se ejecuta en el navegador |

La carpeta `shared/` es la fuente única de verdad para generar planes (dieta y ejercicio).

## 5. Que otras personas prueben

Comparte el enlace: **https://ionut5251.github.io/dietaweb/**

Pueden abrir issues en GitHub (**Issues** → **New issue**) para reportar fallos o mejoras.

## 6. Problemas frecuentes

- **404 en Pages**: comprueba que en Settings → Pages el origen sea *GitHub Actions* y que el workflow en la pestaña **Actions** esté en verde.  
- **Push rechazado**: si el repo remoto ya tiene commits, usa `git pull origin main --reallow-unrelated-histories` y luego `git push`.  
- **Local funciona pero Pages no**: revisa la consola del navegador (F12); suele ser caché — prueba Ctrl+F5.
