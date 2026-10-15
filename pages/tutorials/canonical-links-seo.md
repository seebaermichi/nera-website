---
layout: pages/tutorial.pug
title: Add canonical links for SEO
slug: canonical-links-seo
lang: en
description: Use plugin-canonical-links to emit correct canonical and alternate-language link tags, including on subdirectory sites and generated pages.
keywords: nera seo, plugin-canonical-links, canonical url, hreflang, alternate links, base_path
tags: plugins, seo
pagination_order: 7
createdAt: 2026-07-15
verified_on: 2026-10-15
verified_with:
    plugin-canonical-links: 2.2.3
    plugin-sitemap: 1.1.0
---
Search engines want a single canonical URL per page, and on a multilingual site
they want to know which pages are translations of each other.
`@nera-static/plugin-canonical-links` emits the `<link rel="canonical">` tag on
every page and `hreflang` alternate tags between translations. Get these wrong and
nothing breaks visibly — the page renders fine, and the mistake only shows up in a
search console weeks later. So check the output, as this tutorial does at every step.

## 1. Install and publish the template

```bash
npm install @nera-static/plugin-canonical-links
npx nera-canonical-links
```

The second command copies `index.pug` and its `partials/` to
`theme/views/vendor/plugin-canonical-links/`. It skips if that folder already
exists, so your edits are safe; `npx nera-canonical-links --force` overwrites them
with the shipped templates after an upgrade.

## 2. Set your origin

Canonical URLs are absolute, so the plugin needs your site's origin. Set it once in
`config/app.yaml`:

```yaml
origin: https://example.com
```

That is all the configuration a single-language site needs — **the plugin's own
config file is optional**. If you do create `config/canonical-links.yaml`, its
`app_origin` is used as a fallback when `app.yaml` has no `origin`; when both are
set, `origin` in `app.yaml` wins. A trailing slash is stripped either way.

With no origin at all, the plugin emits no canonical or alternate links and prints
one warning during the build:

```text
⚠️ plugin-canonical-links: no origin configured, so no canonical links were generated.
    Set `origin` in config/app.yaml, or `app_origin` in config/canonical-links.yaml.
```

If your site is served from a subdirectory, `base_path` in `config/app.yaml` is
part of the URL too. Canonical and alternate URLs are built as origin + base path
+ page path:

```yaml
origin: https://example.com
base_path: /docs/
```

```html
<link href="https://example.com/docs/getting-started.html" rel="canonical" />
```

Without `base_path` the output is unchanged. Versions before 2.2.3 left the base
path out and pointed search engines at a URL that does not exist.

## 3. Emit the tags

The plugin sets `meta.canonicalLink` on every page. Include the published template
in your layout's `<head>`:

```pug
head
  include /vendor/plugin-canonical-links/index
```

The leading slash makes the path root-absolute: it resolves against `theme/views/`,
wherever the including file sits. The relative form
`include ../vendor/plugin-canonical-links/index` does the same, but only from a
layout in `theme/views/layouts/` — use it on Nera core 4.1–4.2, where the
root-absolute form is not available yet. A bare `include vendor/…` (no slash, no
`../`) looks in `theme/views/layouts/vendor/` and fails the build.

Build and view the source of `pages/getting-started.md` — you'll see:

```html
<link href="https://example.com/getting-started.html" rel="canonical" />
```

## 4. Link translations with hreflang

Alternate-language links need three things. First, list your languages in
`config/canonical-links.yaml`:

```yaml
page_identifier: slug
available_languages:
    - en
    - de
```

`page_identifier` names the frontmatter key that marks two pages as translations
of each other; `slug` is the default, so you can leave the line out. Second, every
page sets its `lang`. Third, translations share an identical `slug`:

```markdown
---
title: Getting started
slug: getting-started
lang: en
---
```

```markdown
---
title: Erste Schritte
slug: getting-started
lang: de
---
```

With the English page at `pages/getting-started.md` and the German one at
`pages/de/getting-started.md`, the build gives the English page:

```html
<link href="https://example.com/getting-started.html" rel="canonical" />
<link href="https://example.com/de/getting-started.html" hreflang="de" rel="alternate" />
```

and the German page:

```html
<link href="https://example.com/de/getting-started.html" rel="canonical" />
<link href="https://example.com/getting-started.html" hreflang="en" rel="alternate" />
```

Each page points at its translations, not at itself. All of this fails silently:

- Without `available_languages` you get canonical links only, and
  `meta.alternateLinks` is an empty array.
- A page without `lang` gets its canonical link but no alternates.
- A page without a `slug` is never matched to anything.

If you write your own template instead of the published one, read
`meta.alternateLinks` — a list of `{ href, hreflang, rel }` — and guard for both
keys being absent when no origin is set.

## 5. Cover pages from other plugins

Some plugins create pages while they run — `@nera-static/plugin-tags` builds its
tag overview pages that way (see [Tag your content](/tutorials/tag-your-content.html)).
Plugins run in alphabetical order, and `plugin-canonical-links` comes before
`plugin-tags`, so those tag pages are built after it has finished and get **no
canonical link**. Move it to the end in `config/plugin-order.yaml` (Nera core
4.2.0 or newer):

```yaml
plugin-order:
    - end:
          - plugin-canonical-links
```

Now every tag page carries one:

```html
<link href="https://example.com/tags/seo.html" rel="canonical" />
```

Generated pages have no `slug`, so they get a canonical link and no alternates.

The sitemap plugin, [`@nera-static/plugin-sitemap`](https://www.npmjs.com/package/@nera-static/plugin-sitemap),
reads the same origin (`origin` in `app.yaml`, else `app_origin`) and the same
`base_path`, so the URLs in your sitemap and your canonical links agree — on a
`base_path` site from plugin-canonical-links 2.2.3 on.

This site uses the plugin as well, set up as this tutorial describes:
`origin: https://nera.js.org` in `config/app.yaml`, the root-absolute include in its layout,
and `plugin-canonical-links` under `end:` in `config/plugin-order.yaml`. Its
`config/canonical-links.yaml` lists only `en` and `de` as languages — Spanish is
left out until a native-speaker review is done, so no page carries an
`hreflang="es"` alternate yet. View the source of this page to see the result.
