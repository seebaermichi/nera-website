---
layout: pages/tutorial.pug
title: Reusable content blocks with plugin-stacks
slug: reusable-content-blocks
lang: en
description: Write sections once in Markdown and place them in any view with plugin-stacks, as single blocks or as ordered, per-language stack groups.
keywords: nera stacks, plugin-stacks, reusable content, content blocks, stack groups, feature grid
tags: plugins, stacks
pagination_order: 9
createdAt: 2026-10-23
verified_on: 2026-10-25
verified_with:
    plugin-stacks: 2.4.0
    validate: 1.7.0
---
Some content belongs to no single page: a call to action under every article,
a newsletter box, the feature grid on a homepage. `@nera-static/plugin-stacks`
lets you write such a block once, as a Markdown file in `pages/`, and place it
in any view through `app.stacks`. Several blocks that form one section become a
**stack group**, ordered and split by language.

## 1. Install

```bash
npm install @nera-static/plugin-stacks
```

Nera finds the plugin on its own. It needs no config file: stacks are defined
in frontmatter.

## 2. What makes a page a stack

A stack is a Markdown file under `pages/` whose frontmatter sets
**`type: stack`** and a `slug` or a `title`. Where the file lives does not
matter. A `pages/stacks/` folder simply keeps the blocks together:

```markdown:pages/stacks/newsletter.md
---
type: stack
title: Newsletter signup
---
Get **one email a month** with what changed.
```

Note what is missing: **`layout`**. Nera writes a page to `public/` only if
its frontmatter has a layout, so a stack without one stays a fragment that
other pages embed, not a page of its own. `nera validate` and
`nera build --check` know this: since `@nera-static/validate` 1.6.1 they no
longer warn `layout-missing` for a page with `type: stack`.

## 3. Use a single stack

Every stack lands in `app.stacks`, keyed by its slug, with the same
`{ content, meta }` shape as a page: `content` is the rendered HTML, `meta` the
whole frontmatter. Without an explicit `slug`, the key is the title lowercased,
with spaces replaced by **underscores**: `Newsletter signup` becomes
`newsletter_signup`.

Place it in a view, guarded so a missing stack does not break the page:

```pug:theme/views/pages/default.pug
extends ../layouts/layout

block content
  main#main
    != content
    if app.stacks.newsletter_signup
      aside.newsletter!= app.stacks.newsletter_signup.content
```

The aside then holds
`<p>Get <strong>one email a month</strong> with what changed.</p>`.

Only spaces are replaced: a title with punctuation produces a key that dot
access cannot read. Set an explicit `slug` for such titles, or whenever you want
a key that does not change when the title does. Slugs are one namespace for the
whole site; if two stacks end up with the same one, the later one wins and the
plugin warns.

## 4. Render a stack through a template

A stack can bring its own markup. Publish the plugin's default template:

```bash
npx nera-stacks
```

It lands in `theme/views/vendor/plugin-stacks/stack-template.pug`. Point a
stack at it with **`stack_layout`**, a path from the **project root** (where
you run `nera build`), not from the views folder:

```markdown:pages/stacks/call-to-action.md
---
type: stack
slug: call_to_action
title: Ready to start?
description: One command scaffolds a site.
stack_layout: theme/views/vendor/plugin-stacks/stack-template.pug
---
Run `npx @nera-static/nera new my-site` and you are live in minutes.
```

`app.stacks.call_to_action.content` now holds the template's output, not the
bare Markdown:

```html
<section class="stack">
  <header class="stack__header">
    <h2 class="stack__title">Ready to start?</h2>
    <p class="stack__description">One command scaffolds a site.</p>
  </header>
  <article class="stack__content">
    <p>Run <code>npx @nera-static/nera new my-site</code> and you are live in minutes.</p>
  </article>
</section>
```

The template reads the stack as `stack.meta` and `stack.content`, so you can
edit your copy or write your own. The BEM classes are the plugin's public
contract: style them from your CSS. Publishing skips a folder that already
exists, so after a plugin update `npx nera-stacks --force` fetches the new
template and overwrites your edits.

## 5. Stack groups

A feature grid is a *list* of blocks. Give each block its own stack page, put
them into the same **`stack_group`**, and set their order with
**`stack_order`**:

```markdown:pages/stacks/home-features/01-markdown.md
---
type: stack
stack_group: home_features
stack_order: 1
lang: en
title: Markdown in, HTML out
---
Author content in Markdown with YAML frontmatter.
```

The plugin then adds two keys:

- **`app.stackGroups[<group>]`** — every stack of the group, in order.
- **`app.stackGroupsByLang[<group>][<lang>]`** — the same, split by `lang`. A
  stack without `lang` counts as the site's `app.lang`.

Each entry is `{ content, meta }` again, so a view loops over it:

```pug
- const features = app.stackGroupsByLang?.home_features?.[meta.lang || app.lang] || []
each feature in features
  .feature
    h2.feature__title #{ feature.meta.title }
    .feature__body!= feature.content
```

On a single-language site, `each feature in app.stackGroups.home_features || []`
is enough.

Stacks with a numeric `stack_order` come first, ascending; the rest follow in
build order. A grouped stack needs neither a `slug` nor a `title`, and it stays
**out of `app.stacks`** unless it sets an explicit `slug`. In a test site with
three grouped stacks, of which only one had a `slug: feature_plugins`,
`app.stacks` held exactly that one next to the two ungrouped stacks:
`call_to_action`, `feature_plugins`, `newsletter_signup`. That keeps the same
section in three languages from colliding on title-derived keys.

## 6. A real example: this site's feature grid

The four boxes on the [nera.js.org homepage](/index.html) are a stack group.
Each box is one file in `pages/stacks/home-features/`, with translations in
`pages/de/stacks/home-features/` and `pages/es/stacks/home-features/`:

```markdown:pages/stacks/home-features/01-markdown.md
---
type: stack
stack_group: home_features
stack_order: 1
lang: en
title: Markdown in, HTML out
---

Author content in Markdown with YAML frontmatter. Nera renders each page through a Pug layout you control and writes plain, fast HTML.
```

The homepage view picks the boxes for the current language and numbers them
from their position in the list:

```pug:theme/views/pages/home.pug
- const features = app.stackGroupsByLang?.home_features?.[curLang] || []
if features.length
  .home-body__grid
    each feature, i in features
      .home-body__feature
        p.home-body__feature-num #{ String(i + 1).padStart(2, '0') }
        h2.home-body__feature-title #{ feature.meta.title }
        .home-body__feature-desc!= feature.content
```

`curLang` is set in the site's base layout from `meta.lang`. Adding a fifth
box is one new Markdown file per language, with no change to the view.

## 7. Pitfall: stack pages are still pages

A stack has no layout, so it is never built, but it stays in the page list
every other plugin sees. In a test site with stacks in `pages/stacks/`, the
plugins behaved like this:

| plugin | sees stack pages? | what to do |
|---|---|---|
| `plugin-search` | no — pages without `layout` are left out of the index | nothing |
| `plugin-page-pagination` | no — a page without `layout` is never a previous/next target | nothing |
| `plugin-navigation` | no — it lists only the `href`s in `config/navigation.yaml` | nothing |
| `plugin-statistics` | **yes** — it counts every Markdown file under `pages/` | keep the counted keys (`tags`, `category`, …) off stack pages |
| `plugin-simple-page-list` | **yes** — with `page_path: /stacks`, it listed every stack with an `href` like `/stacks/newsletter.html` that was never built | keep stacks out of listed folders, or exclude them with `exclude_pages` |

The `exclude_pages` entries use the stack's would-be page URL:

```yaml:config/simple-page-list.yaml
page_path: /blog
exclude_pages:
    - /blog/newsletter.html
```

A folder of its own, like `pages/stacks/`, is the simpler fix: no listed path
matches it, so nothing needs excluding.

## Next

[How this website is built](/tutorials/how-this-site-is-built.html) shows how
plugin-stacks works together with the other plugins on this site. To merge
whole sections into one scrolling page instead, see
[Build a one-page site](/tutorials/one-page-site.html).
