---
layout: pages/tutorial.pug
title: Clientseitige Suche hinzufügen
slug: add-search
lang: de
description: Verdrahte plugin-search, um einen Index und ein funktionierendes Suchfeld zu generieren.
keywords: nera Suche, Static-Site-Suche, clientseitige Suche
tags: plugins, search
pagination_order: 4
---
`@nera-static/plugin-search` baut zur Render-Zeit einen JSON-Index und liefert ein kleines
Client-Skript — kein Server erforderlich.

## 1. Installieren

```bash
npm install @nera-static/plugin-search
```

## 2. Das Template veröffentlichen

```bash
npx nera-search
```

Dies kopiert das Suchfeld nach `views/vendor/plugin-search/` und den Client nach
`assets/js/search.js`.

## 3. Konfigurieren

`config/search.yaml` steuert, welche Felder indexiert werden:

```yaml
fields:
    - title
    - description
    - content
    - href
strip_html: true
output_filename: search-index.json
```

## 4. Eine Suchseite hinzufügen

Erstelle eine Seite, die das veröffentlichte Such-Partial einbindet, und stelle dann sicher, dass die Suche
**zuletzt** in `config/plugin-order.yaml` läuft, damit sie die finalen Seitendaten indexiert:

```yaml
plugin-order:
    - end:
          - plugin-search
```

Rendere, und du hast eine funktionierende Suche. Die [Suchseite](/de/search.html) dieser Website ist
genau auf diese Weise gebaut.
