---
layout: pages/tutorial.pug
title: Crear un blog con Nera
slug: build-a-blog
lang: es
description: Crear un sitio, escribir entradas y listarlas de más reciente a más antigua en la página de inicio con plugin-simple-page-list.
keywords: tutorial blog nera, blog estático, blog markdown, plugin-simple-page-list
tags: getting-started, blog, plugins
pagination_order: 1
createdAt: 2026-07-21
---
En este tutorial crearás un sitio Nera, escribirás dos entradas y convertirás la
página de inicio en el índice del blog, que las lista de más reciente a más
antigua. Cada archivo aparece completo, así que puedes seguirlo paso a paso.

## 1. Crear el sitio

```bash
npx @nera-static/nera new my-blog
cd my-blog
```

`nera new` crea el sitio e instala sus dependencias. Trabajarás en tres lugares:
`pages/` para tu contenido (empieza con `pages/index.md`, además de
`pages/imprint.md` y `pages/privacy.md`, marcadores que debes reemplazar antes
de publicar), `theme/views/` para las plantillas Pug (`layouts/layout.pug` es el
esqueleto HTML y `pages/default.pug` renderiza una página dentro de él) y
`config/` para la configuración.

¿Prefieres un blog terminado que solo tengas que editar? Un starter de blog crea
uno con tema, entradas de ejemplo en una serie, etiquetas, archivo, búsqueda,
feed Atom, sitemap y datos estructurados:

```bash
npx @nera-static/nera new my-blog --starter blog
```

En una terminal pregunta cuál de cuatro blogs: el blog sencillo (Enter), un
blog para desarrolladores (`stack`), un blog de fotografía (`ansitz`) o un blog
de viajes (`umwege`). Sin terminal toma el blog sencillo, y `--starter stack`,
`ansitz` o `umwege` elige directamente uno de los otros. Míralos antes en la
[página de temas](/es/themes/index.html), con una captura y una demo de cada
uno. La lista de [starter kits](/es/docs/cli.html#starter-kits) dice qué trae
cada uno.

Sus archivos no coinciden con los pasos siguientes: este tutorial construye a
mano un blog más sencillo, para que veas cómo encajan las piezas.

## 2. Escribir entradas

Las entradas son archivos Markdown en `pages/posts/`. Crea
`pages/posts/hello-world.md`:

```markdown
---
layout: pages/default.pug
title: Hello world
description: My first post.
createdAt: 2026-10-01
---

# Hello world

Welcome to my new Nera blog.
```

Y una segunda, `pages/posts/second-post.md`:

```markdown
---
layout: pages/default.pug
title: My second post
description: What I learned this week.
createdAt: 2026-10-08
---

# My second post

A week in, and the blog lists this post first.
```

Una página solo se renderiza si indica un `layout`. El `title` y la `description`
aparecen en la lista, y `createdAt` es la fecha de la entrada. Ponla siempre: sin
ella, Nera recurre a la fecha de creación del archivo, que tras un checkout nuevo
— en un servidor de compilación CI, por ejemplo — es la misma para todos los
archivos, así que el orden sería arbitrario.

## 3. Listar las entradas en la página de inicio

`@nera-static/plugin-simple-page-list` reúne las páginas de una carpeta en una
lista ordenada. Añádelo:

```bash
npx nera add simple-page-list
```

`nera add` instala el paquete, que Nera detecta luego por sí solo a partir de tu
`package.json`. Además copia el `config/simple-page-list.yaml` por defecto del
plugin y publica su plantilla en
`theme/views/vendor/plugin-simple-page-list/simple-page-list.pug`.

La configuración copiada ya incluye la carpeta de entradas, de más reciente a
más antigua. Sin sus comentarios dice:

```yaml:config/simple-page-list.yaml
page_paths:
    - /posts
more_link_text: Read more
sortBy: date
sortOrder: descending
```

`page_paths` agrupa la lista por el último segmento de cada ruta, así que tus
entradas llegan a `app.pageList.posts`. Si más adelante añades otras carpetas
aquí, cada una tendrá su propia clave. `sortBy: date` lee el `date` de una
entrada en el frontmatter y, si no lo hay, usa `createdAt`, así que tus entradas
se ordenan por las fechas que acabas de poner.

Ahora una plantilla de página que renderiza el contenido propio de la página y,
debajo, la lista. Crea `theme/views/pages/blog.pug`:

```pug
extends ../layouts/layout

block content
  main#main
    != content
    include /vendor/plugin-simple-page-list/simple-page-list
```

Los dos `content` no tienen relación. `block content` rellena el hueco del
mismo nombre en `layouts/layout.pug`. `!= content` imprime el Markdown de la
página, que Nera ya ha convertido en HTML; `!=` lo deja sin escapar, así que
llega como marcado. La barra inicial hace que la ruta del include empiece en
`theme/views/`, esté donde esté la plantilla.

Por último, haz que la página de inicio la use. Sustituye `pages/index.md` por:

```markdown
---
layout: pages/blog.pug
title: My blog
description: Notes and posts, newest first.
---

# My blog

Welcome! Here is everything I have written so far.
```

Esta es la plantilla que publicaste, y puedes editarla a tu gusto:

```pug
//- Handles both shapes `getAppData` can produce:
//-   flat    — `app.pageList` is an array          (config uses `page_path`)
//-   grouped — `app.pageList` is keyed by path     (config uses `page_paths`)
//- The flat branch emits exactly the markup this template has always emitted,
//- so published copies keep rendering identically.
mixin pageListItems(pages)
    each page in pages
        article.page-list__item
            header.page-list__header
                h3.page-list__item-title
                    a.page-list__link(href=page.href) #{page.title}
            if page.description
                p.page-list__description #{page.description}
            footer.page-list__footer
                a.page-list__more-link(href=page.href) #{page.moreLinkText}

-
    var pageList = app.pageList
    var isFlat = Array.isArray(pageList)
    var groups = []

    if (isFlat) {
        groups = pageList.length ? [{ key: null, pages: pageList }] : []
    } else if (pageList && typeof pageList === 'object') {
        groups = Object.keys(pageList)
            .filter(function (key) {
                return Array.isArray(pageList[key]) && pageList[key].length > 0
            })
            .map(function (key) {
                return { key: key, pages: pageList[key] }
            })
    }

if groups.length > 0
    section.page-list
        h2.page-list__title Recent Pages
        if isFlat
            +pageListItems(groups[0].pages)
        else
            each group in groups
                div.page-list__group
                    h3.page-list__group-title #{group.key}
                    +pageListItems(group.pages)
```

Lee `app.pageList` en cualquiera de sus dos formas. Con tu configuración es un
grupo, `posts`: bajo el encabezado «Recent Pages» y el encabezado de grupo
«posts», cada entrada se convierte en un `article` con su título, su descripción
y un enlace «Read more». Para cambiar los encabezados o el marcado, edita este
archivo: ahora es tu copia. Volver a ejecutar `npx nera add simple-page-list`
conserva tu configuración y esta carpeta. `npx nera-simple-page-list --force`
sobrescribe la carpeta con la plantilla incluida y descarta tus cambios.

¿Prefieres escribir la lista tú mismo? Mira
[Escribe tu propio plugin local](/es/tutorials/write-a-local-plugin.html).

## 4. Hacerlo crecer

- **Etiquetas:** añade `tags:` a las entradas y obtén una página por etiqueta con
  [Etiqueta tu contenido](/es/tutorials/tag-your-content.html).
- **Enlaces anterior/siguiente:** enlaza cada entrada con sus vecinas en
  `pages/posts/` con
  [Añadir enlaces anterior/siguiente entre páginas](/es/tutorials/prev-next-pagination.html).
- **Sitemap:** configura el origen de tu sitio como en
  [Añadir enlaces canónicos para SEO](/es/tutorials/canonical-links-seo.html) y
  añade después `@nera-static/plugin-sitemap` desde el
  [catálogo de plugins](/es/plugins/index.html).
- **Imágenes y código:** `@nera-static/plugin-images` convierte tus fotos en
  imágenes responsive ([tutorial](/es/tutorials/responsive-images.html)), y
  `@nera-static/plugin-code-blocks` (resaltado de sintaxis) también está en el
  [catálogo de plugins](/es/plugins/index.html).

## 5. Vista previa y compilación

```bash
npm run dev
```

Abre `http://localhost:3000`: la página de inicio lista «My second post» por
encima de «Hello world», y cada título enlaza a su entrada. La vista previa se
reconstruye cuando guardas un archivo.

Cuando quieras publicar, compila el sitio una vez:

```bash
npm run build
```

El blog terminado está en `public/`: sube esa carpeta a cualquier hosting
estático.
