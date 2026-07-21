---
layout: pages/docs.pug
title: Writing content
slug: writing-content
lang: en
description: Markdown files, frontmatter, and the derived meta values.
pagination_order: 4
---

# Writing content

## A content file

Each page is a Markdown file under `pages/` with a YAML frontmatter block:

```markdown
---
layout: pages/default.pug
title: About
description: What this page is about.
---

# About

Your content goes here.
```

## Who writes the title

`title` is data, not output. Whether it reaches the page is up to the layout, so
check before repeating it in the body:

- If the layout renders `meta.title` itself, **leave the heading out of the
  Markdown** — writing `# About` as well puts the title on the page twice.
- If it doesn't, the body's own `#` heading is the page's only title, as in the
  example above.

On this site `pages/default.pug` and `pages/docs.pug` render no title, so those
pages open with a heading. The tutorial, tutorials-index, plugins and tag-overview
layouts do render it, so their Markdown starts straight into the prose.

## Frontmatter is data

Everything in frontmatter lands on `meta`. Use it for titles, descriptions, tags,
ordering — anything a layout or plugin should read.

> YAML types are preserved: numbers stay numbers, booleans stay booleans. Guard on
> `meta.x != null`, not `if (meta.x)`, so a legitimate `0` or `false` survives.

## Derived meta values

Nera adds these automatically:

| Key | Meaning |
| --- | --- |
| `meta.href` | URL path of the generated HTML file |
| `meta.dirname` | Directory the page lives in |
| `meta.filename` | Source filename |
| `meta.createdAt` | File creation time |

## Folders become URLs

`pages/docs/getting-started.md` → `/docs/getting-started.html`. Nesting folders
nests URLs — no routing config required.
