---
layout: pages/tutorial.pug
title: Build a blog with Nera
slug: build-a-blog
lang: en
description: Scaffold a site, write posts, and list them newest-first on the home page with plugin-simple-page-list.
keywords: nera blog tutorial, static blog, markdown blog, plugin-simple-page-list
tags: getting-started, blog, plugins
pagination_order: 1
createdAt: 2026-07-21
verified_on: 2026-10-25
verified_with:
    nera: 1.18.0
    core: 4.18.2
    plugin-simple-page-list: 2.3.3
    starter-blog: 1.1.0
---
In this tutorial you'll scaffold a Nera site, write two posts, and turn the home
page into a blog index that lists them newest-first. Every file is shown in
full, so you can follow along step by step.

## 1. Scaffold the site

```bash
npx @nera-static/nera new my-blog
cd my-blog
```

`nera new` creates the site and installs its dependencies. You'll touch three
places: `pages/` for your content (it starts with `pages/index.md`, plus
`pages/imprint.md` and `pages/privacy.md` — placeholders to replace before you
publish), `theme/views/` for the Pug templates (`layouts/layout.pug` is the HTML
shell, `pages/default.pug` renders a page into it), and `config/` for settings.

Want a finished blog to edit instead? The blog starter sets one up with a
theme, sample posts, tags, an archive, a feed and a sitemap:

```bash
npx @nera-static/nera new my-blog --starter blog
```

Its files won't match the steps below: this tutorial builds a simpler blog by
hand, to show how the pieces fit together.

## 2. Write posts

Posts are Markdown files in `pages/posts/`. Create `pages/posts/hello-world.md`:

```markdown
---
layout: pages/default.pug
title: Hello world
description: My first post.
createdAt: 2026-10-01
---

# Hello world

Welcome to my new Nera blog.
```

And a second one, `pages/posts/second-post.md`:

```markdown
---
layout: pages/default.pug
title: My second post
description: What I learned this week.
createdAt: 2026-10-08
---

# My second post

A week in, and the blog lists this post first.
```

A page renders only if it names a `layout`. The `title` and `description` show
up in the list, and `createdAt` is the post's date. Always set it: without it,
Nera falls back to the file's creation time, which on a fresh checkout — on a CI
build server, say — is the same for every file, so the order would be arbitrary.

## 3. List the posts on the home page

`@nera-static/plugin-simple-page-list` collects the pages of a folder into a
sorted list. Install it and publish its template:

```bash
npm install @nera-static/plugin-simple-page-list
npx nera-simple-page-list
```

Nera picks up the plugin from your `package.json` on its own. The second command
copies the template to
`theme/views/vendor/plugin-simple-page-list/simple-page-list.pug`.

Tell the plugin which folder to list and how to sort it. Create
`config/simple-page-list.yaml`:

```yaml
page_path: /posts
more_link_text: Read more
sortBy: date
sortOrder: descending
```

`page_path` gives you one flat list in `app.pageList`, which is all a blog with
one section needs. `sortBy: date` reads a post's `date` from the frontmatter and
falls back to `createdAt`, so your posts sort by the dates you just set.

Now a page template that renders the page's own content and the list below it.
Create `theme/views/pages/blog.pug`:

```pug
extends ../layouts/layout

block content
  main#main
    != content
    include /vendor/plugin-simple-page-list/simple-page-list
```

The two `content`s are unrelated. `block content` fills the slot of that name
in `layouts/layout.pug`. `!= content` outputs the page's Markdown, which Nera
has already rendered to HTML; `!=` leaves it unescaped, so it arrives as markup.
The leading slash makes the include path start at `theme/views/`, wherever the
template sits.

Finally, make the home page use it. Replace `pages/index.md` with:

```markdown
---
layout: pages/blog.pug
title: My blog
description: Notes and posts, newest first.
---

# My blog

Welcome! Here is everything I have written so far.
```

This is the template you published — yours to edit:

```pug
//- Handles both shapes `getAppData` can produce:
//-   flat    — `app.pageList` is an array          (config uses `page_path`)
//-   grouped — `app.pageList` is keyed by path     (config uses `page_paths`)
//- The flat branch emits exactly the markup this template has always emitted,
//- so published copies keep rendering identically.
mixin pageListItems(pages)
    each page in pages
        article.page-list__item
            header.page-list__header
                h3.page-list__item-title
                    a.page-list__link(href=page.href) #{page.title}
            if page.description
                p.page-list__description #{page.description}
            footer.page-list__footer
                a.page-list__more-link(href=page.href) #{page.moreLinkText}

-
    var pageList = app.pageList
    var isFlat = Array.isArray(pageList)
    var groups = []

    if (isFlat) {
        groups = pageList.length ? [{ key: null, pages: pageList }] : []
    } else if (pageList && typeof pageList === 'object') {
        groups = Object.keys(pageList)
            .filter(function (key) {
                return Array.isArray(pageList[key]) && pageList[key].length > 0
            })
            .map(function (key) {
                return { key: key, pages: pageList[key] }
            })
    }

if groups.length > 0
    section.page-list
        h2.page-list__title Recent Pages
        if isFlat
            +pageListItems(groups[0].pages)
        else
            each group in groups
                div.page-list__group
                    h3.page-list__group-title #{group.key}
                    +pageListItems(group.pages)
```

Each post becomes an `article` with its title, description and a "Read more"
link, under the heading "Recent Pages". To change the heading or the markup, edit
this file — it is your copy now. Running `npx nera-simple-page-list` again skips
the folder because it already exists; `npx nera-simple-page-list --force`
overwrites it with the shipped version and discards your edits.

Prefer to write the list yourself? See
[Write your own local plugin](/tutorials/write-a-local-plugin.html).

## 4. Grow it

- **Tags:** give posts `tags:` and get a page per tag with
  [Tag your content](/tutorials/tag-your-content.html).
- **Previous/next links:** link each post to its neighbours in `pages/posts/` with
  [Add prev/next links between pages](/tutorials/prev-next-pagination.html).
- **Sitemap:** set your site's origin as in
  [Add canonical links for SEO](/tutorials/canonical-links-seo.html), then add
  `@nera-static/plugin-sitemap` from the [plugin catalog](/plugins/index.html).
- **Images and code:** `@nera-static/plugin-images` (responsive images) and
  `@nera-static/plugin-code-blocks` (syntax highlighting) are in the
  [plugin catalog](/plugins/index.html) too.

## 5. Preview and build

```bash
npm run dev
```

Open `http://localhost:3000`: the home page lists "My second post" above "Hello
world", and each title links to its post. The preview rebuilds when you save a
file.

When you're ready to publish, build the site once:

```bash
npm run build
```

The finished blog is in `public/` — upload that folder to any static host.
