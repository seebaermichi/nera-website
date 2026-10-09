---
layout: pages/docs.pug
title: Plugins
slug: docs-plugins
lang: es
description: Instalar plugins, el contrato de hooks, la resolución de la configuración y las plantillas.
pagination_order: 5
---

# Plugins

## Instalación

```bash
npm install @nera-static/plugin-navigation
```

Cualquier dependencia cuyo nombre empiece por `@nera-static/` se descubre y se aplica
automáticamente — sin paso de registro.

## El contrato de hooks

Un plugin es un módulo ESM que exporta uno o ambos hooks:

```js
export function getAppData({ app, pagesData }) {
    return { ...app, myKey: 'value' }   // must return a plain object
}

export function getMetaData({ app, pagesData }) {
    return pagesData                    // must return an array
}
```

`getAppData` se ejecuta primero; `getMetaData` ve el `app` que devolvió. **Mantén los hooks
síncronos** — un hook asíncrono puede borrar `app` en versiones antiguas del generador.

Un plugin que genera archivos (por ejemplo, imágenes procesadas) exporta además
`getAssets` (core ≥ 4.13.0). Se ejecuta después de `getAppData` y `getMetaData`
de todos los plugins, ve el `app` y el `pagesData` finales y devuelve lo que hay
que copiar en `public/`:

```js
export function getAssets({ app, pagesData }) {
    return [{ from: '/abs/path/to/files', to: '_img' }]
}
```

`from` es un archivo o una carpeta con ruta absoluta, `to` una ruta dentro de
`public/`. Core los copia después de los assets del tema y antes de los tuyos,
así que tu `assets/` sigue ganando si un nombre coincide. Las entradas no válidas
se omiten con una advertencia.

## La configuración vive en tu proyecto

Cada plugin lee `config/<name>.yaml` de **tu** sitio, no del paquete.
El YAML incluido dentro del paquete es documentación; cópialo en tu `config/`
y edítalo. Las claves faltantes recurren a valores predeterminados sensatos.

## Orden

`config/plugin-order.yaml` controla el orden de ejecución: los nombres bajo `start:` se ejecutan
primero, luego todo lo demás alfabéticamente, luego los nombres bajo `end:`. La búsqueda se ejecuta
la última para que indexe los datos finales de las páginas.

## Plantillas

Los plugins que incluyen vistas exponen un comando de publicación:

```bash
npx nera-navigation      # copies templates into views/vendor/plugin-navigation/
```

Luego `include` desde tus layouts. La publicación **se omite si la carpeta ya
existe** — bórrala (o pasa `--force`) para incorporar las actualizaciones de las plantillas.
