---
layout: pages/tutorial.pug
title: Usar y personalizar un tema
slug: use-a-theme
lang: es
description: Arranca un sitio a partir de un tema instalable, cambia sus colores, su CSS y su marcado archivo por archivo, sigue recibiendo las actualizaciones del tema a través de npm y cambia un blog entre los cuatro temas de blog.
keywords: nera tema, theme-business, theme-blog, theme-stack, theme-ansitz, theme-umwege, cambiar de tema, sobrescribir tema, tema hijo, design tokens, css propio, nera update, theme-shadowed
tags: themes, getting-started
pagination_order: 14
createdAt: 2026-11-22
---
Un tema de Nera es un paquete npm: layouts, tipos de página, partials, una
hoja de estilos y un conjunto de design tokens. Tu sitio no lo copia. Instala
el paquete y pone un archivo propio a su lado solo donde quiere algo
distinto. Todos los demás archivos siguen viniendo del paquete, así que
`npm update` sigue trayendo las correcciones del tema, como un tema hijo en
WordPress.

Este tutorial usa `@nera-static/theme-business`, el tema de los kits de
inicio business y portfolio. Cambias un color, añades unas reglas CSS,
sustituyes un partial, actualizas el tema y añades un tema a un sitio que no
tiene ninguno. Después, un blog cambia entre los cuatro temas de blog. Cada
comando y cada salida de abajo se ejecutó en un sitio recién creado con
theme-business 1.0.3, `@nera-static/nera` 1.29.0 y `@nera-static/core`
4.19.1; la sección 9, en un blog creado con `--starter blog` con theme-blog
2.1.0, theme-stack 2.2.0, theme-ansitz 1.1.0 y theme-umwege 1.1.1.

## 1. Arrancar un sitio con un tema

```bash
npx @nera-static/nera new my-site --theme business
cd my-site
```

```text
📦 Creating a new Nera site in …/my-site...
  ✓ Configured project as "my-site"
  ✓ Using theme "business" (@nera-static/theme-business)
  • pages/imprint.md and pages/privacy.md are placeholders: link them from the theme's layout (theme-blog and theme-business take `footer_links` in config/theme.yaml), or `nera build --check` keeps warning legal-imprint-link and legal-privacy-link.
```

`--theme business` hace dos cosas. Añade el paquete a `package.json`:

```json
"dependencies": {
    "@nera-static/nera": "^1.29.0",
    "@nera-static/theme-business": "^1.0.3"
}
```

y nombra el tema en `config/app.yaml`:

```yaml:config/app.yaml
theme: business
```

`business` es la forma corta de `@nera-static/theme-business`. El sitio no
recibe ningún layout propio: `theme/` contiene solo carpetas vacías
(`views/layouts/`, `views/pages/` y `assets/`), y cada vista viene del paquete
en `node_modules/`.

¿Quieres también páginas de ejemplo para servicios, horario y contacto? El
kit de inicio business trae el mismo tema con ellas:
`npx @nera-static/nera new my-site --starter business`.

## 2. Una primera compilación limpia

Compila con las comprobaciones de salida:

```bash
npx nera build --check
```

```text
public/imprint.html
  :44   warning  page has more than one `<h1>` — one main heading per page keeps its outline clear; keep one and make the others `<h2>` (WCAG 1.3.1, best practice) (on 3 pages, e.g. public/imprint.html, public/index.html, public/privacy.html)  a11y-h1
  :33   warning  page has no link whose text names the imprint (Impressum, Imprint, Legal notice) — it should be easy to find and directly reachable from every page; link it from the layout, such as in the footer, or, if it is linked under another name, set `legal.imprint` in config/validate.yaml (§ 5 DDG) (on 3 pages, e.g. public/imprint.html, public/index.html, public/privacy.html)  legal-imprint-link
  :33   warning  page has no link whose text names the privacy policy (Datenschutz, Privacy, Data protection) — it should be easy to find and directly reachable from every page; link it from the layout, such as in the footer, or, if it is linked under another name, set `legal.privacy` in config/validate.yaml (Art. 13 DSGVO) (on 3 pages, e.g. public/imprint.html, public/index.html, public/privacy.html)  legal-privacy-link

0 error(s), 3 warning(s)
```

Los tres avisos vienen de las páginas generadas, no del tema:

-   El tema renderiza el `title` de la página como su único `<h1>`, así que
    el Markdown de una página empieza en `##`. Borra las líneas
    `# Welcome to Nera`, `# Imprint` y `# Privacy` de las tres páginas.
-   El pie de página enlaza las páginas legales que indiques. Crea el
    `config/theme.yaml` propio del sitio:

```yaml:config/theme.yaml
footer_links:
    - label: Imprint
      href: /imprint.html
    - label: Privacy
      href: /privacy.html
```

Compila de nuevo:

```text
✓ No problems found.
```

El pie de página ahora contiene:

```html
<nav class="site-footer__legal" aria-label="Legal"><a href="/imprint.html">Imprint</a><a href="/privacy.html">Privacy</a></nav>
```

Sustituye las dos páginas de marcador por tus propios textos antes de
publicar.

## 3. Cómo se reparten el trabajo el tema y tu sitio

Nera busca cada vista y cada asset en dos sitios, primero en tu sitio:

| qué | tu sitio | el paquete del tema |
|---|---|---|
| vistas | `theme/views/<path>` | `node_modules/@nera-static/theme-business/views/<path>` |
| assets | `theme/assets/<path>` | `node_modules/@nera-static/theme-business/assets/<path>` |
| ajustes | `config/theme.yaml` | el `config/theme.yaml` del paquete |

Un archivo de tu sitio gana al archivo del tema **en la misma ruta**, y solo
a ese archivo. Todo lo que no sobrescribes viene del paquete. Los assets se
copian primero los del tema y después los de tu sitio, así que `public/`
acaba con ambos, y los tuyos por encima. Tu `config/theme.yaml` se combina
clave por clave con los valores por defecto del tema: solo indicas lo que
cambias (las listas como `footer_links` se sustituyen enteras).

El README del tema tiene una tabla de qué cambiar dónde. De lo más barato a
lo más caro:

| para cambiar | haz esto | sigues recibiendo actualizaciones del tema para |
|---|---|---|
| un color, una fuente, un ancho | un token en `config/theme.yaml` | todo |
| unas reglas CSS | `theme/assets/css/custom.css` + `extra_css` | todo |
| un partial o un tipo de página | cópialo a `theme/views/<same path>` | todos los demás archivos |
| todo el marco de la página | sobrescribe `layouts/layout.pug` | tipos de página, partials, CSS |

Las secciones 4 a 6 recorren esta tabla de arriba abajo.

## 4. Cambiar un color

Cada token del `config/theme.yaml` del tema se convierte en una propiedad
personalizada de CSS: `tokens.color.accent` se convierte en
`--theme-color-accent`. Cambia el color de acento (enlaces, botones, la línea
superior) a un verde azulado oscuro y da al contorno de foco el antiguo color
óxido:

```yaml:config/theme.yaml
tokens:
    color:
        accent: '#1c5f74'
        focus: '#a1400f'
footer_links:
    - label: Imprint
      href: /imprint.html
    - label: Privacy
      href: /privacy.html
```

Después de `npx nera build`, el `<style>` que el tema escribe en el `<head>`
de cada página lleva tus valores junto a los valores por defecto que no has
tocado:

```html
<style>
  :root {
    --theme-color-bg: #fbf2e3;
    --theme-color-surface: #f1e0c3;
    --theme-color-text: #3b2314;
    --theme-color-muted: #6e4b2e;
    --theme-color-accent: #1c5f74;
    --theme-color-accent-text: #ffffff;
    --theme-color-border: #dcc6a3;
    --theme-color-focus: #a1400f;
    …
  }
</style>
```

Mantén el contraste cuando cambies colores: el acento es texto sobre el fondo
de la página y sobre las tarjetas, y el fondo de los botones. `#1c5f74`
alcanza 6,4:1 sobre el fondo, 5,5:1 sobre el color de las tarjetas y 7,1:1
bajo el texto blanco de los botones, todos por encima del 4,5:1 que pide
WCAG. El README del tema enumera cada token y cada par de colores que
comprueba.

## 5. Añadir tu propio CSS

Para las reglas que los tokens no cubren, añade una hoja de estilos propia y
deja que el tema la enlace. Ponla en `theme/assets/css/custom.css`; la regla
da estilo a una línea que añadirás en la sección siguiente:

```css:theme/assets/css/custom.css
.page-kicker {
    margin: 0 0 0.25rem;
    color: var(--theme-color-accent);
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}
```

y añádela bajo `extra_css` en `config/theme.yaml`:

```yaml:config/theme.yaml
extra_css:
    - /css/custom.css
```

El tema la enlaza después de su propia hoja de estilos y del `<style>` de los
tokens, así que tus reglas ganan:

```html
<link rel="stylesheet" href="/css/theme.css">
<style>
  …
</style>
<link rel="stylesheet" href="/css/custom.css">
```

`public/css/` contiene ahora tanto `theme.css` (del paquete) como
`custom.css` (de tu sitio). Usa los tokens (`var(--theme-color-accent)`) en
lugar de valores de color copiados, para que un cambio de la sección 4 llegue
también a tus reglas. El tema enumera sus nombres de clase públicos en su
README; esos son los que se mantienen estables entre versiones minor y patch.

No sobrescribas `theme/assets/css/theme.css` en sí: tu copia sustituiría
toda la hoja de estilos del tema, y sus correcciones dejarían de llegarte.

## 6. Sobrescribir un partial

Ahora cambia el marcado. El encabezado de cada página excepto la portada
está en el partial `partials/page-header.pug`. Cópialo del paquete a la misma
ruta en tu sitio:

```bash
mkdir -p theme/views/partials
cp node_modules/@nera-static/theme-business/views/partials/page-header.pug theme/views/partials/
```

y añade una línea pequeña encima del título, leída de una nueva clave de
frontmatter `kicker`:

```pug:theme/views/partials/page-header.pug
//- Overrides the theme's partials/page-header.pug: adds a kicker line
//- above the page title, from the page's `kicker` frontmatter.
header.page__header
    if meta.kicker
        p.page-kicker= meta.kicker
    h1.page__title= meta.title || app.name
    if meta.lead
        p.page__lead= meta.lead
```

La clase es tuya, `page-kicker`, no un nombre dentro del bloque `page__…` del
tema: una versión posterior del tema podría añadir un `page__kicker` propio.
Úsala en una página:

```markdown:pages/about.md
---
layout: pages/default.pug
title: About us
kicker: Since 1998
lead: A small bakery in the middle of Berlin.
description: Who we are and how we bake
---
## Our story

We bake every loaf by hand.
```

`npx nera build` renderiza `public/about.html` con tu encabezado:

```html
<header class="page__header">
  <p class="page-kicker">Since 1998</p>
  <h1 class="page__title">About us</h1>
  <p class="page__lead">A small bakery in the middle of Berlin.</p>
</header>
```

Una página sin `kicker` se renderiza como antes. Todas las demás vistas, el
layout, el pie de página, los tipos de página, siguen viniendo del paquete:
has asumido un archivo, no el tema.

Un tema a menudo te prepara esos sitios. theme-business trae partials vacíos,
sus *seams* (costuras), para la salida de los plugins:
`partials/head-extra.pug` al final del `<head>`, `partials/nav-main.pug` en la
navegación de la cabecera, `partials/footer-extra.pug` en el pie de página y
algunos más, enumerados en su README. Sobrescribir un seam no cuesta nada,
porque no contiene marcado del tema que te puedas perder. Para un tipo de
página propio, pon un archivo nuevo en `theme/views/pages/` que haga
`extends ../layouts/layout.pug`; el README muestra uno.

## 7. Las actualizaciones siguen llegando

Actualiza el tema igual que el propio Nera:

```bash
npx nera update
```

```text
🔄 Updating Nera packages: @nera-static/nera, @nera-static/theme-business
```

`nera update` ejecuta `npm update` para cada paquete `@nera-static/` de
`package.json`, el tema incluido. Como `npm update`, se queda dentro del
rango de cada paquete, así que nunca se instala a tus espaldas una versión
major nueva del tema. `npm ls` muestra la versión que tienes:

```bash
npm ls @nera-static/theme-business
```

```text
my-site@1.0.0 …/my-site
└── @nera-static/theme-business@1.0.3
```

Una actualización sustituye los archivos de `node_modules/`, nunca los de tu
`theme/`. Eso tiene dos caras:

-   Tus tokens, `custom.css` y `page-header.pug` sobreviven a cada
    actualización.
-   Tu `page-header.pug` ya no recibe los cambios del tema en ese archivo.
    Todos los demás sí.

Después de una actualización, compara cada archivo que sobrescribes con la
versión nueva del tema y adopta lo que quieras:

```bash
diff node_modules/@nera-static/theme-business/views/partials/page-header.pug theme/views/partials/page-header.pug
```

```text
1,2c1,2
< //- The page header of every page type but home (§S3.1 "Header"): the page's
< //- one <h1> and its lead.
---
> //- Overrides the theme's partials/page-header.pug: adds a kicker line
> //- above the page title, from the page's `kicker` frontmatter.
3a4,5
>     if meta.kicker
>         p.page-kicker= meta.kicker
```

Aquí las únicas diferencias son las tuyas. El tema sigue el versionado
semántico en sus rutas de vistas, tokens, ajustes y clases públicas: una
versión minor o patch mantiene tus sobrescrituras funcionando, y una major
dice en su CHANGELOG qué cambiar. Cuantos menos archivos sobrescribas, menos
hay que comparar.

## 8. Añadir un tema a un sitio existente

Un sitio creado sin `--theme` tiene su propio layout, generado por
`nera new`. Instala el tema y nómbralo en `config/app.yaml`:

```bash
npm install @nera-static/theme-business
```

```yaml:config/app.yaml
theme: business
```

`nera validate` señala entonces las dos vistas generadas que estorban:

```text
theme/views/layouts/layout.pug
  :1    warning  the `nera new` starter file hides the theme's own layouts/layout.pug — delete it to use the theme's, or remove the `nera:scaffold-default` line to keep it on purpose  theme-shadowed
theme/views/pages/default.pug
  :1    warning  the `nera new` starter file hides the theme's own pages/default.pug — delete it to use the theme's, or remove the `nera:scaffold-default` line to keep it on purpose  theme-shadowed

0 error(s), 2 warning(s)
```

Tienen las mismas rutas que dos de las vistas del tema, así que por la regla
de la sección 3 ganarían ellas, y el tema nunca se vería. Su primera línea,
`//- nera:scaffold-default`, las marca como archivos de inicio sin tocar.
Bórralas:

```bash
rm theme/views/layouts/layout.pug theme/views/pages/default.pug
npx nera validate
```

```text
✓ No problems found.
```

Si cambiaste una de ellas y quieres conservarla, quita su línea
`nera:scaffold-default`: el archivo pasa a ser una sobrescritura deliberada y
el aviso desaparece. Después corrige los encabezados y los enlaces del pie de
página como en la sección 2.

Una página se renderiza con el tipo de página del tema del mismo nombre que
su `layout`. theme-business tiene `pages/home.pug`, `default.pug`,
`contact.pug`, `list.pug` y `gallery.pug`; una página cuyo `layout` nombra
una vista que no tienen ni tu sitio ni el tema falla en `nera validate` con
`layout-unresolved`, que nombra los dos sitios donde buscó.

## 9. Cambiar entre los temas de blog

Hay cuatro temas hechos para blogs: `@nera-static/theme-blog` («Plain»),
`theme-stack` para código, `theme-ansitz` para fotografías y `theme-umwege`
para viajes. La [página de temas](/es/themes/index.html) muestra cada uno con
una captura y una demo con las entradas de ejemplo de su kit de inicio. Los
cuatro comparten un contrato, así que un blog escrito para uno se renderiza en
cualquiera de los otros. Crea uno con el blog sencillo:

```bash
npx @nera-static/nera new my-blog --starter blog --yes
cd my-blog
```

Con `--yes`, `--starter blog` toma el blog sencillo sin preguntar: el sitio
depende de `@nera-static/theme-blog` `^2.1.0`, y `config/app.yaml` dice
`theme: blog`.

Lo que comparten los cuatro temas:

| compartido | claves |
|---|---|
| tipos de página | `pages/home.pug`, `post.pug`, `archive.pug`, `tag.pug`, `default.pug` |
| `config/theme.yaml` | `author.name`, `author.bio`, `author.href`, `blog.home_posts`, `blog.featured_series`, `blog.highlight_tag`, `blog.post_layouts`, `footer_links`, `extra_css` |
| frontmatter de una entrada | `date`, `updated`, `author`, `image`, `image_alt`, `tags`, `series`, `series_part`, `facts`, `location`, `image_note` |
| el resto | los seams para la salida de los plugins y las claves de `t()` |

Para cambiar a Stack, instala el paquete:

```bash
npm install @nera-static/theme-stack
```

```text
added 1 package, and audited 168 packages in 833ms
```

y cambia la única línea de `config/app.yaml`:

```yaml:config/app.yaml
theme: stack
```

```bash
npx nera build --check
```

```text
✓ No problems found.
```

Las mismas páginas, el mismo `config/theme.yaml` y cada archivo que el kit de
inicio puso en `theme/` se renderizan ahora en Stack. `theme: ansitz` y
`theme: umwege` (tras
`npm install @nera-static/theme-ansitz @nera-static/theme-umwege`) compilan
igual de limpios. Cuando hayas elegido, quita los paquetes que ya no usas:
`npm uninstall @nera-static/theme-blog`.

Lo que un tema no dibuja, lo ignora, así que cambiar de tema nunca rompe una
página:

-   `location` e `image_note` aparecen en Ansitz (las dos) y en Umwege
    (`location`); Plain y Stack no muestran ninguna. Dale a la entrada
    `pages/posts/tags.md` del kit de inicio un `location: Berlin`, y su página
    lleva `<p class="post__location">` con Ansitz y Umwege y nada con Plain y
    Stack, con una compilación limpia en los cuatro.
-   `blog.highlight_tag` es una lista en la portada en Plain, Ansitz y Umwege;
    Stack no renderiza nada para ella. `blog.featured_series` es un bloque en
    la portada en Plain, Stack y Ansitz; Umwege no renderiza nada para él.

`blog.home_posts` cuenta las entradas que la portada lista **después** de su
gran apertura, que nunca cuenta: el «Latest post» en Plain y Stack, la tarjeta
de embarque en Umwege (en ambos casos la entrada más reciente) y el hero en
Ansitz (la entrada más reciente con `image`). Cada tema tiene un valor por
defecto que llena su propia retícula (Plain 9, Stack 6, Ansitz y Umwege 7).
Fíjalo en tu `config/theme.yaml` y vale para el tema que uses: con
`home_posts: 2`, «Recent posts» lista dos entradas en los cuatro.

Dos cosas merecen una mirada al cambiar:

-   **Los tokens** son de cada tema. Los ocho tokens de color (`bg`,
    `surface`, `text`, `muted`, `accent`, `accent_text`, `border`, `focus`)
    existen en los cuatro, así que tus colores pasan al nuevo tema, pero se
    eligieron para otro aspecto: quítalos o vuelve a comprobar su contraste
    (sección 4). Stack y Umwege tienen algunos tokens propios (`night`,
    `night_text`, `night_muted` y `highlight` en Stack, `sun`, `coral` y `sky` en Umwege).
-   **Tus archivos en `theme/views/`** se quedan y ganan sobre cualquier tema.
    Los seams del kit de inicio (`partials/post-media.pug`, `tag-cloud.pug` y
    los demás), su tipo de página de búsqueda `pages/search.pug` y sus copias
    de vendor se renderizaron sin cambios con los cuatro temas. Una
    sobrescritura de una vista propia del tema, como el `page-header.pug` de
    la sección 6, es la copia de un archivo de un tema: compárala con el
    archivo del nuevo tema en la misma ruta (sección 7) antes de conservarla.

Stack, Ansitz y Umwege son más anchos que Plain; sus README recomiendan
`widths` más anchos para `@nera-static/plugin-images` en `config/images.yaml`.

## 10. Crea tu propio tema

Un tema propio es un paquete npm con la misma estructura: `views/`,
`assets/` y `config/theme.yaml`. `@nera-static/theme-example` es el más
pequeño, pensado para copiarlo: la sección de su README
[Using it as a blueprint for your own theme](https://github.com/seebaermichi/nera-theme-example#using-it-as-a-blueprint-for-your-own-theme)
explica cómo renombrar el paquete, los campos que Nera necesita para
encontrarlo y los seams que permiten a un sitio ampliarlo sin hacer un fork.
theme-business muestra las mismas ideas a tamaño completo: tokens, seams y un
contrato documentado.

## Siguiente

El [README de theme-business](https://github.com/seebaermichi/nera-theme-business#readme)
tiene cada token, ajuste, seam y clase pública. Los tutoriales de plugins,
como [Construye una navegación con estados activos](/es/tutorials/custom-navigation.html),
muestran cómo publicar las plantillas de un plugin; con theme-business las
incluyes desde un seam, como muestra su README para cada plugin que admite.
Los README de
[theme-blog](https://github.com/seebaermichi/nera-theme-blog#readme),
[theme-stack](https://github.com/seebaermichi/nera-theme-stack#readme),
[theme-ansitz](https://github.com/seebaermichi/nera-theme-ansitz#readme) y
[theme-umwege](https://github.com/seebaermichi/nera-theme-umwege#readme)
dicen qué dibuja cada tema de blog a partir de las claves compartidas.
