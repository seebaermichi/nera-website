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
├── config/        # app.yaml + je eine <plugin>.yaml pro Plugin
├── pages/         # deine Markdown-Inhalte
├── views/         # Pug-Layouts (und vendor/-Templates aus Plugins)
├── assets/        # CSS, JS, Bilder — unverändert nach public/ kopiert
└── public/        # generierte Ausgabe (niemals von Hand bearbeiten)
```

## Wie aus einer Seite HTML wird

1. **Laden** von `config/app.yaml` in das `app`-Objekt und Auflisten von `pages/`.
2. **Rendern** jeder Markdown-Datei, wobei das Frontmatter in `meta` extrahiert wird.
3. **Plugins anwenden**, die `app` und `meta` anreichern.
4. **Schreiben** nach `public/`, wobei jede Seite durch ihr `layout` läuft.

> Eine Seite wird nur gerendert, wenn ihr Frontmatter ein `layout` festlegt. Seiten
> ohne `layout` werden stillschweigend übersprungen — das ist die häufigste Ursache
> für „Warum fehlt meine Seite?“.

Weiter geht es mit **Erste Schritte**, um deine erste Website zu erstellen.
