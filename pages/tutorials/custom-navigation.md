---
layout: pages/tutorial.pug
title: Build a navigation with active states
slug: custom-navigation
lang: en
description: Use plugin-navigation to render a header and footer menu, with the current page highlighted.
keywords: nera navigation, plugin-navigation, active menu, static site nav
tags: plugins, navigation
pagination_order: 2
createdAt: 2026-07-20
verified_on: 2026-10-13
verified_with:
    plugin-navigation: 3.1.1
---
`@nera-static/plugin-navigation` turns a YAML list into a navigation menu and marks
the link for the current page — no JavaScript required.

## 1. Install and publish the template

```bash
npm install @nera-static/plugin-navigation
npx nera-navigation
```

The second command copies the nav templates into
`theme/views/vendor/plugin-navigation/`, where you can edit them freely.

## 2. Define the menu

Create `config/navigation.yaml`. A single flat menu looks like this:

```yaml
active_class: nav__link--active
active_path_class: nav__link--active-path
nav_class: nav

elements:
    - href: /index.html
      name: Home
    - href: /docs/index.html
      name: Docs
```

All three class keys are optional, and the values above are their defaults, so this
example renders the same as one without them. `active_class` goes on the link to the
current page, `active_path_class` on a section link — one pointing at a folder's index,
such as `/docs/index.html` or `/docs/` — when the current page sits in that folder or below
(the site root never counts). `nav_class` is the BEM block name the other classes derive
from: `nav_class: mainmenu` renames the whole family to `.mainmenu`, `.mainmenu--list`,
`.mainmenu__item`, `.mainmenu__link`, `.mainmenu__link--active` and
`.mainmenu__link--active-path`. The two state keys override just their own class, so
when you rename, drop them — left as above, they keep `nav__link--active`.

Every entry needs an `href`: one without it is skipped with a warning, and the build
still succeeds.

> Upgrading from 2.x? Publishing skips an existing `theme/views/vendor/plugin-navigation/`,
> so the old templates stay and `nav_class` seems to do nothing. Run
> `npx nera-navigation --force` once — it overwrites that folder, so if you edited your
> copy, save your changes first and carry them over.

Need more than one menu? Nest them under names — each becomes
`app.nav.<name>.elements`:

```yaml
elements:
    main:
        - href: /index.html
          name: Home
        - href: /docs/index.html
          name: Docs
    footer:
        - href: /about.html
          name: About
```

The plugin exposes everything under `app.nav`.

## 3. Render it in a layout

Include the published partial and call its mixin:

```pug
include /vendor/plugin-navigation/partials/link-list-navigation

header.site-header
  if app.nav && app.nav.main
    nav.nav--main(aria-label='Main menu')
      +linkListNav(app.nav.main.elements)
```

The plugin adds the active class from section 2 (`nav__link--active` by default) to
the link matching the current page, and the active-path class
(`nav__link--active-path`) to the section link the page sits in, so styling the
current section is just CSS. The `nav` with its `aria-label` makes the menu a named
navigation landmark for screen readers. The leading `/` in the include resolves from
`theme/views/`, wherever the including file sits.

> Prefer a different shape? The plugin also ships `simple-navigation` and
> `pipe-separated-navigation` partials — same data, different markup.

This site uses exactly this setup for its header and footer — see
[`config/navigation.yaml`](https://github.com/seebaermichi/nera-website/blob/main/config/navigation.yaml) in the source.
