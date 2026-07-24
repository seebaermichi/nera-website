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

- **Node.js ≥ 20**
- npm (incluido con Node)

## Crear un sitio

`nera new` crea un sitio nuevo que depende del motor `@nera-static/core` — sin
clon, sin código fuente incluido:

```bash
npx @nera-static/nera new my-site
cd my-site
npm run dev
```

`npm run dev` renderiza el sitio y arranca una vista previa con recarga en vivo en
`http://localhost:3000`.

## Compilar para producción

```bash
npm run build
```

Esto elimina y regenera `public/`. Despliega esa carpeta en cualquier hosting
estático.

## Actualizar más adelante

```bash
nera update
```

`nera update` actualiza los paquetes Nera del sitio con `npm update`, dejando
intactos tus `pages/`, `config/` y `theme/`.
