---
layout: pages/tutorial.pug
title: Build a blog with Nera
slug: build-a-blog
lang: en
description: Scaffold a site, add posts, and list them newest-first with a local plugin.
keywords: nera blog tutorial, static blog, markdown blog
tags: getting-started, blog, plugins
pagination_order: 1
createdAt: 2026-07-21
verified_on: 2026-10-13
verified_with:
    nera: 1.10.1
    core: 4.15.2
---
In this tutorial you'll scaffold a Nera site, add a couple of posts, and list them
newest-first on an index page.

## 1. Scaffold

```bash
npx @nera-static/nera new my-blog
cd my-blog
```

## 2. Add posts

Create `pages/posts/hello-world.md`:

```markdown
---
layout: pages/default.pug
title: Hello world
description: My first post.
---

# Hello world

Welcome to my new Nera blog.
```

## 3. List them

A tiny local plugin under `src/plugins/` can collect every post into `app.posts`,
sorted by `meta.createdAt`. Your index layout then loops over that list. (This very
site does exactly that for its tutorials — see `plugins/tutorials-list`; it keeps
its local plugins in `plugins/` via `folders.plugins`.) Give each post a
`createdAt` date in its frontmatter so the order holds on a CI build server too.

## 4. Preview

```bash
npm run dev
```

That's a working blog. From here, add [Tags](/tutorials/tag-your-content.html) or
pagination to grow it.
