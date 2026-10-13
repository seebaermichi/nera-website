---
layout: pages/tutorial.pug
title: Wie diese Website gebaut ist
slug: how-this-site-is-built
lang: de
description: Eine Fallstudie über die Nera-Seite selbst — die Plugins, die Reihenfolge, die lokalen Plugins und wie sie geprüft und veröffentlicht wird.
keywords: nera Fallstudie, Static-Site-Beispiel, nera Website, Dogfooding
tags: case-study, plugins, advanced
pagination_order: 9
createdAt: 2026-07-13
---
Diese ganze Seite ist mit Nera gebaut. Nichts hier ist ein Sonderfall — es ist
derselbe Generator und dieselben öffentlichen Plugins, die du installieren würdest.
Hier ist das vollständige Rezept.

## Wie jede Seite aufgesetzt

Es begann mit der nera-CLI, die eine Website erstellt, deren einzige
Nera-Abhängigkeit `@nera-static/nera` ist (das Paket bringt die
`@nera-static/core`-Engine mit):

```bash
npx @nera-static/nera new nera-website
```

## Elf Plugins, jedes mit einer Aufgabe

| Plugin | Aufgabe | Konfiguration |
| --- | --- | --- |
| `plugin-navigation` | Kopf- + Fußzeilenmenüs mit Aktiv-Zuständen | `config/navigation.yaml` |
| `plugin-tags` | Tutorial-Tags + `/tutorials/tags/*`-Seiten je Sprache | `config/tags.yaml` |
| `plugin-search` | Clientseitiger Suchindex + Box je Sprache | `config/search.yaml` |
| `plugin-page-pagination` | Zurück/Weiter in Docs und Tutorials | `config/page-pagination.yaml` |
| `plugin-canonical-links` | Canonical-`<link>`-Tags für SEO | `config/canonical-links.yaml` |
| `plugin-link-attributes` | Externe Links öffnen in einem neuen Tab | `config/link-attributes.yaml` |
| `plugin-code-blocks` | Syntax-Highlighting zur Build-Zeit mit Kopier-Button | `config/code-blocks.yaml` |
| `tutorials-list` (lokal) | Baut `app.tutorials` für den Index | — |
| `llms-txt` (lokal) | `llms.txt`, `llms-full.txt` und eine `.md` je Seite für KI-Assistenten | `config/llms-txt.yaml` |
| `skill-zip` (lokal) | [Der Nera-Skill](/de/docs/using-ai.html) als Zip für claude.ai und Claude Desktop | — |
| `heading-ids` (lokal) | Eine `id` an jedem h2–h4, damit Abschnitte verlinkbar sind | — |

Die vier lokalen Plugins — `tutorials-list`, `llms-txt`, `skill-zip` und
`heading-ids` — liegen in `plugins/`, festgelegt mit `folders.plugins` in `config/app.yaml`. `llms-txt`
und `skill-zip` erzeugen Dateien statt Daten und übergeben sie dem Build über den
`getAssets`-Hook (siehe
[Schreibe dein eigenes lokales Plugin](/de/tutorials/write-a-local-plugin.html)).
`skill-zip` liest den Skill aus dem installierten `@nera-static/nera`, damit der
Download immer zur CLI passt, mit der die Seite gebaut wird. Die meisten anderen
haben in diesem Bereich ein eigenes Tutorial, falls du die Details möchtest.

## Reihenfolge zählt — Canonical Links und Suche laufen zuletzt

Die Suche baut ihren Index aus dem Endzustand jeder Seite, also muss sie nach allem
anderen laufen. Auch die Canonical Links müssen nach `plugin-tags` kommen, sonst
bekommen dessen generierte Tag-Seiten keinen Canonical Link — und alphabetisch
liefe `canonical-links` vor `tags`. `config/plugin-order.yaml` legt das fest:

```yaml
plugin-order:
    - end:
          - plugin-canonical-links
          - plugin-search
```

Alles andere läuft dazwischen alphabetisch. Dies ist die eine Stelle, an der die
Plugin-Reihenfolge auf dieser Seite tragend ist.

## Templates, die uns gehören

Plugins, die Views mitliefern, wurden mit Befehlen wie `npx nera-navigation` nach
`theme/views/vendor/` veröffentlicht. Diese Kopien gehören uns zum Bearbeiten und Gestalten
— nichts Wichtiges ist in `node_modules` versteckt.

## Inhalt ist einfach Markdown

Jede Seite, die du liest, ist eine Markdown-Datei unter `pages/` mit einem `layout`
in ihrem Frontmatter. Die Docs sind `pages/docs/*.md`; dieses Tutorial ist
`pages/tutorials/how-this-site-is-built.md`. Ordner werden zu URLs; es existiert
keine Routing-Konfiguration.

## Bauen

```bash
npm run build   # pages/ -> public/
```

## Prüfen und veröffentlichen

Jeder Push auf `main` und jeder Pull Request dorthin startet
`.github/workflows/test.yml` auf Node 20 und 22 — dieselben Befehle, die du auch
lokal ausführen kannst:

```bash
npm ci
npm run lint              # eslint
npm test                  # node --test mit den Tests neben den lokalen Plugins
npm run validate          # nera validate: Layouts, Includes, Frontmatter
npm run build -- --check  # nera build --check
```

`--check` untersucht das gebaute `public/` auf Probleme bei Barrierefreiheit,
Datenschutz und Impressum und meldet, was es findet. Die Funde sind Warnungen;
den Lauf lassen sie nur bei einer Regel scheitern, die `config/validate.yaml` zum
Fehler hochstuft.

Ein Push auf `main` startet danach `.github/workflows/deploy.yml`: `npm ci`,
`npm run build`, und `public/` wird auf GitHub Pages veröffentlicht — die Seite,
die du gerade auf nera.js.org liest.

Das ist der gesamte Stack: Markdown rein, statisches HTML raus, Plugins für den Rest.
Wenn du die anderen Tutorials in diesem Bereich gelesen hast, hast du jetzt jedes
Teil davon einzeln gesehen — dies ist einfach alles zusammen.
