---
layout: pages/tutorial.pug
title: Build a navigation with active states
slug: custom-navigation
lang: en
description: Use plugin-navigation to render a header and footer menu, with the current page highlighted.
keywords: nera navigation, plugin-navigation, active menu, static site nav
tags: plugins, navigation
pagination_order: 2
---
`@nera-static/plugin-navigation` turns a YAML list into a navigation menu and marks
the link for the current page — no JavaScript required.

## 1. Install and publish the template

```bash
npm install @nera-static/plugin-navigation
npx nera-navigation
```

The second command copies the nav templates into
`views/vendor/plugin-navigation/`, where you can edit them freely.

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
include ../vendor/plugin-navigation/partials/link-list-navigation

header.site-header
  if app.nav && app.nav.main
    +linkListNav(app.nav.main.elements, 'nav--main')
```

The plugin adds `nav__link--active` to the link matching the current page and
`nav__link--active-path` to any ancestor link, so styling the current section is
just CSS.

> Prefer a different shape? The plugin also ships `simple-navigation` and
> `pipe-separated-navigation` partials — same data, different markup.

This site uses exactly this setup for its header and footer — see
`config/navigation.yaml` in the source.
