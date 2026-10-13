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

Dies kopiert das Suchfeld nach `theme/views/vendor/plugin-search/` und den Client nach
`theme/assets/js/search.js`.

Beide Kopien gehören ab dann dir. Ein erneutes `npx nera-search` überspringt das
Template, sobald der Ordner `vendor/plugin-search/` existiert, und den Client,
sobald `search.js` existiert — es verwirft also nie deine Änderungen, bringt aber
auch eine Template-Änderung aus einem neuen Release nicht von selbst auf deine
Website. Zum Auffrischen nach einem Update führst du `npx nera-search --force`
aus, aber nur, wenn du die Kopien nie bearbeitet hast: Es überschreibt beide.
Hast du sie angepasst, vergleiche sie mit dem Paket und übernimm die Änderungen
von Hand (der Abschnitt *Template Publishing* in der README des Plugins listet
sie auf).

## 3. Konfigurieren

`config/search.yaml` steuert, welche Felder indexiert werden. Die Datei ist
optional; das sind die Standardwerte:

```yaml
fields:
    - title
    - excerpt
    - content
    - href
strip_html: true
output_filename: search-index.json
```

`fields` ersetzt die Standardliste, statt sie zu erweitern — behalte also
`content` (den Seiteninhalt) und `href` (den Link des Treffers). Jeder andere
Frontmatter-Schlüssel funktioniert, sofern deine Seiten ihn setzen: Die
Startseite, die `nera new` anlegt, hat ein Feld `description`, aber kein `excerpt`.
Nimm `description` also in die Liste auf, wenn es indexiert werden soll; fehlt
ein Feld auf einer Seite, bleibt es in ihrem Eintrag einfach weg.

Um einen Teil einer Seite aus dem Index herauszuhalten, markiere ihn mit
`data-search-ignore`: Das Element fällt samt Inhalt aus `content` heraus.
`@nera-static/plugin-code-blocks` (ab 1.1.0) markiert so die Leiste seiner
Codeblöcke, damit Dateinamen und der Kopieren-Button nicht in deinen Treffern
landen. In Markdown schreibst du das Attribut an rohes HTML:

```html
<aside data-search-ignore>Not part of the index.</aside>
```

## 4. Eine Suchseite hinzufügen

Das Suchfeld ist Pug und gehört deshalb in eine View, nicht ins Markdown. Lege
`theme/views/pages/search.pug` auf Basis des Layouts an, das `nera new` erzeugt:

```pug
extends ../layouts/layout

block content
  main
    article!= content
    include /vendor/plugin-search/search.pug
```

Der führende Schrägstrich löst das Include ab `theme/views/` auf. Dann verweist
du eine Seite auf die View — eine Seite ohne `layout` wird weder gerendert noch
indexiert:

```markdown
---
title: Suche
layout: pages/search.pug
---

# Suche

Durchsuche die Dokumentation.
```

Diese Seite bringt ihre eigene Überschrift `# Suche` mit. Schalte deshalb das
`h1` des Templates in `config/search.yaml` ab, sonst warnt
`nera build --check` mit `a11y-h1` vor zwei davon:

```yaml
show_title: false
```

Hat deine Seite keine eigene Überschrift, lass `show_title` weg — dann ist das
`h1` des Templates die Überschrift der Seite.

Die Texte des Templates laufen über `t()`: `search_title` (die Überschrift,
Standard `Search`), `search_placeholder` (Standard `Search...`) und
`search_label`, der zugängliche Name des Eingabefelds (Standard `Search`).
Übersetze sie unter `translations` in `config/app.yaml`, zum Beispiel für
Deutsch:

```yaml
translations:
    de:
        search_title: Suche
        search_placeholder: Suchen…
        search_label: Suche
```

Stelle zum Schluss sicher, dass die Suche **zuletzt** in
`config/plugin-order.yaml` läuft, damit sie die finalen Seitendaten indexiert —
auch Seiten, die andere Plugins erzeugen:

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

Rendere, und du hast eine funktionierende Suche. Die [Suchseite](/de/search.html)
dieser Website ist aus denselben Teilen gebaut, mit zwei Unterschieden: Ihr
Markdown hat keine Überschrift, also behält sie das `h1` des Templates, übersetzt
über die drei Schlüssel in Englisch, Deutsch und Spanisch; und sie setzt
`group_by_lang: true`, sodass das Suchfeld nur Seiten in der Sprache liefert, die
du gerade liest.
