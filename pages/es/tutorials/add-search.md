---
layout: pages/tutorial.pug
title: Añade búsqueda del lado del cliente
slug: add-search
lang: es
description: Configura plugin-search para generar un índice y una caja de búsqueda funcional.
keywords: nera búsqueda, búsqueda de sitio estático, búsqueda del lado del cliente
tags: plugins, search
pagination_order: 4
createdAt: 2026-07-18
---
`@nera-static/plugin-search` construye un índice JSON en el momento del renderizado y entrega un pequeño
script de cliente — sin servidor necesario.

## 1. Instala

```bash
npm install @nera-static/plugin-search
```

## 2. Publica la plantilla

```bash
npx nera-search
```

Esto copia la caja de búsqueda en `views/vendor/plugin-search/` y el cliente en
`assets/js/search.js`.

## 3. Configura

`config/search.yaml` controla qué campos se indexan:

```yaml
fields:
    - title
    - description
    - content
    - href
strip_html: true
output_filename: search-index.json
```

## 4. Añade una página de búsqueda

Crea una página que incluya el partial de búsqueda publicado, luego asegúrate de que la búsqueda
se ejecute en **último** lugar en `config/plugin-order.yaml` para que indexe los datos finales de la página:

```yaml
plugin-order:
    - end:
          - plugin-search
```

## 5. Búsqueda por idioma (opcional)

Por defecto todas las páginas caen en un único índice, así que el buscador de una
página en alemán también devuelve resultados en inglés y en español. Con
`group_by_lang` cada idioma recibe su propio índice:

```yaml
group_by_lang: true
```

Las páginas se agrupan por `meta.lang`, y el código de idioma se coloca antes de
la extensión de `output_filename`. El idioma por defecto conserva el nombre de
archivo tal cual:

```
/search-index.json       # idioma por defecto
/search-index.de.json    # solo páginas en alemán
/search-index.es.json    # solo páginas en español
```

Las páginas sin `meta.lang` caen en el idioma por defecto — `lang` en
`config/app.yaml` — así que un sitio monolingüe no cambia en nada.

Cada página lleva entonces `meta.searchIndexPath`, el índice de su propio idioma.
La plantilla `search.pug` publicada se lo pasa al cliente como
`data-search-index` y `search.js` pide esa URL, de modo que tu propio marcado no
necesita cambios. Un detalle: `app.searchIndexPath` sigue existiendo, pero con la
agrupación activa apunta al índice del idioma *por defecto*, así que construir el
atributo a partir de él haría que una página en alemán buscara en inglés.
`app.searchIndexPaths` contiene todos los idiomas indexados por código, y cada
entrada del índice lleva su `lang`.

Como la búsqueda se ejecuta en último lugar (paso 4), las páginas que generan
otros plugins también caen en el idioma correcto — entre ellas las páginas de
etiquetas de `plugin-tags`.

Al actualizar un sitio existente hay una trampa: `npx nera-search` omite los
archivos ya publicados, y `--force` los sobrescribe junto con tus ediciones. Si
tus copias están personalizadas, combina los dos cambios a mano — el atributo
`data-search-index` en la plantilla y `input.dataset.searchIndex` en `search.js`.
Hasta entonces, el cliente antiguo sigue pidiendo `/search-index.json` y cada
página busca en el idioma por defecto.

Renderiza, y tendrás una búsqueda funcional. La [página de búsqueda](/es/search.html) de este sitio está
construida exactamente de esta manera, con `group_by_lang: true` — el buscador
solo devuelve páginas en el idioma que estás leyendo.
