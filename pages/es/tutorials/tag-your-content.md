---
layout: pages/tutorial.pug
title: Etiqueta tu contenido y obtén páginas temáticas gratis
slug: tag-your-content
lang: es
description: Añade etiquetas a las páginas con plugin-tags y obtén páginas de resumen de etiquetas y una nube de etiquetas generadas automáticamente.
keywords: nera etiquetas, plugin-tags, páginas de etiquetas, páginas temáticas, etiquetas de sitio estático
tags: plugins, tags
pagination_order: 3
createdAt: 2026-07-19
---
`@nera-static/plugin-tags` lee un campo `tags:` de tu frontmatter y luego construye
automáticamente una página de resumen navegable para cada etiqueta.

## 1. Instala y publica las plantillas

```bash
npm install @nera-static/plugin-tags
npx nera-tags
```

## 2. Etiqueta algunas páginas

Añade un valor `tags` separado por comas al frontmatter de cualquier página:

```markdown
---
layout: pages/tutorial.pug
title: Add client-side search
tags: plugins, search
---
```

Las etiquetas se convierten en slugs y se normalizan a minúsculas, así que `Web Dev`, `web dev` y `WEB DEV` apuntan todas a
una página en `/tags/web-dev.html`.

## 3. Configura (opcional)

`config/tags.yaml` — cada clave es opcional:

```yaml
meta_property_name: tags
tag_overview_path: '/tags'
tag_separator: ','
tag_overview_layout: pages/tag-overview.pug
```

El `tag_overview_layout` apunta a un layout que renderiza la plantilla de resumen
publicada. Crea `views/pages/tag-overview.pug`:

```pug
extends ../layouts/layout

block content
  .container
    include ../vendor/plugin-tags/pages/tag-overview
```

## 4. Muestra las etiquetas en una página

El plugin da a cada página una lista `meta.tagLinks`. Incluye el partial publicado en
el layout de tu artículo:

```pug
if meta.tagLinks
  include ../vendor/plugin-tags/partials/tag-links
```

Y para una nube global del sitio, `app.tagCloud` impulsa el partial `tag-cloud`:

```pug
if app.tagCloud
  include ../vendor/plugin-tags/partials/tag-cloud
```

## 5. Etiquetas por idioma (opcional)

Por defecto todas las etiquetas viven en un único espacio de nombres, así que un
sitio multilingüe mezcla todos los idiomas en una sola página de resumen. Con
`group_by_lang` cada idioma recibe las suyas:

```yaml
group_by_lang: true
```

Las etiquetas se recogen entonces por `meta.lang`, y el código de idioma precede a
todo el `tag_overview_path`. Con `tag_overview_path: '/tutorials/tags'` obtienes:

```
/tutorials/tags/<slug>.html       # idioma por defecto
/de/tutorials/tags/<slug>.html    # solo páginas en alemán
/es/tutorials/tags/<slug>.html    # solo páginas en español
```

El idioma por defecto se queda sin prefijo, que es lo que quieres cuando se sirve
desde la raíz. Si cada idioma vive en su propio directorio, añade
`prefix_default_lang: true` para que también reciba un segmento. Las páginas sin
`meta.lang` caen en el idioma por defecto en lugar de formar un grupo aparte, así
que un sitio monolingüe no cambia en nada.

Los chips y la nube se ajustan solos: `meta.tagLinks` enlaza dentro del idioma de
la página, y cada página recibe un `meta.tagCloud` acotado a ella. Un detalle:
`app.tagCloud` sigue existiendo, pero con la agrupación activa contiene la nube
del idioma *por defecto*. Sirve como comprobación, no para renderizar: una página
en alemán mostraría etiquetas en inglés. La plantilla `tag-cloud` incluida ya
prefiere `meta.tagCloud` y recurre a `app.tagCloud`, así que usa la plantilla en
lugar de iterar por tu cuenta. `app.tagCloudByLang` contiene todos los idiomas,
indexados por código.

Las páginas de resumen generadas también llevan su propio `meta.lang`, de modo que
`t()` dentro del layout de resumen resuelve en el idioma de esa página.

Renderiza, y ahora cada etiqueta tiene su propia página — sin mantenimiento manual de índices. El
tutorial que estás leyendo está etiquetado de esta manera; los chips de arriba enlazan a las páginas de
etiquetas generadas. Este sitio funciona con `group_by_lang: true`, así que esos
chips llevan a las páginas de etiquetas del idioma que estés leyendo.
