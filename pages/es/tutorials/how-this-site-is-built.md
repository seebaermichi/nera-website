---
layout: pages/tutorial.pug
title: Cómo está construido este sitio web
slug: how-this-site-is-built
lang: es
description: Un caso de estudio del propio sitio Nera — los plugins, el orden y el plugin local que hay detrás.
keywords: nera caso de estudio, ejemplo de sitio estático, nera website, dogfooding
tags: case-study, plugins, advanced
pagination_order: 9
createdAt: 2026-07-13
---
Todo este sitio está construido con Nera. Nada aquí es un caso especial — es el
mismo generador y los mismos plugins públicos que instalarías. Aquí está la receta
completa.

## Andamiado como cualquier sitio

Comenzó con la CLI de nera, que crea un sitio cuya única dependencia de Nera es
`@nera-static/nera` (que trae el motor `@nera-static/core`):

```bash
npx @nera-static/nera new nera-website
```

## Nueve plugins, cada uno haciendo una cosa

| Plugin | Trabajo | Configuración |
| --- | --- | --- |
| `plugin-navigation` | Menús de cabecera + pie con estados activos | `config/navigation.yaml` |
| `plugin-tags` | Etiquetas de tutoriales + páginas `/tutorials/tags/*` por idioma | `config/tags.yaml` |
| `plugin-search` | Índice de búsqueda del lado del cliente + caja, por idioma | `config/search.yaml` |
| `plugin-page-pagination` | Anterior/siguiente en docs y tutoriales | `config/page-pagination.yaml` |
| `plugin-canonical-links` | Etiquetas `<link>` canónicas para SEO | `config/canonical-links.yaml` |
| `plugin-link-attributes` | Los enlaces externos se abren en una pestaña nueva | `config/link-attributes.yaml` |
| `plugin-code-blocks` | Resaltado de sintaxis en la compilación, con botón de copiar | `config/code-blocks.yaml` |
| `tutorials-list` (local) | Construye `app.tutorials` para el índice | — |
| `llms-txt` (local) | `llms.txt`, `llms-full.txt` y un `.md` por página para asistentes de IA | `config/llms-txt.yaml` |

Los dos plugins locales viven en `plugins/`, indicado con `folders.plugins` en
`config/app.yaml`. La mayoría de los demás tiene su propio tutorial en esta
sección, si quieres los detalles.

## El orden importa — los enlaces canónicos y la búsqueda se ejecutan al final

La búsqueda construye su índice a partir del estado final de cada página, así que
tiene que ejecutarse después de todo lo demás. Los enlaces canónicos también
deben ir después de `plugin-tags`, o las páginas de etiquetas que genera se quedan
sin enlace canónico — y por orden alfabético `canonical-links` se ejecutaría antes
que `tags`. `config/plugin-order.yaml` así lo indica:

```yaml
plugin-order:
    - end:
          - plugin-canonical-links
          - plugin-search
```

Todo lo demás se ejecuta alfabéticamente en medio. Este es el único lugar donde el
orden de los plugins es determinante en este sitio.

## Plantillas que nos pertenecen

Los plugins que incluyen vistas se publicaron en `theme/views/vendor/` con comandos como
`npx nera-navigation`. Esas copias son nuestras para editar y dar estilo — nada
importante está oculto dentro de `node_modules`.

## El contenido es solo Markdown

Cada página que estás leyendo es un archivo Markdown bajo `pages/` con un `layout`
en su frontmatter. Los docs son `pages/docs/*.md`; este tutorial es
`pages/tutorials/how-this-site-is-built.md`. Las carpetas se convierten en URLs; no
existe ninguna configuración de enrutamiento.

## Compilar

```bash
npm run build   # pages/ -> public/
```

Ese es todo el stack: Markdown entra, HTML estático sale, plugins para el resto. Si
has leído los otros tutoriales de esta sección, ahora has visto cada pieza de él por
separado — esto es simplemente todas juntas.
