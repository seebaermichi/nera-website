---
layout: pages/tutorial.pug
title: Cómo está construido este sitio web
slug: how-this-site-is-built
lang: es
description: Un caso de estudio del propio sitio Nera — los plugins, el orden, los plugins locales y cómo se comprueba y se despliega.
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

## Diez plugins, cada uno haciendo una cosa

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
| `skill-zip` (local) | [La skill de Nera](/es/docs/using-ai.html) como zip para claude.ai y Claude Desktop | — |

Los tres plugins locales — `tutorials-list`, `llms-txt` y `skill-zip` — viven en
`plugins/`, indicado con `folders.plugins` en `config/app.yaml`. `llms-txt` y
`skill-zip` generan archivos en lugar de datos y se los entregan a la compilación
mediante el hook `getAssets` (consulta
[Escribe tu propio plugin local](/es/tutorials/write-a-local-plugin.html)).
`skill-zip` lee la skill del `@nera-static/nera` instalado, así que la descarga
siempre coincide con la CLI con la que se compila el sitio. La mayoría de los demás tiene su propio tutorial en esta
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

## Comprobar y desplegar

Cada push a `main` y cada pull request contra esa rama ejecutan
`.github/workflows/test.yml` en Node 20 y 22, con los mismos comandos que puedes
ejecutar en local:

```bash
npm ci
npm run lint              # eslint
npm test                  # node --test con los tests junto a los plugins locales
npm run validate          # nera validate: layouts, includes, frontmatter
npm run build -- --check  # nera build --check
```

`--check` revisa el `public/` compilado en busca de problemas de accesibilidad,
privacidad y aviso legal, e informa de lo que encuentra. Los hallazgos son
advertencias: solo hacen fallar la ejecución con una regla que
`config/validate.yaml` eleve a error.

Después, un push a `main` ejecuta `.github/workflows/deploy.yml`: `npm ci`,
`npm run build`, y `public/` se publica en GitHub Pages — el sitio que estás
leyendo en nera.js.org.

Ese es todo el stack: Markdown entra, HTML estático sale, plugins para el resto. Si
has leído los otros tutoriales de esta sección, ahora has visto cada pieza de él por
separado — esto es simplemente todas juntas.
