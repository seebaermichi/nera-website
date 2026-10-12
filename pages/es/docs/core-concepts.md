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

Los layouts son archivos Pug bajo `theme/views/`. El frontmatter `layout` de una página elige uno:

```markdown
---
layout: pages/docs.pug
title: My page
---
```

La ruta es relativa a `theme/views/`, así que `pages/docs.pug` es
`theme/views/pages/docs.pug`.

Si `config/app.yaml` define `theme:` (un paquete como `@nera-static/theme-example`
o una carpeta local), los layouts vienen de ese tema, y un archivo en tu propio
`theme/views/` o `theme/assets/` sustituye al archivo del tema en la misma ruta —
así sobrescribes una sola plantilla sin copiar el resto. `npx @nera-static/nera
new my-site --theme example` crea un sitio de esa forma.

## Traducciones

`config/app.yaml` contiene un mapa `translations`. En un layout, `t('key')` resuelve
`app.translations[meta.lang || app.lang][key]`, recurriendo a la propia clave —
así las traducciones faltantes son visibles, no silenciosas.
