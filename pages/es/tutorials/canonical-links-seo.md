---
layout: pages/tutorial.pug
title: Añadir enlaces canónicos para SEO
slug: canonical-links-seo
lang: es
description: Usa plugin-canonical-links para emitir etiquetas link canónicas y de idioma alternativo correctas, también en sitios servidos desde un subdirectorio y en páginas generadas.
keywords: nera seo, plugin-canonical-links, url canónica, hreflang, enlaces alternativos, base_path
tags: plugins, seo
pagination_order: 7
createdAt: 2026-07-15
---
Los motores de búsqueda quieren una única URL canónica por página y, en un sitio
multilingüe, quieren saber qué páginas son traducciones unas de otras.
`@nera-static/plugin-canonical-links` emite la etiqueta `<link rel="canonical">` en
cada página y etiquetas alternativas `hreflang` entre traducciones. Si están mal,
nada se rompe a la vista — la página se renderiza con normalidad y el error solo
aparece semanas después en una consola de búsqueda. Así que comprueba la salida,
como hace este tutorial en cada paso.

## 1. Instalar y publicar la plantilla

```bash
npm install @nera-static/plugin-canonical-links
npx nera-canonical-links
```

El segundo comando copia `index.pug` y sus `partials/` a
`theme/views/vendor/plugin-canonical-links/`. Si esa carpeta ya existe, no copia
nada, así que tus cambios están a salvo; tras una actualización,
`npx nera-canonical-links --force` los sobrescribe con las plantillas incluidas.

## 2. Configurar tu origen

Las URLs canónicas son absolutas, así que el plugin necesita el origen de tu sitio.
Configúralo una vez en `config/app.yaml`:

```yaml
origin: https://example.com
```

Es toda la configuración que necesita un sitio de un solo idioma — **el archivo de
configuración propio del plugin es opcional**. Si creas
`config/canonical-links.yaml`, su `app_origin` se usa como alternativa cuando
`app.yaml` no tiene `origin`; si ambos están definidos, gana `origin` de `app.yaml`.
En ambos casos se elimina la barra final.

Sin ningún origen, el plugin no emite enlaces canónicos ni alternativos e imprime
una sola advertencia durante la compilación:

```text
⚠️ plugin-canonical-links: no origin configured, so no canonical links were generated.
    Set `origin` in config/app.yaml, or `app_origin` in config/canonical-links.yaml.
```

Si tu sitio se sirve desde un subdirectorio, `base_path` de `config/app.yaml` también
forma parte de la URL. Las URLs canónicas y alternativas se construyen como origen +
ruta base + ruta de la página:

```yaml
origin: https://example.com
base_path: /docs/
```

```html
<link href="https://example.com/docs/getting-started.html" rel="canonical" />
```

Sin `base_path` la salida no cambia. Las versiones anteriores a 2.2.3 omitían la
ruta base y enviaban a los motores de búsqueda a una URL que no existe.

## 3. Emitir las etiquetas

El plugin establece `meta.canonicalLink` en cada página. Incluye la plantilla
publicada en el `<head>` de tu layout:

```pug
head
  include /vendor/plugin-canonical-links/index
```

La barra inicial hace que la ruta sea absoluta desde la raíz: se resuelve contra
`theme/views/`, esté donde esté el archivo que la incluye. La forma relativa
`include ../vendor/plugin-canonical-links/index` hace lo mismo, pero solo desde un
layout en `theme/views/layouts/` — úsala con Nera core 4.1–4.2, donde la forma
absoluta aún no está disponible. Un `include vendor/…` sin más (sin barra, sin
`../`) busca en `theme/views/layouts/vendor/` y hace fallar la compilación.

Compila y mira el código fuente de `pages/getting-started.md` — verás:

```html
<link href="https://example.com/getting-started.html" rel="canonical" />
```

## 4. Enlazar traducciones con hreflang

Los enlaces de idioma alternativo necesitan tres cosas. Primero, enumera tus
idiomas en `config/canonical-links.yaml`:

```yaml
page_identifier: slug
available_languages:
    - en
    - de
```

`page_identifier` indica la clave del frontmatter que marca dos páginas como
traducciones una de otra; `slug` es el valor por defecto, así que puedes omitir la
línea. Segundo, cada página define su `lang`. Tercero, las traducciones comparten
un `slug` idéntico:

```markdown
---
title: Getting started
slug: getting-started
lang: en
---
```

```markdown
---
title: Erste Schritte
slug: getting-started
lang: de
---
```

Con la página en inglés en `pages/getting-started.md` y la alemana en
`pages/de/getting-started.md`, la compilación da a la página en inglés:

```html
<link href="https://example.com/getting-started.html" rel="canonical" />
<link href="https://example.com/de/getting-started.html" hreflang="de" rel="alternate" />
```

y a la página alemana:

```html
<link href="https://example.com/de/getting-started.html" rel="canonical" />
<link href="https://example.com/getting-started.html" hreflang="en" rel="alternate" />
```

Cada página apunta a sus traducciones, no a sí misma. Y todo esto falla en
silencio:

- Sin `available_languages` obtienes solo enlaces canónicos, y
  `meta.alternateLinks` es un array vacío.
- Una página sin `lang` recibe su enlace canónico, pero ningún alternativo.
- Una página sin `slug` nunca se empareja con ninguna otra.

Si escribes tu propia plantilla en lugar de la publicada, lee
`meta.alternateLinks` — una lista de `{ href, hreflang, rel }` — y ten en cuenta que
ambas claves faltan cuando no hay origen configurado.

## 5. Cubrir las páginas de otros plugins

Algunos plugins crean páginas mientras se ejecutan — `@nera-static/plugin-tags`
construye así sus páginas de resumen de etiquetas (consulta
[Etiqueta tu contenido](/es/tutorials/tag-your-content.html)). Los plugins se
ejecutan en orden alfabético, y `plugin-canonical-links` va antes que
`plugin-tags`, así que esas páginas se crean cuando ya ha terminado y **no reciben
enlace canónico**. Muévelo al final en `config/plugin-order.yaml` (Nera core 4.2.0
o posterior):

```yaml
plugin-order:
    - end:
          - plugin-canonical-links
```

Ahora cada página de etiqueta lleva uno:

```html
<link href="https://example.com/tags/seo.html" rel="canonical" />
```

Las páginas generadas no tienen `slug`, así que reciben un enlace canónico y ningún
alternativo.

El plugin de sitemap, [`@nera-static/plugin-sitemap`](https://www.npmjs.com/package/@nera-static/plugin-sitemap),
lee el mismo origen (`origin` de `app.yaml`, si no `app_origin`) y el mismo
`base_path`, así que las URLs de tu sitemap y tus enlaces canónicos coinciden — en
un sitio con `base_path`, a partir de plugin-canonical-links 2.2.3.

Este sitio también usa el plugin. Su `config/canonical-links.yaml` define
`app_origin: https://nera.js.org` y solo enumera `en` y `de` como idiomas — el
español queda fuera hasta que lo revise un hablante nativo, así que ninguna página
lleva todavía un alternativo `hreflang="es"`. Su `config/plugin-order.yaml` coloca
`plugin-canonical-links` bajo `end:`, y su layout usa el
`include ../vendor/plugin-canonical-links/index` relativo, que es equivalente desde
`theme/views/layouts/`. Mira el código fuente de esta página para ver el resultado.
