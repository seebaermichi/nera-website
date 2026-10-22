---
layout: pages/docs.pug
title: Primeros pasos
slug: getting-started
lang: es
description: Crea un sitio Nera nuevo con la CLI de nera y compílalo.
pagination_order: 2
---

# Primeros pasos

## Requisitos

- **Node.js 22.12 o posterior**
- npm 10.9 o posterior (incluido con Node.js 22.12)

## Crear un sitio

`nera new` crea un sitio nuevo cuya única dependencia de Nera es
`@nera-static/nera`, que trae el motor `@nera-static/core` — sin clon, sin
código fuente incluido:

```bash
npx @nera-static/nera new my-site
cd my-site
npm run dev
```

`npm run dev` renderiza el sitio y arranca una vista previa con recarga en vivo en
`http://localhost:3000`. ¿Ya estás en la carpeta donde debe vivir el sitio?
`npx @nera-static/nera new .` lo crea en la carpeta actual, que debe estar vacía.

## Compilar para producción

```bash
npm run build
```

Esto elimina y regenera `public/`. Despliega esa carpeta en cualquier hosting
estático.

## Actualizar más adelante

```bash
npx nera update
```

`nera update` actualiza los paquetes Nera del sitio con `npm update` y renueva
la parte de Nera de `AGENTS.md`, dejando intactos tus `pages/`, `config/` y
`theme/`. Desde `@nera-static/nera` 1.15.0 también eleva sus rangos `^` en
`package.json` (y `package-lock.json`) a las versiones instaladas, de modo que
`^1.0.0` pasa a ser, por ejemplo, `^1.15.0`; nunca cruza una versión mayor. Cómo usa un asistente de IA `AGENTS.md` se explica en
[Usar Nera con IA](/es/docs/using-ai.html).
