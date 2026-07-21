---
layout: pages/tutorial.pug
title: Añadir enlaces canónicos para SEO
slug: canonical-links-seo
lang: es
description: Usa plugin-canonical-links para emitir etiquetas link canónicas y de idioma alternativo correctas.
keywords: nera seo, plugin-canonical-links, url canónica, hreflang, enlaces alternativos
tags: plugins, seo
pagination_order: 7
---
Los motores de búsqueda quieren una única URL canónica por página. `@nera-static/plugin-canonical-links`
emite la etiqueta `<link rel="canonical">` correcta en cada página — y etiquetas de idioma
alternativo si gestionas un sitio multilingüe.

## 1. Instalar y publicar la plantilla

```bash
npm install @nera-static/plugin-canonical-links
npx nera-canonical-links
```

## 2. Configurar tu origen

`config/canonical-links.yaml`:

```yaml
app_origin: https://your-domain.com
page_identifier: slug
available_languages:
    - en
```

`app_origin` es el único valor que debes establecer — es el origen absoluto a partir del cual
se construyen las URLs canónicas. Configúralo con tu dominio real antes de lanzar.

## 3. Dar un slug a las páginas

Con `page_identifier: slug`, cada página aporta su `slug` del frontmatter a la
URL canónica:

```markdown
---
title: Getting started
slug: getting-started
---
```

## 4. Emitir las etiquetas

El plugin establece `meta.canonicalLink`. Incluye el partial publicado en el
`<head>` de tu layout:

```pug
head
  include ../vendor/plugin-canonical-links/index
```

Renderiza y comprueba el código fuente de cualquier página — verás:

```html
<link href="https://your-domain.com/docs/getting-started.html" rel="canonical" />
```

Cada página de este sitio lleva uno, construido exactamente de esta manera.
