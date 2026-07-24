---
layout: pages/home.pug
title: Start
slug: home
lang: de
description: Nera ist ein leichtgewichtiger, Plugin-basierter Static-Site-Generator. Schreibe Markdown, gestalte mit Pug und erweitere mit kleinen, fokussierten Plugins.
keywords: nera, static site generator, ssg, markdown, pug, node
features:
    - title: Markdown rein, HTML raus
      description: Schreibe Inhalte in Markdown mit YAML-Frontmatter. Nera rendert jede Seite über ein Pug-Layout, das du kontrollierst, und schreibt schlankes HTML.
    - title: Plugins statt Magie
      description: Navigation, Tags, Suche, Pagination und mehr kommen als separate @nera-static/plugin-*-Pakete. Installiere, was du brauchst; ignoriere den Rest.
    - title: Templates, die dir gehören
      description: Veröffentliche die Pug-Templates eines Plugins in views/vendor/ und gestalte sie mit deinem eigenen CSS. Nichts ist in node_modules versteckt.
    - title: Kein Build-Schritt
      description: Kein Bundler zu konfigurieren. npm run build baut die Website, npm run dev liefert eine Live-Vorschau. Node ≥ 20 — das ist die ganze Geschichte.
---

## Warum Nera

Nera macht aus einem Ordner voller Markdown-Dateien eine schnelle statische Website.
Kein Framework-Lock-in, keine schwere Toolchain — eine vierstufige Pipeline, die du
an einem Nachmittag verstehst, und ein Plugin-System, bei dem jede Funktion ein
kleines, fokussiertes Paket ist, das du bei Bedarf hinzufügst.
