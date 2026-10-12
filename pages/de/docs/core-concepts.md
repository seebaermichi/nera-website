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

Layouts sind Pug-Dateien unter `theme/views/`. Das `layout`-Frontmatter einer Seite wählt eines aus:

```markdown
---
layout: pages/docs.pug
title: My page
---
```

Der Pfad ist relativ zu `theme/views/`, `pages/docs.pug` ist also
`theme/views/pages/docs.pug`.

Setzt `config/app.yaml` ein `theme:` (ein Paket wie `@nera-static/theme-example`
oder einen lokalen Ordner), kommen die Layouts aus diesem Theme, und eine Datei in
deinem eigenen `theme/views/` oder `theme/assets/` ersetzt die Datei des Themes
am selben Pfad — so überschreibst du ein einzelnes Template, ohne den Rest zu
kopieren. `npx @nera-static/nera new my-site --theme example` startet eine
Website auf diese Weise.

## Übersetzungen

`config/app.yaml` enthält eine `translations`-Map. In einem Layout löst `t('key')`
`app.translations[meta.lang || app.lang][key]` auf und fällt auf den Schlüssel selbst zurück —
so werden fehlende Übersetzungen sichtbar, nicht stillschweigend verschluckt.
