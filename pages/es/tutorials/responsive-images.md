---
layout: pages/tutorial.pug
title: Imágenes responsive con plugin-images
slug: responsive-images
lang: es
description: Convierte las fotos de tu Markdown en AVIF y WebP con srcset, sizes, width y height al compilar, sin los datos de la cámara ni del GPS, y guarda el trabajo en caché entre compilaciones.
keywords: nera imágenes, plugin-images, imágenes responsive, avif, webp, srcset, elemento picture, og:image, exif, gps, sharp
tags: plugins, images, privacy
pagination_order: 12
createdAt: 2026-11-22
---
Una foto recién salida de una cámara o de un móvil ocupa varios megabytes y
tiene miles de píxeles de ancho, y lleva metadatos: el modelo de cámara, la
hora y a menudo la posición GPS donde se hizo. Si la pones tal cual en una
página Markdown, cada visitante descarga todo eso, también en el móvil.
`@nera-static/plugin-images` lo resuelve al compilar. Cada imagen local de tu
Markdown se convierte en un `<picture>` con AVIF y WebP en varios anchos,
`srcset`/`sizes`, `width`/`height` y carga diferida, y los archivos publicados
no llevan metadatos. Tu Markdown no cambia.

Cada comando, configuración y salida de abajo se ejecutó en un sitio recién
creado con `nera new`, con plugin-images 1.0.3, `@nera-static/core` 4.18.3 y
`@nera-static/nera` 1.27.2. La foto es un JPEG de 4000 × 3000 y 4 MB con
datos de cámara y GPS en su bloque EXIF.

## 1. Instalar

```bash
npx nera add images
```

`nera add` instala el paquete y publica la única vista del plugin, el mixin
`picture`, en `theme/views/vendor/plugin-images/`:

```text
✅ Copied picture.pug to …/theme/views/vendor/plugin-images/picture.pug
✅ Templates copied to: …/theme/views/vendor/plugin-images
✅ Added @nera-static/plugin-images
   Config:    none (the plugin ships no default)
   Templates: published by the plugin
```

No hay nada más que configurar: un `config/images.yaml` es opcional, igual
que cada clave dentro de él. Todos los starters oficiales salvo `blank`
(`nera new --starter …`) ya incluyen el plugin.

## 2. Antes y después

Pon la foto en los assets del sitio, en
`theme/assets/images/photos/pier.jpg`, y úsala en una página como cualquier
imagen:

```markdown:pages/pier.md
---
layout: pages/default.pug
title: The pier
description: A photo of the pier at dusk
---
# The pier

![The pier at dusk, seen from the beach](/images/photos/pier.jpg)
```

Sin el plugin, `nera build` convierte esto en un `<img>` simple que apunta al
original de 4 MB:

```html
<p><img src="/images/photos/pier.jpg" alt="The pier at dusk, seen from the beach"></p>
```

Con el plugin, la primera compilación codifica las variantes:

```text
🖼️  plugin-images: 1 image(s), 12 variant(s) encoded
```

y `public/pier.html` contiene:

```html
<p>
  <picture>
    <source type="image/avif" srcset="/_img/pier-1a5869e3-480.avif 480w, /_img/pier-1a5869e3-800.avif 800w, /_img/pier-1a5869e3-1200.avif 1200w, /_img/pier-1a5869e3-1600.avif 1600w" sizes="100vw">
    <source type="image/webp" srcset="/_img/pier-987422b0-480.webp 480w, /_img/pier-987422b0-800.webp 800w, /_img/pier-987422b0-1200.webp 1200w, /_img/pier-987422b0-1600.webp 1600w" sizes="100vw"><img src="/_img/pier-10e7e41a-1600.jpg" srcset="/_img/pier-10e7e41a-480.jpg 480w, /_img/pier-10e7e41a-800.jpg 800w, /_img/pier-10e7e41a-1200.jpg 1200w, /_img/pier-10e7e41a-1600.jpg 1600w" sizes="100vw" width="1600" height="1200" alt="The pier at dusk, seen from the beach" loading="eager" fetchpriority="high">
  </picture>
</p>
```

- El navegador elige el primer formato que admite, AVIF y después WebP, y el
  `<img>` es la alternativa. Conserva el formato de origen (JPEG sigue siendo
  JPEG, PNG sigue siendo PNG) y siempre apunta a una variante procesada, nunca
  al original.
- Los anchos son los predeterminados, `480, 800, 1200, 1600`. Una imagen de
  origen nunca se amplía: una foto de 1000 píxeles de ancho solo recibe 480 y
  800.
- `width` y `height` son el tamaño de la variante más grande, así que el
  navegador reserva el espacio antes de que cargue la imagen y la página no
  salta.
- La primera imagen de una página se carga de inmediato con
  `fetchpriority="high"`, porque suele ser lo más grande de la pantalla. Cada
  imagen posterior recibe `loading="lazy" decoding="async"`.
- Se conservan el `alt` y todos los demás atributos de tu imagen. El plugin
  nunca escribe un `alt` por ti.

Las variantes van a `public/_img/`, con un hash de la imagen de origen y de los
ajustes en cada nombre, así que una URL solo cambia cuando cambia la imagen.
Las variantes no llevan datos EXIF, GPS ni ICC: el plugin aplica la
orientación EXIF y después lo elimina todo.

En el sitio de pruebas de campo del plugin, un blog en alemán e inglés, las
32 imágenes de contenido pasaron de 4,2 MB de originales a 0,45 MB de AVIF que
descarga un móvil.

El plugin deja en paz lo que no debe tocar: SVG y GIF, URL externas
`http(s)://`, un `<img>` que ya tiene un `srcset` o que está dentro de un
`<picture>`, y cualquier imagen con `?skip` en su URL. Un archivo de imagen que
no existe se queda como un `<img>` simple, y la compilación avisa de ello:

```text
⚠️ plugin-images: /pier.html: image not found, left as is: /images/photos/missing.jpg
```

Las imágenes de tus **vistas** Pug no se procesan. Para ellas, usa imágenes en
el frontmatter y el mixin (paso 5).

## 3. Parámetros de consulta

Añade parámetros a la URL de la imagen para cambiar una sola imagen. Los
parámetros nunca llegan a las URL publicadas. Esta tiene como máximo 800
píxeles de ancho, recortada a 16:9 alrededor de un punto al 30 % desde la
izquierda y al 60 % desde arriba:

```markdown:pages/pier.md
![The end of the pier](/images/photos/pier.jpg?w=800&ratio=16:9&focus=30,60)
```

```html
<picture>
  <source type="image/avif" srcset="/_img/pier-7a863ccf-480.avif 480w, /_img/pier-7a863ccf-800.avif 800w, /_img/pier-7a863ccf-1600.avif 1600w" sizes="(min-width: 800px) 800px, 100vw">
  <source type="image/webp" srcset="/_img/pier-f3e554c6-480.webp 480w, /_img/pier-f3e554c6-800.webp 800w, /_img/pier-f3e554c6-1600.webp 1600w" sizes="(min-width: 800px) 800px, 100vw"><img src="/_img/pier-85ac4388-1600.jpg" srcset="/_img/pier-85ac4388-480.jpg 480w, /_img/pier-85ac4388-800.jpg 800w, /_img/pier-85ac4388-1600.jpg 1600w" sizes="(min-width: 800px) 800px, 100vw" width="1600" height="900" alt="The end of the pier" loading="lazy" decoding="async">
</picture>
```

`?w=800` conserva los anchos configurados por debajo de 800, añade 800 y 1600
(para pantallas con el doble de densidad de píxeles) y establece un `sizes`
acorde. El recorte deja la imagen en 1600 × 900. Los parámetros:

| Parámetro | Qué hace | Ejemplo |
|---|---|---|
| `w` | Ancho máximo de visualización en píxeles | `?w=800` |
| `h` | Alto de destino; junto con `w` recorta | `?w=800&h=450` |
| `ratio` | Recorta a una relación de aspecto | `?ratio=16:9` |
| `fit` | `cover` (el predeterminado para un recorte), `contain` o `inside` | `?fit=contain` |
| `focus` | Punto focal de un recorte en porcentaje, o `attention` / `entropy` | `?focus=30,60` |
| `q` | Calidad para todos los formatos, 1–100 | `?q=60` |
| `formats` | Formatos modernos para esta imagen, o `none` | `?formats=webp` |
| `sizes` | `sizes` para esta imagen, codificado para URL | `?sizes=50vw` |
| `loading` | `eager` o `lazy`, por encima de la regla de la primera imagen | `?loading=eager` |
| `skip` | Deja esta imagen sin tocar | `?skip` |

Un parámetro que el plugin no conoce se ignora con un aviso, así que una
errata no pasa desapercibida:

```text
⚠️ plugin-images: /pier.html: unknown parameter "width" ignored: /images/photos/pier.jpg?width=800
```

## 4. Pies de foto

Dale a una imagen un título Markdown y ponla sola en su párrafo:

```markdown:pages/pier.md
![The pier at dusk](/images/photos/pier.jpg "Usedom, October 2026")
```

Se convierte en un `<figure>` con el título como pie de foto. El `<figure>`
sustituye al párrafo, porque un `<figure>` dentro de un `<p>` es HTML no
válido:

```html
<figure class="nera-image">
  <picture>
    <source type="image/avif" srcset="/_img/pier-1a5869e3-480.avif 480w, /_img/pier-1a5869e3-800.avif 800w, /_img/pier-1a5869e3-1200.avif 1200w, /_img/pier-1a5869e3-1600.avif 1600w" sizes="100vw">
    <source type="image/webp" srcset="/_img/pier-987422b0-480.webp 480w, /_img/pier-987422b0-800.webp 800w, /_img/pier-987422b0-1200.webp 1200w, /_img/pier-987422b0-1600.webp 1600w" sizes="100vw"><img src="/_img/pier-10e7e41a-1600.jpg" srcset="/_img/pier-10e7e41a-480.jpg 480w, /_img/pier-10e7e41a-800.jpg 800w, /_img/pier-10e7e41a-1200.jpg 1200w, /_img/pier-10e7e41a-1600.jpg 1600w" sizes="100vw" width="1600" height="1200" alt="The pier at dusk" loading="lazy" decoding="async">
  </picture>
  <figcaption class="nera-image__caption">Usedom, October 2026</figcaption>
</figure>
```

La misma foto del paso 2 reutiliza las mismas variantes: nada se codifica dos
veces. Una imagen dentro del texto, dentro de un enlace o junto a otra imagen
conserva su `title` y no recibe figura. `figure: false` en
`config/images.yaml` desactiva los pies de foto. Las clases `nera-image` y
`nera-image__caption` son el marcado público del plugin, así que dales estilo
en tu propio CSS.

## 5. Imágenes en el frontmatter y el mixin `+picture`

La imagen de cabecera o de vista previa de una entrada de blog suele estar en
el frontmatter y la renderiza una vista, no el Markdown. Indícala en `image`:

```markdown:pages/beach.md
---
layout: pages/post.pug
title: A day at the beach
description: A post with a hero image
image: /images/photos/beach.jpg
image_alt: Waves on an empty beach
---
# A day at the beach

The hero image above comes from the frontmatter.
```

El plugin codifica sus variantes y pone los datos listos en
`meta.images.image`: `src`, `srcset`, `sizes`, `width`, `height`, las `sources`
por formato y un recorte `og`. `meta.image` sigue siendo la cadena que
escribiste, así que las vistas y los plugins que la leen siguen funcionando.
Los parámetros de consulta también funcionan aquí
(`image: /images/photos/beach.jpg?ratio=16:9`). Otras claves además de
`image` van en `frontmatter_keys` en `config/images.yaml`.

El mixin que publicó `nera add` renderiza la entrada:

```pug:theme/views/pages/post.pug
extends ../layouts/layout

block content
  main#main
    include /vendor/plugin-images/picture
    +picture(meta.images && meta.images.image, { alt: meta.image_alt, loading: 'eager' })
    != content
```

```html
<picture>
  <source type="image/avif" srcset="/_img/beach-04a0334d-480.avif 480w, /_img/beach-04a0334d-800.avif 800w, /_img/beach-04a0334d-1200.avif 1200w, /_img/beach-04a0334d-1600.avif 1600w" sizes="100vw" />
  <source type="image/webp" srcset="/_img/beach-2fc7c78b-480.webp 480w, /_img/beach-2fc7c78b-800.webp 800w, /_img/beach-2fc7c78b-1200.webp 1200w, /_img/beach-2fc7c78b-1600.webp 1600w" sizes="100vw" /><img src="/_img/beach-376379b1-1600.jpg" srcset="/_img/beach-376379b1-480.jpg 480w, /_img/beach-376379b1-800.jpg 800w, /_img/beach-376379b1-1200.jpg 1200w, /_img/beach-376379b1-1600.jpg 1600w" sizes="100vw" width="1600" height="1200" alt="Waves on an empty beach" loading="eager" fetchpriority="high" />
</picture>
```

Una página sin esa clave en el frontmatter no renderiza nada ahí. Las opciones
del mixin son `alt`, `class`, `sizes` y `loading` (`lazy` por defecto; `eager`
añade `fetchpriority="high"`). Una imagen de cabecera sobre el contenido es la
imagen más grande de la página, así que renderízala con `loading: 'eager'`
como arriba y pon `eager_first: false` en `config/images.yaml`, para que la
primera imagen Markdown de debajo no compita por la misma prioridad.

### `og:image`

La entrada `og` es un JPEG de 1200 × 630, el tamaño que esperan las vistas
previas de enlaces en redes sociales y apps de mensajería. `og:image` tiene que
ser una URL absoluta, así que define tu origen en `config/app.yaml`:

```yaml:config/app.yaml
origin: https://example.com
```

y añade las etiquetas dentro del `head` del layout, después de las demás
etiquetas `meta`:

```pug:theme/views/layouts/layout.pug
    if meta.images && meta.images.image && meta.images.image.og
      - const og = meta.images.image.og
      meta(property="og:image" content=`${app.origin}${app.basePath || ''}${og.src}`)
      meta(property="og:image:width" content=og.width)
      meta(property="og:image:height" content=og.height)
```

`public/beach.html` contiene entonces:

```html
<meta property="og:image" content="https://example.com/_img/beach-a82641dd-1200.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

`app.basePath` está ahí para un sitio servido desde una subcarpeta: core
reescribe `href` y `src` para `base_path`, pero no el `content` de un
`<meta>`.

## 6. Marcadores de posición

Mientras una imagen carga, su caja está vacía. Un marcador de posición la
rellena:

```yaml:config/images.yaml
placeholder: color
```

pone el color dominante de la imagen como fondo:

```html
<img src="/_img/pier-10e7e41a-1600.jpg" srcset="/_img/pier-10e7e41a-480.jpg 480w, /_img/pier-10e7e41a-800.jpg 800w, /_img/pier-10e7e41a-1200.jpg 1200w, /_img/pier-10e7e41a-1600.jpg 1600w" sizes="100vw" width="1600" height="1200" style="background-color:#383898" alt="The pier at dusk, seen from the beach" loading="eager" fetchpriority="high">
```

`placeholder: blur` pone en su lugar un WebP diminuto y desenfocado, incrustado
en la página:

```html
<img src="/_img/pier-10e7e41a-1600.jpg" srcset="/_img/pier-10e7e41a-480.jpg 480w, /_img/pier-10e7e41a-800.jpg 800w, /_img/pier-10e7e41a-1200.jpg 1200w, /_img/pier-10e7e41a-1600.jpg 1600w" sizes="100vw" width="1600" height="1200" style="background-image:url(data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAACwAQCdASoQAAwAAsBMJbACdAEOtNWAAP7xfmtUemnWsBu+y/mBlsjTsVhsr/7FRn95mxzwAAA=);background-size:cover" alt="The pier at dusk, seen from the beach" loading="eager" fetchpriority="high">
```

La compilación informa de ellos:

```text
🖼️  plugin-images: 4 image(s), 0 variant(s) encoded, 3 placeholder(s) computed
```

Ambos funcionan para imágenes Markdown y para imágenes del frontmatter (el
mixin renderiza el `style`). Una imagen con transparencia no recibe ninguno,
porque el fondo se seguiría viendo a través de ella. El valor predeterminado es
`none`, porque un marcador de posición es un atributo `style` en línea, que una
Content Security Policy sin `'unsafe-inline'` en `style-src` bloquea.

Un valor o una clave que el plugin no conoce genera un aviso y vuelve al valor
predeterminado; ninguno de los dos hace fallar la compilación:

```text
⚠️ plugin-images: config/images.yaml: invalid placeholder "smudge", using "none"
⚠️ plugin-images: config/images.yaml: ignoring unknown key "width"
```

## 7. Mantén tus originales fuera del servidor

Las variantes están limpias, pero por defecto el original se sigue publicando:
en el paso 2, `public/images/photos/pier.jpg` es el archivo de 4 MB con sus
datos de cámara y GPS, accesible para cualquiera que adivine la URL. El plugin
lee las imágenes de la carpeta de assets **sin tener en cuenta
`.neraignore`**, así que pon allí la carpeta de fotos:

```text:.neraignore
images/photos
```

Las rutas son relativas a la carpeta de assets. Tras la siguiente compilación,
`public/` ya no tiene ninguna carpeta `images/`; las páginas siguen mostrando
todas las fotos, desde `public/_img/`. Los originales se quedan en tu
repositorio.

Comprueba antes qué más hay en esa carpeta. `.neraignore` compara rutas
exactas y prefijos de carpeta, sin patrones glob, y todo lo que haya en una
carpeta listada y el plugin no procese deja de publicarse: SVG, GIF, archivos
que enlazas para descargar e imágenes que tus vistas usan directamente, como
un `img(src=meta.image)` o un `og:image` construido a partir de `meta.image`.
Renderízalas desde `meta.images` (paso 5). Una carpeta que solo contiene fotos
para tus páginas es el caso seguro.

`nera build --check` revisa el `public/` compilado, entre otras cosas en busca
de peticiones a terceros; la
[referencia de la CLI](/es/docs/cli.html#revisar-el-sitio-compilado) describe
las comprobaciones. Para este sitio informa:

```text
✓ No problems found.
```

## 8. La caché, en local y en CI

Codificar AVIF es lento. Por eso el plugin guarda cada variante en
`.nera-cache/images/` y solo codifica lo que falta. Con las cuatro imágenes
del sitio de prueba (tres en la página del muelle y la de cabecera de la
entrada de la playa), una compilación con la caché vacía informa:

```text
🖼️  plugin-images: 4 image(s), 34 variant(s) encoded
```

y tardó 5,3 segundos; la siguiente compilación:

```text
🖼️  plugin-images: 4 image(s), 0 variant(s) encoded
```

tardó 0,9. En un sitio con cien fotos, una compilación en frío tarda un minuto
o más. Las variantes que ya no usa ninguna página se eliminan de la caché
(`prune: true`).

`nera new` incluye `.nera-cache` en el `.gitignore` del sitio (desde
`@nera-static/nera` 1.4.1), así que la caché nunca acaba en tu repositorio. En
CI, en cambio, consérvala entre ejecuciones. El workflow de despliegue que
escribe `nera publish` ya lo hace (desde `@nera-static/nera` 1.22.0). En un
workflow propio, añade este paso antes de `npm run build`:

```yaml
- uses: actions/cache@v6
  with:
      path: .nera-cache
      key: nera-cache-${{ hashFiles('assets/**', 'theme/assets/**', 'pages/**', 'config/images.yaml', 'package-lock.json') }}
      restore-keys: nera-cache-
```

La clave incluye `pages/**` porque las páginas piden variantes (parámetros de
consulta, imágenes del frontmatter), y `package-lock.json` porque un tema de
npm trae sus propias imágenes. `actions/cache` no guarda nada cuando la clave
coincide exactamente, así que con una clave a la que le falte uno de ellos las
variantes nuevas no se guardan, y cada compilación las vuelve a codificar.

## 9. Requisitos

El plugin necesita **`@nera-static/core` 4.13.0 o posterior**: entrega sus
variantes a core a través del hook `getAssets`, que las copia en `public/`.
Cualquier `@nera-static/nera` actual trae un core más reciente. Con un core más
antiguo la compilación se detiene, en lugar de publicar páginas que enlazan a
imágenes que nunca se copiaron. Con core 4.12.0:

```text
❌ plugin-images: @nera-static/core 4.12.0 is too old; this plugin needs >= 4.13.0 (the getAssets hook). Without it, pages would link to image files that are never copied to public/. Update with `npm update @nera-static/nera` (or `@nera-static/core`).
```

La compilación termina con el código 1.

La codificación se hace con [sharp](https://sharp.pixelplumbing.com), un
módulo nativo. Instala un binario precompilado para tu plataforma (macOS,
Linux y Windows, en x64 y arm64), y el `package-lock.json` del sitio incluye
los binarios de todas las plataformas como dependencias opcionales, así que
`npm ci` en un runner de CI con Linux elige el suyo aunque el lockfile se haya
escrito en un Mac. No instales con `--omit=optional`, que deja fuera el
binario. El plugin necesita Node.js 20.18.1 o posterior.

El [README](https://github.com/seebaermichi/nera-plugin-images#readme) del
plugin y su [página de npm](https://www.npmjs.com/package/@nera-static/plugin-images)
recogen cada clave de configuración con su valor predeterminado (en inglés).

## Siguiente

[Cómo está construido este sitio web](/es/tutorials/how-this-site-is-built.html)
muestra los plugins de este sitio trabajando juntos.
