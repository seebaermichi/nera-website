---
layout: pages/home.pug
title: Start
slug: home
lang: de
description: Nera ist ein leichtgewichtiger, Plugin-basierter Static-Site-Generator. Schreibe Markdown, gestalte mit Pug und erweitere mit kleinen, fokussierten Plugins.
keywords: nera, static site generator, ssg, markdown, pug, node
---

## Warum Nera

Nera macht aus einem Ordner voller Markdown-Dateien eine schnelle statische Website.
Kein Framework-Lock-in, keine schwere Toolchain — eine vierstufige Pipeline, die du
an einem Nachmittag verstehst, und ein Plugin-System, bei dem jede Funktion ein
kleines, fokussiertes Paket ist, das du bei Bedarf hinzufügst.

### Markdown rein, HTML raus
Schreibe Inhalte in Markdown mit YAML-Frontmatter. Nera rendert jede Seite über ein
Pug-Layout, das du kontrollierst, und schreibt schlankes, schnelles HTML nach
`public/`.

### Plugins statt Magie
Navigation, Tags, Suche, Pagination, Canonical Links und mehr werden als separate
`@nera-static/plugin-*`-Pakete ausgeliefert. Installiere, was du brauchst, und
ignoriere den Rest.

### Templates, die dir gehören
Veröffentliche die Pug-Templates eines Plugins in `views/vendor/` und gestalte sie
mit deinem eigenen CSS. Nichts ist tief in `node_modules` versteckt, wo du nicht
herankommst.

### Kein Build-Schritt
Kein Bundler zu konfigurieren. `npm run render` baut die Website; `npm run dev`
liefert eine Vorschau mit Live-Reload. Node ≥ 18 — das ist die ganze
Abhängigkeitsgeschichte.
