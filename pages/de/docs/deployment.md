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
npm run build
```

## Hosten

- **Netlify / Vercel** — Build-Befehl `npm run build`, Publish-Verzeichnis
  `public`.
- **GitHub Pages** — in CI rendern, dann `public/` in den `gh-pages`-Branch veröffentlichen.
- **Beliebiger statischer Host / CDN** — den Inhalt von `public/` hochladen.

## Cache Busting

Browser speichern Stylesheets, Skripte und Schriften zwischen, deshalb sehen
Besucher nach einem Deploy eventuell noch das alte CSS oder JS, bis sie die Seite
hart neu laden. Aktiviere Content-Hashing in `config/app.yaml` (benötigt
`@nera-static/core` 4.11 oder neuer):

```yaml
asset_hashing: true
```

Bei jedem Build hängt Nera `?v=<hash>` an jede lokale Asset-URL an — Stylesheets,
Skripte, Bilder, `srcset`, den Suchindex und `url(…)`-Verweise im CSS wie
Schriften. Der Hash stammt aus dem Inhalt der Datei, die URL ändert sich also
genau dann, wenn sich die Datei ändert, und bleibt sonst cachebar. Deine
Templates behalten einfache Pfade wie `/css/main.css`; füge `?v=` niemals von
Hand hinzu.

Links auf Seiten, externe URLs und URLs, die bereits einen Query-String haben,
bleiben unverändert, und es funktioniert zusammen mit `base_path`. Ohne den
Schlüssel bleibt die Build-Ausgabe unverändert.

## Bevor du startest

- Setze `app_origin` in `config/canonical-links.yaml` auf deine echte Domain,
  damit die kanonischen URLs korrekt sind.
- Füge eine `.neraignore` im Projektstamm hinzu, um reine Quell-Assets aus dem
  Build herauszuhalten.

> `public/` wird bei jedem Rendern gelöscht und neu gebaut — bearbeite es niemals
> von Hand und committe es niemals als Quelle.
