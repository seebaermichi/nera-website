---
layout: pages/tutorial.pug
title: Schreibe dein eigenes lokales Plugin
slug: write-a-local-plugin
lang: de
description: Baue ein projektlokales Plugin, das mit dem getAppData-Hook Daten zu app hinzufügt.
keywords: nera Plugin, lokales Plugin, getAppData, getMetaData, Plugin-Vertrag
tags: plugins, local-plugins, advanced
pagination_order: 8
createdAt: 2026-07-14
---
Du musst nicht auf npm veröffentlichen, um Nera zu erweitern. Jedes Modul unter
`src/plugins/<name>/index.js` wird automatisch erkannt und angewendet. Bauen wir
ein echtes: ein Plugin, das jedes Tutorial in einer Liste für eine Indexseite
sammelt — genau das Plugin, das diese Seite antreibt.

## Der Vertrag

Ein Plugin exportiert einen oder beide von zwei Hooks:

```js
export function getAppData({ app, pagesData }) {
    // must return a plain object — becomes the new `app`
}

export function getMetaData({ app, pagesData }) {
    // must return an array — becomes the new `pagesData`
}
```

`getAppData` läuft zuerst; `getMetaData` sieht die `app`, die es zurückgegeben hat.
**Halte sie synchron** — ein asynchroner Hook kann `app` auf älteren
Generator-Versionen stillschweigend auslöschen.

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

## Warum ein *neues* Objekt zurückgeben

Nera reicht den Rückgabewert jedes Hooks in den nächsten weiter. `{ ...app, tutorials }`
zurückzugeben (statt `app` zu mutieren) hält diesen Datenfluss vorhersehbar — aus
demselben Grund tun es die eingebauten Plugins. Von hier aus baut dasselbe Muster
Listen verwandter Beiträge, Autorenseiten, „kürzlich aktualisiert“-Widgets — alles,
was aus deinem Inhalt abgeleitet ist.
