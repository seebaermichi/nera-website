---
layout: pages/tutorial.pug
title: Clientseitige Suche hinzufügen
slug: add-search
lang: de
description: Verdrahte plugin-search, um einen Index und ein funktionierendes Suchfeld zu generieren.
keywords: nera Suche, Static-Site-Suche, clientseitige Suche
tags: plugins, search
pagination_order: 4
createdAt: 2026-07-18
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

## 5. Suche je Sprache (optional)

Standardmäßig landet jede Seite im selben Index — die Suche auf einer deutschen
Seite liefert damit auch englische und spanische Treffer. Mit `group_by_lang`
bekommt jede Sprache ihren eigenen Index:

```yaml
group_by_lang: true
```

Die Seiten werden nach `meta.lang` gruppiert, und der Sprachcode wird vor die
Endung von `output_filename` gesetzt. Die Standardsprache behält den
unveränderten Dateinamen:

```
/search-index.json       # Standardsprache
/search-index.de.json    # nur deutsche Seiten
/search-index.es.json    # nur spanische Seiten
```

Seiten ohne `meta.lang` fallen in die Standardsprache — `lang` in
`config/app.yaml` — eine einsprachige Website ändert sich also nicht.

Jede Seite trägt dann `meta.searchIndexPath`, den Index ihrer eigenen Sprache.
Das veröffentlichte `search.pug` gibt ihn als `data-search-index` an den Client
weiter, und `search.js` lädt genau diese URL — dein eigenes Markup bleibt
unberührt. Ein Detail dabei: `app.searchIndexPath` existiert weiterhin, zeigt bei
aktiver Gruppierung aber auf den Index der *Standardsprache*. Baust du das
Attribut daraus, durchsucht eine deutsche Seite den englischen Index.
`app.searchIndexPaths` enthält alle Sprachen nach Code, und jeder Eintrag im
Index trägt sein `lang`.

Weil die Suche zuletzt läuft (Schritt 4), landen auch von anderen Plugins
erzeugte Seiten in der richtigen Sprache — die Tag-Seiten aus `plugin-tags`
zum Beispiel.

Beim Aktualisieren einer bestehenden Website gibt es einen Haken: `npx
nera-search` überspringt bereits veröffentlichte Dateien, und `--force`
überschreibt sie samt deiner Anpassungen. Sind deine Kopien angepasst, führe die
beiden Änderungen lieber von Hand zusammen — das Attribut `data-search-index` im
Template und `input.dataset.searchIndex` in `search.js`. Bis dahin fragt der alte
Client weiterhin `/search-index.json` ab, und jede Seite durchsucht die
Standardsprache.

Rendere, und du hast eine funktionierende Suche. Die [Suchseite](/de/search.html) dieser Website ist
genau auf diese Weise gebaut, mit `group_by_lang: true` — das Suchfeld liefert
nur Seiten in der Sprache, die du gerade liest.
