---
layout: pages/tutorial.pug
title: Tagge deine Inhalte und erhalte Themenseiten gratis
slug: tag-your-content
lang: de
description: Füge Seiten mit plugin-tags Tags hinzu und erhalte automatisch generierte Tag-Übersichtsseiten und eine Tag-Cloud.
keywords: nera Tags, plugin-tags, Tag-Seiten, Themenseiten, Static-Site-Tags
tags: plugins, tags
pagination_order: 3
---
`@nera-static/plugin-tags` liest ein `tags:`-Feld aus deinem Frontmatter und baut dann
automatisch eine durchsuchbare Übersichtsseite für jeden Tag.

## 1. Templates installieren und veröffentlichen

```bash
npm install @nera-static/plugin-tags
npx nera-tags
```

## 2. Einige Seiten taggen

Füge dem Frontmatter einer beliebigen Seite einen kommaseparierten `tags`-Wert hinzu:

```markdown
---
layout: pages/tutorial.pug
title: Add client-side search
tags: plugins, search
---
```

Tags werden in Slugs umgewandelt und in Kleinbuchstaben zusammengeführt, sodass `Web Dev`, `web dev` und `WEB DEV` alle auf
eine Seite unter `/tags/web-dev.html` verweisen.

## 3. Konfigurieren (optional)

`config/tags.yaml` — jeder Schlüssel ist optional:

```yaml
meta_property_name: tags
tag_overview_path: '/tags'
tag_separator: ','
tag_overview_layout: pages/tag-overview.pug
```

Das `tag_overview_layout` verweist auf ein Layout, das das veröffentlichte Übersichts-Template
rendert. Erstelle `views/pages/tag-overview.pug`:

```pug
extends ../layouts/layout

block content
  .container
    include ../vendor/plugin-tags/pages/tag-overview
```

## 4. Tags auf einer Seite anzeigen

Das Plugin gibt jeder Seite eine `meta.tagLinks`-Liste. Binde das veröffentlichte Partial in
dein Artikel-Layout ein:

```pug
if meta.tagLinks
  include ../vendor/plugin-tags/partials/tag-links
```

Und für eine seitenweite Cloud steuert `app.tagCloud` das `tag-cloud`-Partial:

```pug
if app.tagCloud
  include ../vendor/plugin-tags/partials/tag-cloud
```

Rendere, und jeder Tag hat nun seine eigene Seite — keine manuelle Index-Pflege. Das
Tutorial, das du gerade liest, ist auf diese Weise getaggt; die Chips oben verlinken auf die generierten
Tag-Seiten.
