---
layout: pages/docs.pug
title: Grundkonzepte
slug: core-concepts
lang: de
description: Die Render-Pipeline, die Objekte app und meta, Layouts und Übersetzungen.
pagination_order: 3
---

# Grundkonzepte

## Die vierstufige Pipeline

Jeder Build durchläuft dieselbe feste Pipeline: **App-Daten laden → Seiten rendern →
Plugins anwenden → Ausgabe schreiben.** Wenn du diese vier Stufen verstehst, erklärt
das fast alles am Verhalten von Nera.

## `app` vs. `meta`

Zwei Datenobjekte erreichen deine Templates:

- **`app`** — globale Werte aus `config/app.yaml`, auf jeder Seite verfügbar.
- **`meta`** — seitenspezifische Werte: dein Frontmatter, plus abgeleitete Schlüssel wie
  `meta.href`, `meta.dirname`, `meta.filename` und `meta.createdAt`.

Plugins ergänzen beide — zum Beispiel setzt `plugin-navigation` `app.nav`, und
`plugin-tags` setzt `meta.tagLinks`.

## Layouts

Layouts sind Pug-Dateien unter `views/`. Das `layout`-Frontmatter einer Seite wählt eines aus:

```markdown
---
layout: pages/docs.pug
title: My page
---
```

## Übersetzungen

`config/app.yaml` enthält eine `translations`-Map. In einem Layout löst `t('key')`
`app.translations[meta.lang || app.lang][key]` auf und fällt auf den Schlüssel selbst zurück —
so werden fehlende Übersetzungen sichtbar, nicht stillschweigend verschluckt.
