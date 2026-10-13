---
layout: pages/tutorial.pug
title: Schreibe dein eigenes lokales Plugin
slug: write-a-local-plugin
lang: de
description: Baue ein projektlokales Plugin, das mit dem getAppData-Hook Daten zu app hinzufügt und mit dem getAssets-Hook eine Datei nach public/ schreibt.
keywords: nera Plugin, lokales Plugin, getAppData, getMetaData, getAssets, Plugin-Vertrag
tags: plugins, local-plugins, advanced
pagination_order: 8
createdAt: 2026-07-14
---
Du musst nicht auf npm veröffentlichen, um Nera zu erweitern. Jedes Modul unter
`src/plugins/<name>/index.js` wird automatisch erkannt und angewendet — das ist
der Standard, eine mit `nera new` erstellte Website braucht dafür keine
Einstellung. Sollen lokale Plugins woanders liegen, setze `folders.plugins` in
`config/app.yaml` — diese Website nutzt `plugins/`:

```yaml
folders:
    plugins: ./plugins
```

Bauen wir ein echtes: ein Plugin, das jedes Tutorial in einer Liste für eine
Indexseite sammelt — eine vereinfachte Fassung des Plugins, das diese Seite
antreibt — und dieselbe Liste anschließend als `tutorials.json` veröffentlicht.

## Der Vertrag

Ein Plugin exportiert bis zu drei Hooks:

```js
export function getAppData({ app, pagesData }) {
    // must return a plain object — becomes the new `app`
}

export function getMetaData({ app, pagesData }) {
    // must return an array — becomes the new `pagesData`
}

export function getAssets({ app, pagesData }) {
    // must return an array of { from, to } — files core copies into public/
}
```

`getAppData` läuft zuerst; `getMetaData` sieht die `app`, die es zurückgegeben hat.
`getAssets` (core ≥ 4.13.0) läuft, sobald jedes Plugin mit den anderen beiden
fertig ist. Nera wartet auf alle Hooks (seit core 4.3.0; ältere Versionen
ersetzten `app` stillschweigend durch ein Promise), aber **synchron bleibt die
sichere Wahl** — so machen es auch die veröffentlichten Plugins.

Ein Hook, der den falschen Typ zurückgibt, bricht den Build nicht ab: Core gibt
eine Warnung aus, etwa `⚠️ Plugin "tutorials-list" getAppData returned invalid
format, skipping replace.`, und behält die alten Daten. Scheint ein Plugin nichts
zu tun, lies zuerst das Build-Log. „Der Hook-Vertrag“ in der
[Plugin-Doku](/de/docs/plugins.html#der-hook-vertrag) fasst das kurz zusammen.

## Baue es

Erstelle `src/plugins/tutorials-list/index.js`:

```js
export function getAppData({ app, pagesData }) {
    if (!app || typeof app !== 'object') return app
    if (!Array.isArray(pagesData)) return app

    const tutorials = pagesData
        .filter(({ meta }) => {
            const href = meta?.href || ''
            return href.startsWith('/tutorials/') && href !== '/tutorials/index.html'
        })
        .map(({ meta }) => ({
            href: meta.href,
            title: meta.title || meta.href,
            description: meta.description || '',
            createdAt: meta.createdAt,
        }))
        .sort((a, b) => {
            const da = new Date(a.createdAt).getTime()
            const db = new Date(b.createdAt).getTime()
            if (!Number.isNaN(da) && !Number.isNaN(db) && da !== db) return db - da
            return String(a.href).localeCompare(String(b.href))
        })

    return { ...app, tutorials }
}
```

Das ist das ganze Plugin. Es liest jede Seite, behält die unter `/tutorials/` und
gibt eine neue `app` mit einem sortierten `tutorials`-Array zurück.

## Verwende es in einem Layout

`app.tutorials` ist jetzt in jeder View verfügbar:

```pug
if app.tutorials && app.tutorials.length
  ul.tutorials__list
    each post in app.tutorials
      li.tutorials__item
        a.tutorials__link(href=post.href)
          h2 #{ post.title }
          p #{ post.description }
```

## Übergib eine Datei mit `getAssets`

Jetzt veröffentlichst du dieselbe Liste als `/tutorials.json`. Sie aus einem Hook
direkt nach `public/` zu schreiben, funktioniert nicht: Plugins laufen, *bevor*
Core `public/` löscht und neu anlegt, also ist die Datei am Ende des Builds weg.
Schreib sie stattdessen nach `.nera-cache/tutorials-list/` (`nera new` trägt
`.nera-cache` in die `.gitignore` ein) und gib sie aus `getAssets` zurück. Ergänze
dazu dieselbe Datei:

```js
import fs from 'fs'
import path from 'path'

// getAppData from above stays as it is

export function getAssets({ app }) {
    if (!Array.isArray(app?.tutorials)) return []

    const dir = path.resolve(process.cwd(), '.nera-cache/tutorials-list')
    const from = path.join(dir, 'tutorials.json')

    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(from, `${JSON.stringify(app.tutorials, null, 4)}\n`)

    return [{ from, to: 'tutorials.json' }]
}
```

Jeder Eintrag ist `{ from, to }`: `from` ist ein **absoluter** Pfad zu einer Datei
oder einem Ordner, `to` ein Pfad **relativ zu `public/`** — bei einer Datei die
Zieldatei, bei einem Ordner der Ordner, in den sein Inhalt kommt (`''` ist
`public/` selbst). `getAssets` sieht die endgültige `app`, also ist
`app.tutorials` aus deinem eigenen `getAppData` schon da.

Nach `nera build` enthält `public/tutorials.json` die Liste, die neuesten zuerst:

```json
[
    {
        "href": "/tutorials/second.html",
        "title": "Second tutorial",
        "description": "The newer one.",
        "createdAt": "2026-08-01T00:00:00.000Z"
    },
    {
        "href": "/tutorials/first.html",
        "title": "First tutorial",
        "description": "The older one.",
        "createdAt": "2026-07-01T00:00:00.000Z"
    }
]
```

Core kopiert die Dateien in der Reihenfolge Theme → Plugins → Website, eine
gleichnamige Datei in deinem eigenen `theme/assets/` gewinnt also weiterhin. Das
Kopieren passiert vor `base_path` und dem Asset-Hashing, beide greifen also auch
für Plugin-Dateien. Ein Eintrag mit relativem `from` oder einem `to` außerhalb von
`public/` wird mit einer Warnung übersprungen, etwa
`⚠️ Plugin "tutorials-list" getAssets entry skipped: "from" must be an absolute
path (…)`. Beispiele aus der Praxis sind die Plugins
[`llms-txt`](https://github.com/seebaermichi/nera-website/tree/main/plugins/llms-txt)
und [`skill-zip`](https://github.com/seebaermichi/nera-website/tree/main/plugins/skill-zip)
dieser Website.

## Warum ein *neues* Objekt zurückgeben

Nera reicht den Rückgabewert jedes Hooks in den nächsten weiter. `{ ...app, tutorials }`
zurückzugeben (statt `app` zu mutieren) hält diesen Datenfluss vorhersehbar — aus
demselben Grund tun es die eingebauten Plugins. Von hier aus baut dasselbe Muster
Listen verwandter Beiträge, Autorenseiten, „kürzlich aktualisiert“-Widgets — alles,
was aus deinem Inhalt abgeleitet ist.
