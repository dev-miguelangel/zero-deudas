# ZeroDeudas

App de gestión de deudas (MVP "ZeroDeudas"), construida con React + Vite + Tailwind CSS.
Funciona 100% en el navegador: los datos se guardan cifrados en `localStorage`, sin backend.

## Requisitos

- Node.js 20 o superior
- npm

## Levantar en local

```bash
npm install
npm run dev
```

La app quedará disponible en `http://localhost:5173`.

## Otros comandos

```bash
npm run build    # genera el build de producción en dist/
npm run preview  # sirve el build de producción localmente
npm run lint     # corre el linter (oxlint)
npm run test     # corre las pruebas unitarias (vitest)
```

## Desplegar en Vercel

El proyecto ya incluye `vercel.json` con la configuración de build (`npm run build`,
carpeta de salida `dist/`). No requiere variables de entorno.

**Opción A — desde el dashboard de Vercel (recomendado):**
1. Sube este proyecto a un repositorio en GitHub/GitLab/Bitbucket.
2. En [vercel.com](https://vercel.com), "Add New Project" → importa el repositorio.
3. Vercel detecta automáticamente el framework (Vite) y usa la configuración de
   `vercel.json`. Solo confirma el deploy.

**Opción B — desde la terminal, sin subir a git:**
```bash
npm install -g vercel
vercel login
vercel        # deploy de prueba (preview)
vercel --prod # deploy a producción
```
