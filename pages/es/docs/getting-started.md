---
layout: pages/docs.pug
title: Primeros pasos
slug: getting-started
lang: es
description: Crea un sitio Nera nuevo con el instalador y renderízalo.
pagination_order: 2
---

# Primeros pasos

## Requisitos

- **Node.js ≥ 18**
- npm (incluido con Node)

## Crear un sitio

La CLI `@nera-static/installer` clona el generador y lo convierte en tu propio
proyecto:

```bash
npx @nera-static/installer new my-site
cd my-site
npm run dev
```

`npm run dev` renderiza el sitio y arranca una vista previa con recarga en vivo en
`http://localhost:3000`.

## Compilar para producción

```bash
npm run render
```

Esto elimina y regenera `public/`. Despliega esa carpeta en cualquier hosting
estático.

## Actualizar más adelante

```bash
npx @nera-static/installer update
```

`nera update` actualiza el núcleo del generador in situ, dejando intactos tus
`pages/`, `config/` y `views/`.
