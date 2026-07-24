---
layout: pages/tutorial.pug
title: Externe Links in einem neuen Tab öffnen
slug: external-links-new-tab
lang: de
description: Verwende plugin-link-attributes, um target und rel automatisch zu ausgehenden Links hinzuzufügen.
keywords: nera externe Links, plugin-link-attributes, target blank, noopener
tags: plugins, links
pagination_order: 6
createdAt: 2026-07-16
---
`@nera-static/plugin-link-attributes` verarbeitet dein gerendertes HTML nach und fügt
ausgehenden Links Attribute hinzu — sodass jeder externe Link sicher in einem neuen Tab öffnet,
ohne dass du das Markdown anfassen musst.

## 1. Installieren

```bash
npm install @nera-static/plugin-link-attributes
```

Kein Template zum Veröffentlichen — dieses Plugin transformiert nur Inhalt.

## 2. Konfigurieren

`config/link-attributes.yaml` listet die hinzuzufügenden Attribute auf:

```yaml
attributes:
    - target="_blank"
    - rel="noopener noreferrer"
```

Das Plugin zielt nur auf Links, deren `href` mit `http` oder `www` beginnt, sodass deine
internen Links (`/docs/...`) unberührt bleiben. Das `rel="noopener noreferrer"` ist es
wert, beibehalten zu werden — es schließt die tab-nabbing-Lücke, die ein bloßes `target="_blank"` öffnet.

## 3. Der eine Haken: Layout-Links

Das Plugin schreibt Links innerhalb deines **Markdown-Inhalts** um, nicht Links, die du
direkt in Pug-Layouts schreibst (ein "GitHub"-Button im Header, ein Footer-Link). Füge dieselben
Attribute bei diesen von Hand hinzu:

```pug
a.site-header__cta(href=app.repo_url, target="_blank", rel="noopener noreferrer") GitHub
```

Rendere, und jeder ausgehende Link — im Inhalt und in deinem Layout — öffnet in einem neuen
Tab. Diese Website macht genau das; probiere einen beliebigen GitHub-Link aus.

> Node-Hinweis: Dieses Plugin verwendet cheerio unter der Haube, daher benötigt es Node ≥ 20.18.1 zum
> Bauen. Es betrifft deine Besucher nicht — die Ausgabe ist einfaches HTML.
