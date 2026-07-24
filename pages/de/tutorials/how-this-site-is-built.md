---
layout: pages/tutorial.pug
title: Wie diese Website gebaut ist
slug: how-this-site-is-built
lang: de
description: Eine Fallstudie über die Nera-Seite selbst — die Plugins, die Reihenfolge und das lokale Plugin dahinter.
keywords: nera Fallstudie, Static-Site-Beispiel, nera Website, Dogfooding
tags: case-study, plugins, advanced
pagination_order: 9
createdAt: 2026-07-13
---
Diese ganze Seite ist mit Nera gebaut. Nichts hier ist ein Sonderfall — es ist
derselbe Generator und dieselben öffentlichen Plugins, die du installieren würdest.
Hier ist das vollständige Rezept.

## Wie jede Seite aufgesetzt

Es begann mit dem Installer, der den Generator klont und ihn zu deinem eigenen
Projekt macht:

```bash
npx @nera-static/installer new nera-website
```

## Sieben Plugins, jedes mit einer Aufgabe

| Plugin | Aufgabe | Konfiguration |
| --- | --- | --- |
| `plugin-navigation` | Kopf- + Fußzeilenmenüs mit Aktiv-Zuständen | `config/navigation.yaml` |
| `plugin-tags` | Tutorial-Tags + `/tutorials/tags/*`-Seiten je Sprache | `config/tags.yaml` |
| `plugin-search` | Clientseitiger Suchindex + Box je Sprache | `config/search.yaml` |
| `plugin-page-pagination` | Zurück/Weiter in Docs und Tutorials | `config/page-pagination.yaml` |
| `plugin-canonical-links` | Canonical-`<link>`-Tags für SEO | `config/canonical-links.yaml` |
| `plugin-link-attributes` | Externe Links öffnen in einem neuen Tab | `config/link-attributes.yaml` |
| `tutorials-list` (lokal) | Baut `app.tutorials` für den Index | — |

Jedes hat in diesem Bereich sein eigenes Tutorial, falls du die Details möchtest.

## Reihenfolge zählt — die Suche läuft zuletzt

Die Suche baut ihren Index aus dem Endzustand jeder Seite, also muss sie nach allem
anderen laufen. `config/plugin-order.yaml` legt das fest:

```yaml
plugin-order:
    - end:
          - plugin-search
```

Alles andere läuft dazwischen alphabetisch. Dies ist die eine Stelle, an der die
Plugin-Reihenfolge auf dieser Seite tragend ist.

## Templates, die uns gehören

Plugins, die Views mitliefern, wurden mit Befehlen wie `npx nera-navigation` nach
`views/vendor/` veröffentlicht. Diese Kopien gehören uns zum Bearbeiten und Gestalten
— nichts Wichtiges ist in `node_modules` versteckt.

## Inhalt ist einfach Markdown

Jede Seite, die du liest, ist eine Markdown-Datei unter `pages/` mit einem `layout`
in ihrem Frontmatter. Die Docs sind `pages/docs/*.md`; dieses Tutorial ist
`pages/tutorials/how-this-site-is-built.md`. Ordner werden zu URLs; es existiert
keine Routing-Konfiguration.

## Bauen

```bash
npm run render   # pages/ -> public/
```

Das ist der gesamte Stack: Markdown rein, statisches HTML raus, Plugins für den Rest.
Wenn du die anderen Tutorials in diesem Bereich gelesen hast, hast du jetzt jedes
Teil davon einzeln gesehen — dies ist einfach alles zusammen.
