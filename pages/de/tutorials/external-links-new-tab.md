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

Kein Template zum Veröffentlichen — dieses Plugin transformiert nur Inhalt. Seine einzige
Einstellung steht in einer Config-Datei.

## 2. Konfigurieren

`config/link-attributes.yaml` listet die hinzuzufügenden Attribute auf. Am schnellsten
bekommst du sie mit dem Befehl des Plugins, der die unten gezeigten Standardwerte schreibt:

```bash
npx nera-link-attributes
```

Eine vorhandene Datei lässt er in Ruhe, ein erneuter Aufruf überschreibt also nie deine
Änderungen; `npx nera-link-attributes --force` ersetzt sie durch eine frische Kopie. Du kannst
die Datei auch von Hand schreiben:

```yaml
attributes:
    - target="_blank"
    - rel="noopener noreferrer"
```

Ohne `attributes` lässt das Plugin deine Seiten unverändert — keine Datei, keine neuen Tabs.

Das Plugin zielt nur auf Links, deren `href` mit `http` oder `www` beginnt, sodass deine
internen Links (`/docs/...`) unberührt bleiben, und ein Attribut, das ein Link schon hat,
wird nie überschrieben. Das `rel="noopener noreferrer"` ist es wert, beibehalten zu werden —
es schließt die tab-nabbing-Lücke, die ein bloßes `target="_blank"` öffnet.

## 3. Der eine Haken: Layout-Links

Das Plugin schreibt Links innerhalb deines **Markdown-Inhalts** um, nicht Links, die du
direkt in Pug-Layouts schreibst (ein "GitHub"-Button im Header, ein Footer-Link). Füge dieselben
Attribute bei diesen von Hand hinzu:

```pug
a.site-header__cta(href=app.repo_url, target="_blank", rel="noopener noreferrer") GitHub
```

Rendere, und jeder ausgehende Link — im Inhalt und in deinem Layout — öffnet in einem neuen
Tab. Diese Website macht genau das; probiere einen beliebigen GitHub-Link aus.
