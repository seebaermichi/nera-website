---
layout: pages/tutorial.pug
title: Eine Navigation mit aktiven Zuständen bauen
slug: custom-navigation
lang: de
description: Nutze plugin-navigation, um ein Kopf- und Fußzeilenmenü zu rendern, bei dem die aktuelle Seite hervorgehoben wird.
keywords: nera Navigation, plugin-navigation, aktives Menü, Static-Site-Navigation
tags: plugins, navigation
pagination_order: 2
createdAt: 2026-07-20
---
`@nera-static/plugin-navigation` verwandelt eine YAML-Liste in ein Navigationsmenü und markiert
den Link für die aktuelle Seite — ganz ohne JavaScript.

## 1. Das Template installieren und veröffentlichen

```bash
npm install @nera-static/plugin-navigation
npx nera-navigation
```

Der zweite Befehl kopiert die Nav-Templates nach
`theme/views/vendor/plugin-navigation/`, wo du sie frei bearbeiten kannst.

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

Alle drei Klassen-Schlüssel sind optional, und die Werte oben sind ihre Standardwerte —
dieses Beispiel rendert also genauso wie eines ohne sie. `active_class` landet auf dem Link
zur aktuellen Seite, `active_path_class` auf einem Bereichs-Link — einem, der auf den Index
eines Ordners zeigt, etwa `/docs/index.html` oder `/docs/` —, wenn die aktuelle Seite in diesem
Ordner oder darunter liegt (das Wurzelverzeichnis zählt nie). `nav_class` ist der BEM-Blockname, von dem
sich die übrigen Klassen ableiten: `nav_class: mainmenu` benennt die ganze Familie um in
`.mainmenu`, `.mainmenu--list`, `.mainmenu__item`, `.mainmenu__link`,
`.mainmenu__link--active` und `.mainmenu__link--active-path`. Die beiden Zustands-Schlüssel
überschreiben nur ihre eigene Klasse — wenn du umbenennst, lass sie also weg; so wie oben
gesetzt, bleibt es bei `nav__link--active`.

Jeder Eintrag braucht ein `href`: Einer ohne wird mit einer Warnung übersprungen, und der
Build läuft trotzdem durch.

> Du aktualisierst von 2.x? Das Veröffentlichen überspringt einen vorhandenen Ordner
> `theme/views/vendor/plugin-navigation/`, also bleiben die alten Templates, und `nav_class`
> scheint nichts zu bewirken. Führe einmal `npx nera-navigation --force` aus — es
> überschreibt diesen Ordner. Hast du deine Kopie bearbeitet, sichere deine Änderungen also
> vorher und übertrage sie danach.

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
include /vendor/plugin-navigation/partials/link-list-navigation

header.site-header
  if app.nav && app.nav.main
    nav.nav--main(aria-label='Hauptmenü')
      +linkListNav(app.nav.main.elements)
```

Das Plugin fügt dem Link, der zur aktuellen Seite passt, die aktive Klasse aus Abschnitt 2
hinzu (standardmäßig `nav__link--active`) und dem Bereichs-Link, in dem die Seite liegt, die
Active-Path-Klasse (`nav__link--active-path`), sodass das Stylen des aktuellen Bereichs reines
CSS ist. Das `nav` mit seinem `aria-label` macht das Menü zu einer benannten
Navigations-Landmarke für Screenreader. Der führende `/` im Include wird von `theme/views/`
aus aufgelöst, egal wo die einbindende Datei liegt.

> Bevorzugst du eine andere Form? Das Plugin liefert auch die Partials `simple-navigation` und
> `pipe-separated-navigation` — dieselben Daten, anderes Markup.

Diese Seite nutzt genau dieses Setup für ihre Kopf- und Fußzeile — siehe
`config/navigation.yaml` im Quellcode.
