---
layout: pages/tutorial.pug
title: Cómo está construido este sitio web
slug: how-this-site-is-built
lang: es
description: Un caso de estudio del propio sitio Nera — los plugins, el orden y el plugin local que hay detrás.
keywords: nera caso de estudio, ejemplo de sitio estático, nera website, dogfooding
tags: case-study, plugins, advanced
pagination_order: 9
---
Todo este sitio está construido con Nera. Nada aquí es un caso especial — es el
mismo generador y los mismos plugins públicos que instalarías. Aquí está la receta
completa.

## Andamiado como cualquier sitio

Comenzó con el instalador, que clona el generador y lo convierte en tu propio
proyecto:

```bash
npx @nera-static/installer new nera-website
```

## Siete plugins, cada uno haciendo una cosa

| Plugin | Trabajo | Configuración |
| --- | --- | --- |
| `plugin-navigation` | Menús de cabecera + pie con estados activos | `config/navigation.yaml` |
| `plugin-tags` | Etiquetas de tutoriales + páginas `/tutorials/tags/*` por idioma | `config/tags.yaml` |
| `plugin-search` | Índice de búsqueda del lado del cliente + caja | `config/search.yaml` |
| `plugin-page-pagination` | Anterior/siguiente en docs y tutoriales | `config/page-pagination.yaml` |
| `plugin-canonical-links` | Etiquetas `<link>` canónicas para SEO | `config/canonical-links.yaml` |
| `plugin-link-attributes` | Los enlaces externos se abren en una pestaña nueva | `config/link-attributes.yaml` |
| `tutorials-list` (local) | Construye `app.tutorials` para el índice | — |

Cada uno tiene su propio tutorial en esta sección, si quieres los detalles.

## El orden importa — la búsqueda se ejecuta al final

La búsqueda construye su índice a partir del estado final de cada página, así que
tiene que ejecutarse después de todo lo demás. `config/plugin-order.yaml` así lo
indica:

```yaml
plugin-order:
    - end:
          - plugin-search
```

Todo lo demás se ejecuta alfabéticamente en medio. Este es el único lugar donde el
orden de los plugins es determinante en este sitio.

## Plantillas que nos pertenecen

Los plugins que incluyen vistas se publicaron en `views/vendor/` con comandos como
`npx nera-navigation`. Esas copias son nuestras para editar y dar estilo — nada
importante está oculto dentro de `node_modules`.

## El contenido es solo Markdown

Cada página que estás leyendo es un archivo Markdown bajo `pages/` con un `layout`
en su frontmatter. Los docs son `pages/docs/*.md`; este tutorial es
`pages/tutorials/how-this-site-is-built.md`. Las carpetas se convierten en URLs; no
existe ninguna configuración de enrutamiento.

## Compilar

```bash
npm run render   # pages/ -> public/
```

Ese es todo el stack: Markdown entra, HTML estático sale, plugins para el resto. Si
has leído los otros tutoriales de esta sección, ahora has visto cada pieza de él por
separado — esto es simplemente todas juntas.
