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
