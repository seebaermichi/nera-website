---
layout: pages/tutorial.pug
title: Añade búsqueda del lado del cliente
slug: add-search
lang: es
description: Configura plugin-search para generar un índice y una caja de búsqueda funcional.
keywords: nera búsqueda, búsqueda de sitio estático, búsqueda del lado del cliente
tags: plugins, search
pagination_order: 4
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

Renderiza, y tendrás una búsqueda funcional. La [página de búsqueda](/es/search.html) de este sitio está
construida exactamente de esta manera.
