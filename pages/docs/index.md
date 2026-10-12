---
layout: pages/docs.pug
title: Introduction
slug: docs
lang: en
description: What Nera is, how it works, and where to go next.
pagination_order: 1
---

# Documentation

Nera is a lightweight static site generator built on a simple idea: **Markdown in,
HTML out, with plugins for everything else.** This guide takes you from an empty
folder to a deployed site.

## The shape of a Nera project

```
my-site/
├── config/          # app.yaml + one <plugin>.yaml per plugin
├── pages/           # your Markdown content
├── theme/
│   ├── views/       # Pug layouts and page templates (vendor/ holds plugin templates)
│   └── assets/      # CSS, JS, images, fonts — copied verbatim to public/
├── src/plugins/     # optional local plugins, one folder each
├── public/          # generated output (never edit by hand)
├── AGENTS.md        # instructions for AI assistants (CLAUDE.md points to it)
└── package.json     # one Nera dependency: @nera-static/nera
```

`nera new` creates everything here except `src/plugins/` and `public/`. Local
plugins can live in another folder, set with `folders.plugins` in
`config/app.yaml`. Sites from before the theme system keep `views/` and
`assets/` at the project root; Nera still builds them, with a deprecation
warning, until you move both folders under `theme/`.

## How a page becomes HTML

1. **Load** `config/app.yaml` into the `app` object and list `pages/`.
2. **Render** each Markdown file, extracting frontmatter into `meta`.
3. **Apply plugins**, which enrich `app` and `meta`.
4. **Write** `public/`, running each page through its `layout`.

> A page is only rendered if its frontmatter sets a `layout`. Pages without one
> are silently skipped — this is the single most common "why is my page missing?"
> `npx nera validate` lists them (`layout-missing`).

Continue to **Getting started** to scaffold your first site. Working with an AI
assistant? Read [Using Nera with AI](/docs/using-ai.html).
