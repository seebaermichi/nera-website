---
layout: pages/home.pug
title: Home
slug: home
lang: en
description: Nera is a lightweight, plugin-based static site generator. Write Markdown, template with Pug, extend with small single-purpose plugins.
keywords: nera, static site generator, ssg, markdown, pug, node
---

## Why Nera

Nera turns a folder of Markdown into a fast static site. No framework lock-in, no
heavy toolchain — a four-stage pipeline you can read in an afternoon, and a plugin
system where every feature is a small, single-purpose package you opt into.

### Markdown in, HTML out
Author content in Markdown with YAML frontmatter. Nera renders each page through a
Pug layout you control and writes plain, fast HTML to `public/`.

### Plugins, not magic
Navigation, tags, search, pagination, canonical links and more ship as separate
`@nera-static/plugin-*` packages. Install what you need; ignore the rest.

### Templates you own
Publish a plugin's Pug templates into `views/vendor/` and style them from your own
CSS. Nothing is hidden inside `node_modules` where you can't reach it.

### Zero build step
No bundler to configure. `npm run render` builds the site; `npm run dev` gives you
a live-reloading preview. Node ≥ 18, and that's the whole dependency story.
