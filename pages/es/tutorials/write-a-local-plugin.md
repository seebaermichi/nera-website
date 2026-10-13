---
layout: pages/tutorial.pug
title: Escribe tu propio plugin local
slug: write-a-local-plugin
lang: es
description: Crea un plugin local del proyecto que añade datos a app con el hook getAppData y escribe un archivo en public/ con el hook getAssets.
keywords: nera plugin, plugin local, getAppData, getMetaData, getAssets, contrato de plugin
tags: plugins, local-plugins, advanced
pagination_order: 8
createdAt: 2026-07-14
---
No necesitas publicar en npm para extender Nera. Cualquier módulo en
`src/plugins/<name>/index.js` se detecta y aplica automáticamente — es la carpeta
por defecto, y un sitio creado con `nera new` no necesita ningún ajuste para ello.
Para guardar los plugins locales en otro sitio, indica `folders.plugins` en
`config/app.yaml` — este sitio usa `plugins/`:

```yaml
folders:
    plugins: ./plugins
```

Construyamos uno real: un plugin que recopila cada tutorial en una lista para una
página de índice — una versión simplificada del plugin que impulsa este sitio — y
que después publica la misma lista como `tutorials.json`.

## El contrato

Un plugin exporta hasta tres hooks:

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

`getAppData` se ejecuta primero; `getMetaData` ve la `app` que devolvió.
`getAssets` (core ≥ 4.13.0) se ejecuta cuando todos los plugins han terminado con
los otros dos. Nera espera a todos los hooks (desde core 4.3.0; las versiones
anteriores sustituían `app` en silencio por una Promise), pero **lo síncrono sigue
siendo la opción segura** — es lo que hacen los plugins publicados.

Un hook que devuelve el tipo equivocado no detiene el build: core muestra un aviso
como `⚠️ Plugin "tutorials-list" getAppData returned invalid format, skipping
replace.` y conserva los datos anteriores. Si un plugin parece no hacer nada, mira
primero el log del build. «El contrato de hooks» en la
[documentación de plugins](/es/docs/plugins.html#el-contrato-de-hooks) lo resume brevemente.

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

## Entrega un archivo con `getAssets`

Ahora publica la misma lista como `/tutorials.json`. Escribirla en `public/` desde
un hook no funciona: los plugins se ejecutan *antes* de que core borre y vuelva a
crear `public/`, así que el archivo desaparece al final del build. Escríbela en
`.nera-cache/tutorials-list/` (`nera new` añade `.nera-cache` al `.gitignore`) y
devuélvela desde `getAssets`. Añade esto al mismo archivo:

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

Cada entrada es `{ from, to }`: `from` es una ruta **absoluta** a un archivo o una
carpeta, `to` una ruta **relativa a `public/`** — para un archivo, el archivo de
destino; para una carpeta, la carpeta donde va su contenido (`''` es `public/`
mismo). `getAssets` ve la `app` final, así que `app.tutorials` de tu propio
`getAppData` ya está ahí.

Tras `nera build`, `public/tutorials.json` contiene la lista, de la más reciente a
la más antigua:

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

Core copia los archivos en el orden tema → plugins → sitio, así que un archivo con
el mismo nombre en tu propio `theme/assets/` sigue ganando. La copia ocurre antes
de `base_path` y del hashing de assets, así que ambos cubren también los archivos
de los plugins. Una entrada con un `from` relativo o un `to` fuera de `public/` se
omite con un aviso, como
`⚠️ Plugin "tutorials-list" getAssets entry skipped: "from" must be an absolute
path (…)`. Como ejemplos reales, mira los plugins
[`llms-txt`](https://github.com/seebaermichi/nera-website/tree/main/plugins/llms-txt)
y [`skill-zip`](https://github.com/seebaermichi/nera-website/tree/main/plugins/skill-zip)
de este sitio.

## Por qué devolver un objeto *nuevo*

Nera encadena el valor de retorno de cada hook hacia el siguiente. Devolver
`{ ...app, tutorials }` (en lugar de mutar `app`) mantiene ese flujo de datos
predecible — la misma razón por la que lo hacen los plugins integrados. A partir de
aquí, el mismo patrón construye listas de publicaciones relacionadas, páginas de
autor, widgets de „actualizado recientemente“ — cualquier cosa derivada de tu
contenido.
