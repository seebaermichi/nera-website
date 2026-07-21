---
layout: pages/docs.pug
title: Erste Schritte
slug: getting-started
lang: de
description: Erstelle eine neue Nera-Website mit dem Installer und rendere sie.
pagination_order: 2
---

# Erste Schritte

## Voraussetzungen

- **Node.js ≥ 20**
- npm (in Node enthalten)

## Website erstellen

Die CLI `@nera-static/installer` klont den Generator und macht daraus dein eigenes
Projekt:

```bash
npx @nera-static/installer new my-site
cd my-site
npm run dev
```

`npm run dev` rendert die Website und startet eine Vorschau mit Live-Reload unter
`http://localhost:3000`.

## Für die Produktion bauen

```bash
npm run render
```

Das löscht und erzeugt `public/` neu. Lade diesen Ordner auf einen beliebigen
statischen Host.

## Später aktualisieren

```bash
npx @nera-static/installer update
```

`nera update` aktualisiert den Generator-Kern an Ort und Stelle, während deine
`pages/`, `config/` und `views/` unangetastet bleiben.
