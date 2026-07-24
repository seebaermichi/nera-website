---
layout: pages/tutorial.pug
title: Crear un blog con Nera
slug: build-a-blog
lang: es
description: Crear un sitio, añadir entradas y listarlas de más reciente a más antigua con un plugin local.
keywords: tutorial blog nera, blog estático, blog markdown
tags: getting-started, blog, plugins
pagination_order: 1
createdAt: 2026-07-21
---
En este tutorial crearás un sitio Nera, añadirás un par de entradas y las listarás de
más reciente a más antigua en una página índice.

## 1. Crear el sitio

```bash
npx @nera-static/installer new my-blog
cd my-blog
```

## 2. Añadir entradas

Crea `pages/posts/hello-world.md`:

```markdown
---
layout: pages/default.pug
title: Hola mundo
description: Mi primera entrada.
---

# Hola mundo

Bienvenido a mi nuevo blog en Nera.
```

## 3. Listarlas

Un pequeño plugin local en `src/plugins/` puede reunir cada entrada en `app.posts`,
ordenada por `meta.createdAt`. Tu plantilla índice recorre entonces esa lista.
(Este mismo sitio hace exactamente eso con sus tutoriales — mira
`src/plugins/tutorials-list`.)

## 4. Vista previa

```bash
npm run dev
```

Eso es un blog funcional. A partir de aquí, añade
[etiquetas](/es/tutorials/add-search.html) o paginación para hacerlo crecer.
