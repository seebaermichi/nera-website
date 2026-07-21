---
layout: pages/tutorial.pug
title: Canonical-Links für SEO hinzufügen
slug: canonical-links-seo
lang: de
description: Verwende plugin-canonical-links, um korrekte canonical- und alternate-language-Link-Tags auszugeben.
keywords: nera SEO, plugin-canonical-links, canonical URL, hreflang, alternate Links
tags: plugins, seo
pagination_order: 7
---
Suchmaschinen wollen eine einzige canonical URL pro Seite. `@nera-static/plugin-canonical-links`
gibt auf jeder Seite das richtige `<link rel="canonical">`-Tag aus — und alternate-language-
Tags, wenn du eine mehrsprachige Website betreibst.

## 1. Template installieren und veröffentlichen

```bash
npm install @nera-static/plugin-canonical-links
npx nera-canonical-links
```

## 2. Deinen Origin konfigurieren

`config/canonical-links.yaml`:

```yaml
app_origin: https://your-domain.com
page_identifier: slug
available_languages:
    - en
```

`app_origin` ist der einzige Wert, den du setzen musst — es ist der absolute Origin, aus dem
canonical URLs aufgebaut werden. Setze ihn auf deine echte Domain, bevor du live gehst.

## 3. Seiten einen Slug geben

Mit `page_identifier: slug` trägt jede Seite ihren `slug` aus dem Frontmatter zur
canonical URL bei:

```markdown
---
title: Getting started
slug: getting-started
---
```

## 4. Die Tags ausgeben

Das Plugin setzt `meta.canonicalLink`. Binde das veröffentlichte Partial im
`<head>` deines Layouts ein:

```pug
head
  include ../vendor/plugin-canonical-links/index
```

Rendere und prüfe den Quelltext einer beliebigen Seite — du siehst:

```html
<link href="https://your-domain.com/docs/getting-started.html" rel="canonical" />
```

Jede Seite auf dieser Website trägt eines, genau auf diese Weise gebaut.
