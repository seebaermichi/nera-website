---
layout: pages/tutorial.pug
title: Canonical-Links für SEO hinzufügen
slug: canonical-links-seo
lang: de
description: Verwende plugin-canonical-links, um korrekte canonical- und alternate-language-Link-Tags auszugeben, auch auf Websites in einem Unterverzeichnis und auf generierten Seiten.
keywords: nera SEO, plugin-canonical-links, canonical URL, hreflang, alternate Links, base_path
tags: plugins, seo
pagination_order: 7
createdAt: 2026-07-15
---
Suchmaschinen wollen eine einzige canonical URL pro Seite, und auf einer
mehrsprachigen Website wollen sie wissen, welche Seiten Übersetzungen voneinander
sind. `@nera-static/plugin-canonical-links` gibt auf jeder Seite das
`<link rel="canonical">`-Tag aus und zwischen Übersetzungen `hreflang`-Alternate-Tags.
Sind sie falsch, geht nichts sichtbar kaputt — die Seite rendert ganz normal, und
der Fehler fällt erst Wochen später in einer Search Console auf. Prüfe also die
Ausgabe, so wie dieses Tutorial es bei jedem Schritt tut.

## 1. Template installieren und veröffentlichen

```bash
npm install @nera-static/plugin-canonical-links
npx nera-canonical-links
```

Der zweite Befehl kopiert `index.pug` und seine `partials/` nach
`theme/views/vendor/plugin-canonical-links/`. Existiert der Ordner schon, wird
nichts kopiert — deine Änderungen bleiben also erhalten; nach einem Upgrade
überschreibt `npx nera-canonical-links --force` sie mit den mitgelieferten Templates.

## 2. Deinen Origin setzen

Canonical URLs sind absolut, also braucht das Plugin den Origin deiner Website.
Setze ihn einmal in `config/app.yaml`:

```yaml
origin: https://example.com
```

Mehr Konfiguration braucht eine einsprachige Website nicht — **die eigene
Konfigurationsdatei des Plugins ist optional**. Legst du
`config/canonical-links.yaml` doch an, dient ihr `app_origin` als Fallback, wenn
`app.yaml` kein `origin` hat; sind beide gesetzt, gewinnt `origin` aus `app.yaml`.
Ein abschließender Schrägstrich wird in beiden Fällen entfernt.

Ganz ohne Origin gibt das Plugin weder canonical- noch Alternate-Links aus und
schreibt beim Build eine einzige Warnung:

```text
⚠️ plugin-canonical-links: no origin configured, so no canonical links were generated.
    Set `origin` in config/app.yaml, or `app_origin` in config/canonical-links.yaml.
```

Wird deine Website aus einem Unterverzeichnis ausgeliefert, gehört auch
`base_path` aus `config/app.yaml` zur URL. Canonical- und Alternate-URLs setzen
sich aus Origin + Basispfad + Seitenpfad zusammen:

```yaml
origin: https://example.com
base_path: /docs/
```

```html
<link href="https://example.com/docs/getting-started.html" rel="canonical" />
```

Ohne `base_path` ändert sich an der Ausgabe nichts. Versionen vor 2.2.3 ließen den
Basispfad weg und schickten Suchmaschinen zu einer URL, die es nicht gibt.

## 3. Die Tags ausgeben

Das Plugin setzt auf jeder Seite `meta.canonicalLink`. Binde das veröffentlichte
Template im `<head>` deines Layouts ein:

```pug
head
  include /vendor/plugin-canonical-links/index
```

Der führende Schrägstrich macht den Pfad root-absolut: Er wird gegen
`theme/views/` aufgelöst, egal wo die einbindende Datei liegt. Die relative Form
`include ../vendor/plugin-canonical-links/index` leistet dasselbe, aber nur aus
einem Layout in `theme/views/layouts/` — nutze sie mit Nera core 4.1–4.2, wo die
root-absolute Form noch nicht verfügbar ist. Ein nacktes `include vendor/…` (ohne
Schrägstrich, ohne `../`) sucht in `theme/views/layouts/vendor/` und lässt den
Build scheitern.

Baue die Website und sieh dir den Quelltext von `pages/getting-started.md` an — du
siehst:

```html
<link href="https://example.com/getting-started.html" rel="canonical" />
```

## 4. Übersetzungen mit hreflang verknüpfen

Alternate-Language-Links brauchen drei Dinge. Erstens: Liste deine Sprachen in
`config/canonical-links.yaml` auf:

```yaml
page_identifier: slug
available_languages:
    - en
    - de
```

`page_identifier` nennt den Frontmatter-Schlüssel, der zwei Seiten als
Übersetzungen voneinander kennzeichnet; `slug` ist der Standard, die Zeile kannst
du also weglassen. Zweitens: Jede Seite setzt ihr `lang`. Drittens: Übersetzungen
teilen sich einen identischen `slug`:

```markdown
---
title: Getting started
slug: getting-started
lang: en
---
```

```markdown
---
title: Erste Schritte
slug: getting-started
lang: de
---
```

Liegt die englische Seite unter `pages/getting-started.md` und die deutsche unter
`pages/de/getting-started.md`, erhält die englische Seite beim Build:

```html
<link href="https://example.com/getting-started.html" rel="canonical" />
<link href="https://example.com/de/getting-started.html" hreflang="de" rel="alternate" />
```

und die deutsche Seite:

```html
<link href="https://example.com/de/getting-started.html" rel="canonical" />
<link href="https://example.com/getting-started.html" hreflang="en" rel="alternate" />
```

Jede Seite verweist auf ihre Übersetzungen, nicht auf sich selbst. Und all das
scheitert lautlos:

- Ohne `available_languages` bekommst du nur canonical-Links, und
  `meta.alternateLinks` ist ein leeres Array.
- Eine Seite ohne `lang` erhält ihren canonical-Link, aber keine Alternates.
- Eine Seite ohne `slug` wird nie einer anderen zugeordnet.

Schreibst du statt des veröffentlichten ein eigenes Template, lies
`meta.alternateLinks` — eine Liste aus `{ href, hreflang, rel }` — und fange ab,
dass beide Schlüssel fehlen, wenn kein Origin gesetzt ist.

## 5. Seiten anderer Plugins abdecken

Manche Plugins erzeugen Seiten, während sie laufen — `@nera-static/plugin-tags`
baut so seine Tag-Übersichtsseiten (siehe
[Tagge deine Inhalte](/de/tutorials/tag-your-content.html)). Plugins laufen in
alphabetischer Reihenfolge, und `plugin-canonical-links` kommt vor `plugin-tags` —
die Tag-Seiten entstehen also erst, wenn es schon fertig ist, und bekommen **keinen
canonical-Link**. Verschiebe es in `config/plugin-order.yaml` ans Ende (Nera core
4.2.0 oder neuer):

```yaml
plugin-order:
    - end:
          - plugin-canonical-links
```

Jetzt trägt jede Tag-Seite einen:

```html
<link href="https://example.com/tags/seo.html" rel="canonical" />
```

Generierte Seiten haben keinen `slug`, sie erhalten also einen canonical-Link und
keine Alternates.

Das Sitemap-Plugin, [`@nera-static/plugin-sitemap`](https://www.npmjs.com/package/@nera-static/plugin-sitemap),
liest denselben Origin (`origin` aus `app.yaml`, sonst `app_origin`) und denselben
`base_path` — die URLs in deiner Sitemap und deine canonical-Links stimmen also
überein, auf einer Website mit `base_path` ab plugin-canonical-links 2.2.3.

Auch diese Website nutzt das Plugin, eingerichtet wie in diesem Tutorial:
`origin: https://nera.js.org` in `config/app.yaml`, das root-absolute Include im Layout und
`plugin-canonical-links` unter `end:` in `config/plugin-order.yaml`. Ihre
`config/canonical-links.yaml` führt nur `en` und `de` als Sprachen — Spanisch
bleibt außen vor, bis eine muttersprachliche Durchsicht erfolgt ist, daher trägt
noch keine Seite ein `hreflang="es"`-Alternate. Der Quelltext dieser Seite zeigt
das Ergebnis.
