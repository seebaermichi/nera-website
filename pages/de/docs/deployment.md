---
layout: pages/docs.pug
title: Deployment
slug: deployment
lang: de
description: Die Seite bauen und den public/-Ordner hosten.
pagination_order: 6
---

# Deployment

Nera erzeugt einen einfachen `public/`-Ordner — deploye ihn überall dort, wo
statische Dateien ausgeliefert werden.

## Bauen

```bash
npm run render
```

## Hosten

- **Netlify / Vercel** — Build-Befehl `npm run render`, Publish-Verzeichnis
  `public`.
- **GitHub Pages** — in CI rendern, dann `public/` in den `gh-pages`-Branch veröffentlichen.
- **Beliebiger statischer Host / CDN** — den Inhalt von `public/` hochladen.

## Bevor du startest

- Setze `app_origin` in `config/canonical-links.yaml` auf deine echte Domain,
  damit die kanonischen URLs korrekt sind.
- Füge eine `.neraignore` im Projektstamm hinzu, um reine Quell-Assets aus dem
  Build herauszuhalten.

> `public/` wird bei jedem Rendern gelöscht und neu gebaut — bearbeite es niemals
> von Hand und committe es niemals als Quelle.
