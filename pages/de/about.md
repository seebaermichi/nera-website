---
layout: pages/default.pug
title: Über Nera
slug: about
lang: de
description: Was Nera ist, seine Philosophie und wie man mitmacht.
keywords: über nera, Philosophie Static-Site-Generator
---

# Über Nera

Nera ist ein quelloffener Static-Site-Generator mit einer bewusst kleinen
Angriffsfläche. Die gesamte Pipeline — laden, rendern, Plugins anwenden,
schreiben — passt in eine Handvoll Dateien, die du in einer Sitzung lesen kannst.

## Philosophie

- **Transparent statt magisch.** Keine versteckten Konventionen; eine Seite wird
  gerendert, weil ihr Frontmatter es so sagt.
- **Kompositionsfähig statt monolithisch.** Funktionen leben in kleinen
  `@nera-static/plugin-*`-Paketen, für die du dich entscheidest.
- **Dir gehörend.** Templates werden in dein Projekt veröffentlicht, damit du sie
  direkt gestalten und bearbeiten kannst.

## Mitmachen

Nera und seine Plugins werden offen auf
[GitHub](https://github.com/seebaermichi/nera) entwickelt. Issues, Ideen und Pull
Requests sind willkommen — siehe den Plugin-Katalog auf der Seite
[Plugins](/de/plugins/index.html).

## Diese Seite

Diese Website ist selbst mit Nera gebaut und nutzt `plugin-navigation`,
`plugin-tags`, `plugin-search`, `plugin-page-pagination` und
`plugin-canonical-links` — plus ein kleines lokales Plugin für die
Tutorials-Liste.
