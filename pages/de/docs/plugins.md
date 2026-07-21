---
layout: pages/docs.pug
title: Plugins
slug: docs-plugins
lang: de
description: Plugins installieren, der Hook-Vertrag, die Auflösung der Konfiguration und Templates.
pagination_order: 5
---

# Plugins

## Installation

```bash
npm install @nera-static/plugin-navigation
```

Jede Abhängigkeit, deren Name mit `@nera-static/` beginnt, wird automatisch entdeckt und
angewendet — kein Registrierungsschritt.

## Der Hook-Vertrag

Ein Plugin ist ein ESM-Modul, das einen oder beide Hooks exportiert:

```js
export function getAppData({ app, pagesData }) {
    return { ...app, myKey: 'value' }   // must return a plain object
}

export function getMetaData({ app, pagesData }) {
    return pagesData                    // must return an array
}
```

`getAppData` läuft zuerst; `getMetaData` sieht das `app`, das es zurückgegeben hat. **Halte Hooks
synchron** — ein asynchroner Hook kann `app` auf älteren Generator-Versionen auslöschen.

## Die Konfiguration liegt in deinem Projekt

Jedes Plugin liest `config/<name>.yaml` aus **deiner** Site, nicht aus dem Paket.
Das im Paket mitgelieferte YAML ist Dokumentation; kopiere es in dein `config/`
und bearbeite es. Fehlende Schlüssel fallen auf sinnvolle Standardwerte zurück.

## Reihenfolge

`config/plugin-order.yaml` steuert die Ausführungsreihenfolge: Namen unter `start:` laufen
zuerst, dann alles Übrige alphabetisch, dann Namen unter `end:`. Die Suche läuft
zuletzt, damit sie die endgültigen Seitendaten indexiert.

## Templates

Plugins, die Views mitliefern, stellen einen Publish-Befehl bereit:

```bash
npx nera-navigation      # copies templates into views/vendor/plugin-navigation/
```

`include` sie dann aus deinen Layouts. Das Veröffentlichen **wird übersprungen, wenn der Ordner
bereits existiert** — lösche ihn (oder übergib `--force`), um Template-Updates einzuspielen.
