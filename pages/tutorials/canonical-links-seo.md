---
layout: pages/tutorial.pug
title: Add canonical links for SEO
slug: canonical-links-seo
lang: en
description: Use plugin-canonical-links to emit correct canonical and alternate-language link tags.
keywords: nera seo, plugin-canonical-links, canonical url, hreflang, alternate links
tags: plugins, seo
pagination_order: 7
---

# Add canonical links for SEO

Search engines want a single canonical URL per page. `@nera-static/plugin-canonical-links`
emits the right `<link rel="canonical">` tag on every page — and alternate-language
tags if you run a multilingual site.

## 1. Install and publish the template

```bash
npm install @nera-static/plugin-canonical-links
npx nera-canonical-links
```

## 2. Configure your origin

`config/canonical-links.yaml`:

```yaml
app_origin: https://your-domain.com
page_identifier: slug
available_languages:
    - en
```

`app_origin` is the only value you must set — it's the absolute origin canonical
URLs are built from. Set it to your real domain before you launch.

## 3. Give pages a slug

With `page_identifier: slug`, each page contributes its `slug` frontmatter to the
canonical URL:

```markdown
---
title: Getting started
slug: getting-started
---
```

## 4. Emit the tags

The plugin sets `meta.canonicalLink`. Include the published partial in your
layout's `<head>`:

```pug
head
  include ../vendor/plugin-canonical-links/index
```

Render and check the source of any page — you'll see:

```html
<link href="https://your-domain.com/docs/getting-started.html" rel="canonical" />
```

Every page on this site carries one, built exactly this way.
