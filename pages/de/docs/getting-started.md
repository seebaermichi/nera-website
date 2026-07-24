---
layout: pages/docs.pug
title: Erste Schritte
slug: getting-started
lang: de
description: Erstelle eine neue Nera-Website mit der nera-CLI und baue sie.
pagination_order: 2
---

# Erste Schritte

## Voraussetzungen

- **Node.js ≥ 20**
- npm (in Node enthalten)

## Website erstellen

`nera new` erstellt eine neue Website, die von der `@nera-static/core`-Engine
abhängt — kein Klon, kein mitgeführter Quellcode:

```bash
npx @nera-static/nera new my-site
cd my-site
npm run dev
```

`npm run dev` rendert die Website und startet eine Vorschau mit Live-Reload unter
`http://localhost:3000`.

## Für die Produktion bauen

```bash
npm run build
```

Das löscht und erzeugt `public/` neu. Lade diesen Ordner auf einen beliebigen
statischen Host.

## Später aktualisieren

```bash
nera update
```

`nera update` aktualisiert die Nera-Pakete der Website mit `npm update`, während
deine `pages/`, `config/` und `theme/` unangetastet bleiben.
