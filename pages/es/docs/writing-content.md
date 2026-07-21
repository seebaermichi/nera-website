---
layout: pages/docs.pug
title: Escribir contenido
slug: writing-content
lang: es
description: Archivos Markdown, frontmatter y los valores meta derivados.
pagination_order: 4
---

# Escribir contenido

## Un archivo de contenido

Cada página es un archivo Markdown bajo `pages/` con un bloque de frontmatter YAML:

```markdown
---
layout: pages/default.pug
title: About
description: What this page is about.
---

# About

Your content goes here.
```

## Quién escribe el título

`title` son datos, no salida. Que llegue a la página depende del layout, así que
compruébalo antes de repetirlo en el cuerpo:

- Si el layout renderiza `meta.title`, **omite el encabezado en el Markdown**:
  escribir además `# Acerca de` pone el título dos veces en la página.
- Si no lo hace, el encabezado `#` del cuerpo es el único título de la página,
  como en el ejemplo anterior.

En este sitio `pages/default.pug` y `pages/docs.pug` no renderizan título, por eso
esas páginas empiezan con un encabezado. Los layouts de tutorial, índice de
tutoriales, plugins y vista de etiquetas sí lo renderizan, así que su Markdown
entra directamente en el texto.

## El frontmatter son datos

Todo lo que hay en el frontmatter llega a `meta`. Úsalo para títulos, descripciones, etiquetas,
ordenación — cualquier cosa que un layout o plugin deba leer.

> Los tipos de YAML se conservan: los números siguen siendo números, los booleanos siguen siendo booleanos. Comprueba con
> `meta.x != null`, no con `if (meta.x)`, para que un `0` o `false` legítimo sobreviva.

## Valores meta derivados

Nera añade estos automáticamente:

| Clave | Significado |
| --- | --- |
| `meta.href` | Ruta URL del archivo HTML generado |
| `meta.dirname` | Directorio donde reside la página |
| `meta.filename` | Nombre del archivo de origen |
| `meta.createdAt` | Hora de creación del archivo |

## Las carpetas se convierten en URLs

`pages/docs/getting-started.md` → `/docs/getting-started.html`. Anidar carpetas
anida las URLs — sin necesidad de configuración de rutas.
