---
layout: pages/docs.pug
title: Einführung
slug: docs
lang: de
description: Was Nera ist, wie es funktioniert und wie es weitergeht.
pagination_order: 1
---

# Dokumentation

Nera ist ein leichtgewichtiger Static-Site-Generator, der auf einer einfachen Idee
beruht: **Markdown rein, HTML raus — mit Plugins für alles andere.** Diese Anleitung
führt dich von einem leeren Ordner zu einer veröffentlichten Website.

## Der Aufbau eines Nera-Projekts

```
my-site/
├── config/          # app.yaml + je eine <plugin>.yaml pro Plugin
├── pages/           # deine Markdown-Inhalte
├── theme/
│   ├── views/       # Pug-Layouts und Seiten-Templates (vendor/ enthält Plugin-Templates)
│   └── assets/      # CSS, JS, Bilder, Schriften — unverändert nach public/ kopiert
├── src/plugins/     # optionale lokale Plugins, je eines pro Ordner
├── public/          # generierte Ausgabe (niemals von Hand bearbeiten)
├── AGENTS.md        # Anweisungen für KI-Assistenten (CLAUDE.md verweist darauf)
└── package.json     # eine einzige Nera-Abhängigkeit: @nera-static/nera
```

`nera new` legt alles davon an außer `src/plugins/` und `public/`. Lokale
Plugins können auch in einem anderen Ordner liegen, festgelegt mit
`folders.plugins` in `config/app.yaml`. Websites aus der Zeit vor dem
Theme-System haben `views/` und `assets/` noch direkt im Projektordner; Nera
baut sie weiterhin, mit einer Deprecation-Warnung, bis du beide Ordner nach
`theme/` verschiebst.

## Wie aus einer Seite HTML wird

1. **Laden** von `config/app.yaml` in das `app`-Objekt und Auflisten von `pages/`.
2. **Rendern** jeder Markdown-Datei, wobei das Frontmatter in `meta` extrahiert wird.
3. **Plugins anwenden**, die `app` und `meta` anreichern.
4. **Schreiben** nach `public/`, wobei jede Seite durch ihr `layout` läuft.

> Eine Seite wird nur gerendert, wenn ihr Frontmatter ein `layout` festlegt. Seiten
> ohne `layout` werden stillschweigend übersprungen — das ist die häufigste Ursache
> für „Warum fehlt meine Seite?“. `npx nera validate` listet sie auf
> (`layout-missing`).

Weiter geht es mit **Erste Schritte**, um deine erste Website zu erstellen.
