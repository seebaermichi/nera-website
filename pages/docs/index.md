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
├── config/        # app.yaml + one <plugin>.yaml per plugin
├── pages/         # your Markdown content
├── views/         # Pug layouts (and vendor/ templates from plugins)
├── assets/        # CSS, JS, images — copied verbatim to public/
└── public/        # generated output (never edit by hand)
```

## How a page becomes HTML

1. **Load** `config/app.yaml` into the `app` object and list `pages/`.
2. **Render** each Markdown file, extracting frontmatter into `meta`.
3. **Apply plugins**, which enrich `app` and `meta`.
4. **Write** `public/`, running each page through its `layout`.

> A page is only rendered if its frontmatter sets a `layout`. Pages without one
> are silently skipped — this is the single most common "why is my page missing?"

Continue to **Getting started** to scaffold your first site.
