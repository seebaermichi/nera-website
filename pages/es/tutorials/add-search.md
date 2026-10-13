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

Esto copia la caja de búsqueda en `theme/views/vendor/plugin-search/` y el cliente en
`theme/assets/js/search.js`.

A partir de ahí, ambas copias son tuyas. Si vuelves a ejecutar `npx nera-search`,
omite la plantilla cuando existe la carpeta `vendor/plugin-search/` y el cliente
cuando existe `search.js`, así que nunca descarta tus ediciones — pero tampoco
lleva por sí solo a tu sitio un cambio de plantilla de una versión nueva. Para
actualizarlas tras subir de versión, ejecuta `npx nera-search --force`, pero solo
si nunca editaste las copias: sobrescribe las dos. Si las editaste, compáralas
con el paquete y combina los cambios a mano (la sección *Template Publishing* del
README del plugin los enumera).

## 3. Configura

`config/search.yaml` controla qué campos se indexan. El archivo es opcional;
estos son los valores por defecto:

```yaml
fields:
    - title
    - excerpt
    - content
    - href
strip_html: true
output_filename: search-index.json
```

`fields` sustituye la lista por defecto en lugar de ampliarla, así que conserva
`content` (el cuerpo de la página) y `href` (el enlace del resultado). Cualquier
otra clave del frontmatter sirve si tus páginas la definen: la página de inicio
que crea `nera new` tiene `description` pero no `excerpt`, así que añade
`description` si quieres indexarla; un campo que falta en una página
simplemente se omite en su entrada.

Para dejar parte de una página fuera del índice, márcala con
`data-search-ignore`: el elemento y todo su contenido se eliminan de `content`.
`@nera-static/plugin-code-blocks` (1.1.0 o posterior) marca así la barra de sus
bloques de código, de modo que los nombres de archivo y el botón de copiar no
aparecen en tus resultados. En Markdown, escribe el atributo en HTML sin
procesar:

```html
<aside data-search-ignore>Not part of the index.</aside>
```

## 4. Añade una página de búsqueda

La caja de búsqueda es Pug, así que va en una vista, no en el Markdown. Crea
`theme/views/pages/search.pug` sobre el layout que genera `nera new`:

```pug
extends ../layouts/layout

block content
  main
    article!= content
    include /vendor/plugin-search/search.pug
```

La barra inicial resuelve el include desde `theme/views/`. Después apunta una
página a esa vista — una página sin `layout` no se renderiza ni se indexa:

```markdown
---
title: Buscar
layout: pages/search.pug
---

# Buscar

Busca en toda la documentación.
```

Esa página trae su propio encabezado `# Buscar`, así que desactiva el `h1` de la
plantilla en `config/search.yaml`; si no, `nera build --check` avisa con
`a11y-h1` de que hay dos:

```yaml
show_title: false
```

Si tu página no tiene encabezado propio, omite `show_title` y el `h1` de la
plantilla será el encabezado de la página.

Los textos de la plantilla pasan por `t()`: `search_title` (el encabezado, por
defecto `Search`), `search_placeholder` (por defecto `Search...`) y
`search_label`, el nombre accesible del campo (por defecto `Search`). Tradúcelos
bajo `translations` en `config/app.yaml`, por ejemplo para alemán:

```yaml
translations:
    de:
        search_title: Suche
        search_placeholder: Suchen…
        search_label: Suche
```

Por último, asegúrate de que la búsqueda se ejecute en **último** lugar en
`config/plugin-order.yaml` para que indexe los datos finales de las páginas,
incluidas las que generan otros plugins:

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

Renderiza, y tendrás una búsqueda funcional. La [página de búsqueda](/es/search.html)
de este sitio está construida con las mismas piezas, con dos diferencias: su
Markdown no tiene encabezado, así que conserva el `h1` de la plantilla, traducido
con las tres claves en inglés, alemán y español; y activa `group_by_lang: true`,
de modo que el buscador solo devuelve páginas en el idioma que estás leyendo.
