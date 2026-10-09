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

Ein Plugin, das Dateien erzeugt (zum Beispiel generierte Bilder), exportiert
zusätzlich `getAssets` (Core ≥ 4.13.0). Der Hook läuft nach `getAppData` und
`getMetaData` aller Plugins, sieht das endgültige `app` und `pagesData` und gibt
zurück, was nach `public/` kopiert werden soll:

```js
export function getAssets({ app, pagesData }) {
    return [{ from: '/abs/path/to/files', to: '_img' }]
}
```

`from` ist eine absolute Datei oder ein absoluter Ordner, `to` ein Pfad innerhalb
von `public/`. Core kopiert diese Einträge nach den Assets des Themes und vor
deinen eigenen, sodass dein `assets/` bei gleichen Namen weiterhin gewinnt.
Ungültige Einträge werden mit einer Warnung übersprungen.

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
