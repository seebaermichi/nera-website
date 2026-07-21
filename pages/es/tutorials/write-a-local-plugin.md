---
layout: pages/tutorial.pug
title: Escribe tu propio plugin local
slug: write-a-local-plugin
lang: es
description: Crea un plugin local del proyecto que añade datos a app usando el hook getAppData.
keywords: nera plugin, plugin local, getAppData, getMetaData, contrato de plugin
tags: plugins, local-plugins, advanced
pagination_order: 8
---

# Escribe tu propio plugin local

No necesitas publicar en npm para extender Nera. Cualquier módulo en
`src/plugins/<name>/index.js` se detecta y aplica automáticamente. Construyamos
uno real: un plugin que recopila cada tutorial en una lista para una página de
índice — exactamente el plugin que impulsa este sitio.

## El contrato

Un plugin exporta uno o ambos de dos hooks:

```js
export function getAppData({ app, pagesData }) {
    // must return a plain object — becomes the new `app`
}

export function getMetaData({ app, pagesData }) {
    // must return an array — becomes the new `pagesData`
}
```

`getAppData` se ejecuta primero; `getMetaData` ve la `app` que devolvió.
**Mantenlos síncronos** — un hook asíncrono puede borrar `app` silenciosamente en
versiones antiguas del generador.

## Constrúyelo

Crea `src/plugins/tutorials-list/index.js`:

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

Ese es el plugin completo. Lee cada página, conserva las que están bajo
`/tutorials/` y devuelve una nueva `app` con un array `tutorials` ordenado.

## Úsalo en un layout

`app.tutorials` ahora está disponible en cada vista:

```pug
if app.tutorials && app.tutorials.length
  ul.tutorials__list
    each post in app.tutorials
      li.tutorials__item
        a.tutorials__link(href=post.href)
          h2 #{ post.title }
          p #{ post.description }
```

## Por qué devolver un objeto *nuevo*

Nera encadena el valor de retorno de cada hook hacia el siguiente. Devolver
`{ ...app, tutorials }` (en lugar de mutar `app`) mantiene ese flujo de datos
predecible — la misma razón por la que lo hacen los plugins integrados. A partir de
aquí, el mismo patrón construye listas de publicaciones relacionadas, páginas de
autor, widgets de „actualizado recientemente“ — cualquier cosa derivada de tu
contenido.
