---
layout: pages/tutorial.pug
title: Eine Navigation mit aktiven Zuständen bauen
slug: custom-navigation
lang: de
description: Nutze plugin-navigation, um ein Kopf- und Fußzeilenmenü zu rendern, bei dem die aktuelle Seite hervorgehoben wird.
keywords: nera Navigation, plugin-navigation, aktives Menü, Static-Site-Navigation
tags: plugins, navigation
pagination_order: 2
---

# Eine Navigation mit aktiven Zuständen bauen

`@nera-static/plugin-navigation` verwandelt eine YAML-Liste in ein Navigationsmenü und markiert
den Link für die aktuelle Seite — ganz ohne JavaScript.

## 1. Das Template installieren und veröffentlichen

```bash
npm install @nera-static/plugin-navigation
npx nera-navigation
```

Der zweite Befehl kopiert die Nav-Templates nach
`views/vendor/plugin-navigation/`, wo du sie frei bearbeiten kannst.

## 2. Das Menü definieren

Erstelle `config/navigation.yaml`. Ein einzelnes flaches Menü sieht so aus:

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

Brauchst du mehr als ein Menü? Verschachtele sie unter Namen — jedes wird zu
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

Das Plugin stellt alles unter `app.nav` bereit.

## 3. In einem Layout rendern

Binde das veröffentlichte Partial ein und rufe sein Mixin auf:

```pug
include ../vendor/plugin-navigation/partials/link-list-navigation

header.site-header
  if app.nav && app.nav.main
    +linkListNav(app.nav.main.elements, 'nav--main')
```

Das Plugin fügt dem Link, der zur aktuellen Seite passt, `nav__link--active` hinzu und
`nav__link--active-path` jedem übergeordneten Link, sodass das Stylen des aktuellen Bereichs
reines CSS ist.

> Bevorzugst du eine andere Form? Das Plugin liefert auch die Partials `simple-navigation` und
> `pipe-separated-navigation` — dieselben Daten, anderes Markup.

Diese Seite nutzt genau dieses Setup für ihre Kopf- und Fußzeile — siehe
`config/navigation.yaml` im Quellcode.
