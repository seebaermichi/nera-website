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

- **Node.js 22.12 oder neuer**
- npm (in Node enthalten)

## Website erstellen

`nera new` erstellt eine neue Website, deren einzige Nera-Abhängigkeit
`@nera-static/nera` ist; das Paket bringt die `@nera-static/core`-Engine mit —
kein Klon, kein mitgeführter Quellcode:

```bash
npx @nera-static/nera new my-site
cd my-site
npm run dev
```

`npm run dev` rendert die Website und startet eine Vorschau mit Live-Reload unter
`http://localhost:3000`. Bist du schon im Ordner, in dem die Website liegen soll?
`npx @nera-static/nera new .` erstellt sie im aktuellen, leeren Ordner.

## Für die Produktion bauen

```bash
npm run build
```

Das löscht und erzeugt `public/` neu. Lade diesen Ordner auf einen beliebigen
statischen Host.

## Später aktualisieren

```bash
npx nera update
```

`nera update` aktualisiert die Nera-Pakete der Website mit `npm update` und
erneuert Neras Teil der `AGENTS.md`, während deine `pages/`, `config/` und
`theme/` unangetastet bleiben. Ab `@nera-static/nera` 1.15.0 hebt es außerdem
ihre `^`-Versionsbereiche in `package.json` (und `package-lock.json`) auf die
installierten Versionen an, aus `^1.0.0` wird etwa `^1.15.0`; über eine
Hauptversion hinweg geht es nie. Wie ein KI-Assistent `AGENTS.md` nutzt, steht in
[Nera mit KI nutzen](/de/docs/using-ai.html).
