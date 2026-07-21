---
layout: pages/docs.pug
title: Conceptos básicos
slug: core-concepts
lang: es
description: El pipeline de renderizado, los objetos app y meta, los layouts y las traducciones.
pagination_order: 3
---

# Conceptos básicos

## El pipeline de cuatro etapas

Cada compilación ejecuta el mismo pipeline fijo: **cargar los datos de app → renderizar las páginas →
aplicar los plugins → escribir la salida.** Entender estas cuatro etapas explica casi
todo sobre cómo se comporta Nera.

## `app` vs. `meta`

Dos objetos de datos llegan a tus plantillas:

- **`app`** — valores globales de `config/app.yaml`, disponibles en cada página.
- **`meta`** — valores por página: tu frontmatter, más claves derivadas como
  `meta.href`, `meta.dirname`, `meta.filename` y `meta.createdAt`.

Los plugins añaden datos a ambos — por ejemplo, `plugin-navigation` establece `app.nav`, y
`plugin-tags` establece `meta.tagLinks`.

## Layouts

Los layouts son archivos Pug bajo `views/`. El frontmatter `layout` de una página elige uno:

```markdown
---
layout: pages/docs.pug
title: My page
---
```

## Traducciones

`config/app.yaml` contiene un mapa `translations`. En un layout, `t('key')` resuelve
`app.translations[meta.lang || app.lang][key]`, recurriendo a la propia clave —
así las traducciones faltantes son visibles, no silenciosas.
