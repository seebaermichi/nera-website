---
layout: pages/tutorial.pug
title: Etiqueta tu contenido y obtén páginas temáticas gratis
slug: tag-your-content
lang: es
description: Añade etiquetas a las páginas con plugin-tags y obtén páginas de resumen de etiquetas y una nube de etiquetas generadas automáticamente.
keywords: nera etiquetas, plugin-tags, páginas de etiquetas, páginas temáticas, etiquetas de sitio estático
tags: plugins, tags
pagination_order: 3
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

Renderiza, y ahora cada etiqueta tiene su propia página — sin mantenimiento manual de índices. El
tutorial que estás leyendo está etiquetado de esta manera; los chips de arriba enlazan a las páginas de
etiquetas generadas.
