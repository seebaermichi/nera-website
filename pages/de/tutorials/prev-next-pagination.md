---
layout: pages/tutorial.pug
title: Vor-/Zurück-Links zwischen Seiten hinzufügen
slug: prev-next-pagination
lang: de
description: Verwende plugin-page-pagination, um Geschwisterseiten in Lesereihenfolge zu verknüpfen.
keywords: nera Pagination, plugin-page-pagination, Vor Zurück Links, Docs-Navigation
tags: plugins, pagination
pagination_order: 5
---

# Vor-/Zurück-Links zwischen Seiten hinzufügen

`@nera-static/plugin-page-pagination` verknüpft jede Seite mit ihrer vorherigen und nächsten
**Geschwisterseite** — Seiten im selben Verzeichnis — in einer von dir kontrollierten Reihenfolge. Perfekt für
Docs und mehrteilige Tutorials.

## 1. Template installieren und veröffentlichen

```bash
npm install @nera-static/plugin-page-pagination
npx nera-page-pagination
```

## 2. Die Seiten ordnen

Standardmäßig liest das Plugin eine `pagination_order`-Zahl aus jeder Seite:

```markdown
---
title: Getting started
pagination_order: 2
---
```

Seiten werden zuerst nach `pagination_order` geordnet, dann nach Erstellungsdatum, dann nach
Pfad — sodass eine Seite ohne explizite Reihenfolge trotzdem an einer stabilen Position landet.

> Die Ordnung kann bei `0` beginnen, wenn du das möchtest: Das Plugin behandelt `0` als echten Wert,
> nicht als "fehlend". Ändere den Schlüsselnamen in `config/page-pagination.yaml` mit
> `order_property`, falls du das bevorzugst.

## 3. Die Links rendern

Das Plugin fügt `meta.pagePagination` mit `.previous` und `.next` hinzu. Binde das
veröffentlichte Template ein, abgesichert, sodass es ausgeblendet wird, wenn es kein Ziel gibt:

```pug
if meta.pagePagination && (meta.pagePagination.previous || meta.pagePagination.next)
  include ../vendor/plugin-page-pagination/page-pagination
```

## Warum "nur Geschwister" wichtig ist

Die Pagination ist pro Verzeichnis begrenzt, sodass `pages/docs/*.md` untereinander paginieren
und `pages/tutorials/*.md` untereinander — sie vermischen sich nie. Lege eine Sequenz
in einen eigenen Ordner und es funktioniert einfach. Die Docs dieser Website nutzen genau das.
