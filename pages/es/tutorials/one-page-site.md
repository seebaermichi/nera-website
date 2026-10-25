---
layout: pages/tutorial.pug
title: Construye un sitio de una sola página
slug: one-page-site
lang: es
description: Una única landing page con scroll, hecha con un archivo Markdown por sección, con navegación interna, un formulario de contacto mailto y enlaces sociales en el pie.
keywords: nera one-page, landing page, plugin-one-page, plugin-page-navigation, plugin-contact-form, plugin-social-media-links, formulario mailto
tags: plugins, one-page, forms
pagination_order: 11
createdAt: 2026-10-25
---
Un autónomo o un pequeño negocio a menudo necesita una página, no un sitio
entero: un hero, los servicios, unas palabras sobre quién eres y una forma de
contactar, todo en una sola página con scroll. En este tutorial construyes esa
página con cada sección en su propio archivo Markdown.
`@nera-static/plugin-one-page` integra las secciones en la página de inicio,
`@nera-static/plugin-page-navigation` añade los enlaces dentro de la página,
`@nera-static/plugin-contact-form` añade un formulario de contacto sin backend
y `@nera-static/plugin-social-media-links` pone tus perfiles en el pie de
página.

¿Prefieres editar un sitio de empresa ya terminado? El starter business crea
uno con un tema, páginas de ejemplo para servicios, sobre nosotros, horario y
contacto, un formulario de contacto y enlaces sociales:

```bash
npx @nera-static/nera new my-site --starter business
```

Sus archivos no coinciden con los pasos de abajo: el starter crea un sitio de
varias páginas, mientras que este tutorial construye una sola página a mano,
para mostrar cómo encajan las piezas.

## 1. Crear el sitio e instalar

```bash
npx @nera-static/nera new my-site
cd my-site
npm install @nera-static/plugin-one-page @nera-static/plugin-page-navigation \
    @nera-static/plugin-contact-form @nera-static/plugin-social-media-links
```

Nera encuentra los cuatro plugins por sí solo. Tres de ellos traen plantillas.
Publícalas en tu carpeta de vistas, donde son tuyas para editarlas:

```bash
npx nera-page-navigation
npx nera-contact-form
npx nera-social-media-links
```

En un sitio creado con `nera new` acaban en
`theme/views/vendor/plugin-<name>/`, y el script de cliente del formulario de
contacto en `theme/assets/js/contact-form.js`. `plugin-one-page` no trae
plantilla ni necesita archivo de configuración.

## 2. La página de destino

La página en la que se integran las secciones es una página normal. Aquí es la
página de inicio, y su propio contenido es el hero:

```markdown:pages/index.md
---
layout: pages/one-page.pug
title: Studio Lena
description: Web design for small businesses in Berlin
---
# Websites for small businesses

I design and build fast, simple websites for shops, studios and practices.
```

Dale una plantilla propia. Crece en los siguientes pasos; por ahora solo
renderiza el contenido:

```pug:theme/views/pages/one-page.pug
extends ../layouts/layout

block content
  main#main
    != content
```

## 3. Un archivo por sección

Cada sección es un archivo Markdown que indica su página de destino en
**`add_to_page`** y su posición en **`add_to_page_order`**. Agrúpalas en
`pages/sections/`:

```markdown:pages/sections/services.md
---
title: Services
add_to_page: /index.html
add_to_page_order: 1
anchor_id: services
content_wrapper_attributes:
    class: section section--services
---
## Services

- **New websites**: from the first sketch to the live site.
- **Redesigns**: a fresh look for the site you already have.
- **Care plans**: updates and small changes every month.
```

```markdown:pages/sections/about.md
---
title: About
add_to_page: /index.html
add_to_page_order: 2
anchor_id: about
content_wrapper_attributes:
    class: section section--about
---
## About

I'm Lena, a web designer in Berlin. I have built sites for small businesses
since 2015.
```

```markdown:pages/sections/contact.md
---
title: Contact
add_to_page: /index.html
add_to_page_order: 3
anchor_id: contact
content_wrapper_attributes:
    class: section section--contact
---
## Contact

Tell me about your project. The form opens your own email program with the
message ready to send.
```

Ejecuta `npx nera build`. Hasta el paso 7 también avisa de que
`plugin-contact-form` no tiene `recipient` configurado; el formulario
simplemente aún no se renderiza. `public/index.html` contiene ahora el hero
seguido de las tres secciones, en su orden (abreviado):

```html
    <main id="main">
      <h1>Websites for small businesses</h1>
      <p>I design and build fast, simple websites for shops, studios and practices.</p>


      <section class="section section--services">
        <a id="services"></a>
        <h2>Services</h2>
        <ul>
          <li><strong>New websites</strong>: from the first sketch to the live site.</li>
          …
        </ul>

      </section>

      <section class="section section--about">
        <a id="about"></a>
        <h2>About</h2>
        …
      </section>

      <section class="section section--contact">
        <a id="contact"></a>
        <h2>Contact</h2>
        …
      </section>
    </main>
```

Las secciones siempre se **añaden después del contenido propio de la página de
destino**. Cada una va envuelta en un `<section>`; `content_wrapper_tag` pone
otro elemento y `content_wrapper_tag: ''` quita el envoltorio. Los atributos
del envoltorio son un mapeo simple o una lista de entradas
`{ attribute, value }`, y sus valores se escapan como HTML. Pon entre comillas
un valor que contenga `: `:

```yaml
content_wrapper_attributes:
    style: 'background-color: #f5f5f5;'
```

Sin comillas, el frontmatter no se puede analizar: la compilación muestra
`❌ Failed to process page …: Nested mappings are not allowed in compact
mappings …`, descarta la página y aun así termina con código 0.
`nera validate` lo informa como error `yaml-parse`.

### `add_to_page` debe coincidir exactamente

`add_to_page` se compara literalmente con el `href` de la página de destino,
que siempre empieza por `/` y termina en `.html`: `pages/index.md` es
`/index.html`, `pages/de/index.md` es `/de/index.html`. Con
`add_to_page: index.html` no se integra nada, y la compilación lo dice:

```text
⚠️ one-page: no page has href "index.html" — 1 section(s) targeting it were not merged. `add_to_page` must match a page's href exactly, e.g. "/index.html" for pages/index.md
```

## 4. Anclas

Cada sección recibe un `<a id="…">` vacío delante de su contenido, de modo que
`/index.html#services` salta a ella. **`anchor_id`** fija el id. Sin él, el
plugin deriva uno del primer **`<h1>`** de la sección, convertido en slug: en
minúsculas, sin acentos y con todo lo demás convertido en `-`. Esta sección no
tiene `anchor_id`:

```markdown:pages/sections/team.md
---
title: Team
add_to_page: /index.html
add_to_page_order: 4
---
# Über uns

Zwei Leute, ein Studio.
```

Se integra así:

```html
      <section>
        <a id="uber-uns"></a>
        <h1>Über uns</h1>
        <p>Zwei Leute, ein Studio.</p>

      </section>
```

Los encabezados de nivel inferior se ignoran, así que una sección que solo
tiene encabezados `##` no recibe ancla a menos que fijes `anchor_id`. Y un
`<h1>` por sección no es lo que quieres en un sitio de una sola página: la
página de inicio ya tiene su `<h1>`, y con `team.md` presente
`nera build --check` avisa `page has more than one <h1>` (`a11y-h1`). Así que
da a las secciones encabezados `##` y un `anchor_id` explícito, como en el
paso 3, y vuelve a borrar `team.md`. Los ids explícitos además no cambian
cuando renombras un encabezado o traduces la página (ver el paso 10).

## 5. Secciones sin página propia

Una sección sigue siendo una página propia. Nera solo escribe una página si
tiene `layout`, y las secciones de arriba no tienen, así que solo existen
dentro de `/index.html`. Añade `layout: pages/default.pug` a `about.md` y la
compilación también escribe `/sections/about.html`, mientras la sección sigue
apareciendo en la página de inicio. Deja `layout` fuera salvo que quieras esa
segunda URL.

`nera validate` no sabe que el layout falta a propósito:

```text
pages/sections/about.md
        warning  page has no `layout` — the build skips it silently; add `layout: pages/default.pug` to its frontmatter (a template in theme/views), or, if it has none on purpose (a fragment or draft), add `ignore: { layout-missing: [pages/sections/about.md] }` to config/validate.yaml  layout-missing
…
0 error(s), 3 warning(s)
```

Como todas las secciones están en una carpeta, una sola entrada las silencia
todas:

```yaml:config/validate.yaml
ignore:
    layout-missing:
        - pages/sections
```

Una carpeta cubre todo lo que hay debajo. `nera validate` muestra ahora
`✓ No problems found.`

## 6. Navegación dentro de la página

`plugin-page-navigation` construye una navegación de **páginas hermanas** de la
misma carpeta y omite las páginas de la raíz del sitio, así que por sí solo no
le da nada a `index.md`. Su otro modo encaja: una lista **`page_navigation`**
en el frontmatter de la página, cuyas entradas llegan a la plantilla tal como
están escritas. Haz que apunten a las anclas:

```markdown:pages/index.md
---
layout: pages/one-page.pug
title: Studio Lena
description: Web design for small businesses in Berlin
page_navigation:
    - href: '#services'
      name: Services
    - href: '#about'
      name: About
    - href: '#contact'
      name: Contact
---
# Websites for small businesses

I design and build fast, simple websites for shops, studios and practices.
```

Pon los `href` entre comillas: en YAML, un `#` sin comillas después de un
espacio empieza un comentario. Incluye la plantilla publicada encima del
contenido:

```pug:theme/views/pages/one-page.pug
extends ../layouts/layout

block content
  main#main
    include /vendor/plugin-page-navigation/page-navigation
    != content
```

El `<nav>` recibe su nombre de la clave de traducción `Page navigation`, para
que los lectores de pantalla lo distingan de un menú principal. Dale una
etiqueta en tu idioma en `config/app.yaml`:

```yaml:config/app.yaml
translations:
  en:
    Page navigation: On this page
```

La página compilada empieza con:

```html
      <nav class="page-nav" aria-label="On this page"><a class="page-nav__link" href="#services">Services</a><a class="page-nav__link" href="#about">About</a><a class="page-nav__link" href="#contact">Contact</a></nav>
```

Podrías escribir estos tres enlaces a mano en la plantilla igual de bien. El
plugin se gana su sitio cuando los enlaces cambian por página o por idioma:
viven en el frontmatter de cada página, junto al contenido al que apuntan.

## 7. El formulario de contacto

`plugin-contact-form` renderiza un formulario a partir de
`config/contact-form.yaml`. Al enviarlo, un pequeño script en el navegador
construye un enlace `mailto:` con los campos y abre el propio programa de
correo del visitante con el asunto y el mensaje ya rellenados. No hay backend:
tu sitio no guarda ni envía nada, y el mensaje solo sale a través del correo
del visitante. (Procesar el formulario en un servidor queda fuera de este
tutorial.)

```yaml:config/contact-form.yaml
recipient: hello@example.com
subject: contact_subject
submit_label: contact_submit
error_required: contact_required
error_email: contact_email_invalid

fields:
    - { name: name, label: contact_name, type: text, required: true }
    - { name: email, label: contact_email, type: email, required: true }
    - name: topic
      label: contact_topic
      type: select
      required: true
      options:
          - { value: new-site, label: contact_topic_new }
          - { value: redesign, label: contact_topic_redesign }
          - { value: care, label: contact_topic_care }
    - { name: message, label: contact_message, type: textarea, required: true }
```

Cada valor que ve el visitante es aquí una **clave de traducción**, que se
resuelve para el idioma de cada página desde `translations:` en
`config/app.yaml`. Una clave sin traducción se muestra tal cual, así que un
sitio en un solo idioma podría escribir el texto directamente; las claves
compensan en el paso 10. `name` y los `value` de las opciones son datos y nunca
se traducen. Añade los textos en inglés:

```yaml:config/app.yaml
translations:
  en:
    Page navigation: On this page
    contact_subject: Enquiry from the website
    contact_submit: Open in my email program
    contact_required: Please fill in all required fields.
    contact_email_invalid: Please enter a valid email address.
    contact_name: Your name
    contact_email: Your email
    contact_topic: What can I help with?
    contact_topic_new: A new website
    contact_topic_redesign: A redesign
    contact_topic_care: A care plan
    contact_message: Your message
```

Conserva junto a estas las claves que `nera new` puso bajo `en:`
(`app_description`, `skip_to_content` y las demás).

El formulario es Pug, así que va en la plantilla, no en una sección Markdown.
La sección de contacto tiene el `add_to_page_order` más alto, así que el
formulario colocado después del contenido sigue directamente a su texto:

```pug:theme/views/pages/one-page.pug
extends ../layouts/layout

block content
  main#main
    include /vendor/plugin-page-navigation/page-navigation
    != content
    include /vendor/plugin-contact-form/contact-form
```

El formulario compilado (abreviado):

```html
      <form class="contact-form" novalidate="novalidate" data-contact-form="data-contact-form">
        <script type="application/json" data-contact-config="data-contact-config">
          {
            "subject": "Enquiry from the website",
            …
          }
        </script><span class="contact-form__recipient" hidden="hidden" data-contact-recipient="&#104;&#101;&#108;&#108;&#111;&#64;&#101;&#120;&#97;&#109;&#112;&#108;&#101;&#46;&#99;&#111;&#109;"></span>
        <div class="contact-form__field contact-form__field--text"><label class="contact-form__label" for="contact-name">Your name</label><input class="contact-form__input" type="text" id="contact-name" name="name" data-contact-field="data-contact-field" data-contact-label="Your name" required="required" /></div>
        …
        <div class="contact-form__decoy" aria-hidden="true" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden"><label for="contact-website">website</label><input type="text" id="contact-website" name="website" tabindex="-1" autocomplete="off" /></div>
        <div class="contact-form__status" role="alert" aria-live="polite" data-contact-status="data-contact-status"></div><button class="contact-form__submit" type="submit">Open in my email program</button>
      </form>
      <script src="/js/contact-form.js"></script>
```

Enviado con todos los campos rellenados, el formulario abrió este enlace:

```text
mailto:hello@example.com?subject=Enquiry%20from%20the%20website&body=Your%20name%3A%20Jane%20Doe%0D%0AYour%20email%3A%20jane%40example.org%0D%0AWhat%20can%20I%20help%20with%3F%3A%20redesign%0D%0AYour%20message%3A%20Hello%20Lena
```

Enviado vacío, no abrió nada y mostró `Please fill in all required fields.`
en la línea de estado. Conviene conocer tres detalles:

- **El destinatario está ofuscado, no oculto.** Nunca aparece como texto
  legible, pero está en la página:

  | `obfuscation` | Qué queda en el HTML | Solidez |
  | --- | --- | --- |
  | `entities` (por defecto) | cada carácter como entidad HTML, como arriba | frena a los scrapers ingenuos; uno decidido aún puede decodificarlo |
  | `jsassembly` | solo un array de códigos de carácter, reconstruido en JavaScript al enviar | más sólido, pero sigue sin ser una garantía |

  Usa una dirección que estés dispuesto a publicar.
- **Trae un honeypot.** El campo oculto `website` es un señuelo para bots; un
  envío que lo rellena se descarta en silencio. Nunca le des a un campo real el
  nombre del honeypot. Si quieres un campo «website» real, renombra el señuelo
  con `honeypot:` en la configuración.
- **El plugin no trae CSS**, aparte de la regla inline que oculta el señuelo.
  Da estilo a las clases BEM `.contact-form`, `.contact-form__field`,
  `.contact-form__input` y las demás desde tu propia hoja de estilos.

## 8. Enlaces sociales en el pie de página

`plugin-social-media-links` lee una lista de enlaces de
`config/social-media-links.yaml`:

```yaml:config/social-media-links.yaml
aria_label: Social media
open_in_new_tab: false

social_media_links:
    - name: GitHub
      href: https://github.com/yourname
      icon: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 …"/></svg>'
      icon_raw: true
    - name: LinkedIn
      href: https://www.linkedin.com/in/yourname
```

El atributo `d` está abreviado aquí; pega la ruta completa del icono que uses.
Simple Icons (simpleicons.org) tiene los logos de marcas en SVG. `icon` se
escapa salvo que la entrada fije `icon_raw: true`, así que fíjalo solo para
marcado que hayas escrito o revisado tú. La entrada LinkedIn no tiene icono y
solo muestra su nombre. La configuración de ejemplo del plugin usa en su lugar
etiquetas `<i>` de Font Awesome, que necesitan el CSS de Font Awesome.
Cargarlo desde un CDN envía la dirección IP de cada visitante a un tercero, y
`nera build --check` avisa entonces `privacy-third-party`. El SVG inline o el
texto plano no necesitan ninguna petición.

Con `open_in_new_tab: false`, el visitante decide dónde se abre un enlace; sin
esa línea, cada enlace recibe `target="_blank"`. `rel="noopener noreferrer"` se
pone en ambos casos.

Incluye la plantilla publicada en el pie del layout base que creó `nera new`.
Quita su primera línea, la marca `//- nera:scaffold-default`, ahora que el
archivo es tuyo:

```pug:theme/views/layouts/layout.pug
<!DOCTYPE html>
html(lang=app.lang)
  head
    meta(charset="UTF-8")
    meta(name="viewport", content="width=device-width, initial-scale=1.0")
    title #{ meta.title } | #{ app.name }
    meta(name="description", content=`${ meta.description || t('app_description') }`)
    meta(name="keywords", content=`${ meta.keywords || t('app_keywords') }`)
    meta(name="generator" content="nera")
    meta(name="robots" content=`${ meta.robots || app.robots }`)
    style.
      .skip-link { position: absolute; left: -9999px; }
      .skip-link:focus { position: static; }

  body
    a.skip-link(href="#main") #{ t('skip_to_content') }
    block content
    footer
      include /vendor/plugin-social-media-links/social-media-links
      a(href="/imprint.html") #{ t('imprint') }
      = ' · '
      a(href="/privacy.html") #{ t('privacy') }
```

El pie de página empieza ahora con (ruta del SVG abreviada):

```html
    <footer>
      <nav class="social-media-links" aria-label="Social media">
        <ul class="social-media-links__list">
          <li class="social-media-links__item"><a class="social-media-links__link" href="https://github.com/yourname" title="GitHub" rel="noopener noreferrer"><span class="social-media-links__icon"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 …"/></svg></span><span class="social-media-links__label">GitHub</span></a></li>
          <li class="social-media-links__item"><a class="social-media-links__link" href="https://www.linkedin.com/in/yourname" title="LinkedIn" rel="noopener noreferrer"><span class="social-media-links__icon"></span><span class="social-media-links__label">LinkedIn</span></a></li>
        </ul>
      </nav><a href="/imprint.html">Imprint</a> · <a href="/privacy.html">Privacy</a>
    </footer>
```

## 9. Scroll bajo una navegación fija

Un poco de CSS hace que la página se sienta de una pieza: la navegación se
queda arriba, los enlaces se desplazan con suavidad y una sección no acaba
escondida bajo la navegación. Crea `theme/assets/css/site.css`:

```css:theme/assets/css/site.css
html {
    scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
    html {
        scroll-behavior: auto;
    }
}

.page-nav {
    position: sticky;
    top: 0;
    display: flex;
    gap: 1rem;
    padding: 1rem 0;
    background: #fff;
}

.section > a[id] {
    scroll-margin-top: 4rem;
}
```

El destino del scroll es el ancla, no el `<section>`, así que
`scroll-margin-top` va en `a[id]`. Carga el archivo en el `head` del layout,
después de las líneas `meta`:

```pug
    link(rel="stylesheet", href="/css/site.css")
```

Los archivos de `theme/assets/` se sirven desde la raíz del sitio, así que el
archivo es `/css/site.css`. En un navegador headless, en una página lo
bastante larga para desplazarse hasta ahí, un clic en cada enlace de la
navegación dejó su encabezado a 64 px (4rem) del borde superior, justo debajo
de la navegación fija de 50 px de alto.

## 10. Un segundo idioma

Una copia en alemán de la página es un segundo destino con sus propias
secciones. Pon `lang: de` en cada archivo y apunta a `/de/index.html`:

```markdown:pages/de/index.md
---
layout: pages/one-page.pug
lang: de
title: Studio Lena
description: Webdesign für kleine Unternehmen in Berlin
page_navigation:
    - href: '#services'
      name: Leistungen
    - href: '#about'
      name: Über mich
    - href: '#contact'
      name: Kontakt
---
# Websites für kleine Unternehmen

Ich gestalte und baue schnelle, einfache Websites für Läden, Studios und Praxen.
```

```markdown:pages/de/sections/services.md
---
lang: de
title: Leistungen
add_to_page: /de/index.html
add_to_page_order: 1
anchor_id: services
content_wrapper_attributes:
    class: section section--services
---
## Leistungen

- **Neue Websites**: von der ersten Skizze bis zur fertigen Seite.
- **Redesigns**: ein frischer Auftritt für die Website, die Sie schon haben.
- **Pflege**: Updates und kleine Änderungen jeden Monat.
```

`about.md` y `contact.md` en `pages/de/sections/` siguen el mismo patrón, con
`anchor_id: about` y `anchor_id: contact`. Las anclas son las mismas en ambos
idiomas, así que el CSS sirve para los dos y un enlace a `#contact` funciona en
cualquiera de las dos páginas.

Amplía la entrada de `ignore` a cada carpeta de idioma; `*` equivale a un
nombre de carpeta:

```yaml:config/validate.yaml
ignore:
    layout-missing:
        - pages/sections
        - pages/*/sections
```

Traduce las claves de los pasos 6 y 7 bajo `de:` en `config/app.yaml`:

```yaml:config/app.yaml
  de:
    app_description: Eine statische Website, gebaut mit Nera
    app_keywords: nera, static site generator
    skip_to_content: Zum Inhalt springen
    imprint: Impressum
    privacy: Datenschutz
    Page navigation: Auf dieser Seite
    contact_subject: Anfrage über die Website
    contact_submit: In meinem E-Mail-Programm öffnen
    contact_required: Bitte füllen Sie alle Pflichtfelder aus.
    contact_email_invalid: Bitte geben Sie eine gültige E-Mail-Adresse ein.
    contact_name: Ihr Name
    contact_email: Ihre E-Mail-Adresse
    contact_topic: Wobei kann ich helfen?
    contact_topic_new: Eine neue Website
    contact_topic_redesign: Ein Redesign
    contact_topic_care: Ein Pflegepaket
    contact_message: Ihre Nachricht
```

El layout generado fija `html(lang=app.lang)`, que es `en` en todas las
páginas. Usa en su lugar el idioma de la página:

```pug
html(lang=meta.lang || app.lang)
```

`/de/index.html` tiene entonces `<html lang="de">`, la navegación en alemán y
el formulario en alemán, con los mismos nombres de campo:

```html
      <nav class="page-nav" aria-label="Auf dieser Seite"><a class="page-nav__link" href="#services">Leistungen</a><a class="page-nav__link" href="#about">Über mich</a><a class="page-nav__link" href="#contact">Kontakt</a></nav>
      …
        <div class="contact-form__field contact-form__field--text"><label class="contact-form__label" for="contact-name">Ihr Name</label><input class="contact-form__input" type="text" id="contact-name" name="name" data-contact-field="data-contact-field" data-contact-label="Ihr Name" required="required" /></div>
```

La plantilla incluida no pasa el `aria_label` de los enlaces sociales por
`t()`. Para traducirlo, cambia la línea `nav` en tu
`theme/views/vendor/plugin-social-media-links/social-media-links.pug`
publicado:

```pug
    nav.social-media-links(aria-label=t(app.socialMediaLinksLabel))
```

y añade `Social media: Soziale Medien` bajo `de:`. Con todo esto en su sitio,
`nera validate` y `nera build --check` muestran ambos `✓ No problems found.`

## ¿One-page o stacks?

[plugin-stacks](/es/tutorials/reusable-content-blocks.html) también convierte
archivos Markdown en piezas de otras páginas, pero al revés. Un stack es un
bloque que una **vista** coloca a través de `app.stacks`, donde quieras y
tantas veces como quieras; se marca con `type: stack` y no necesita entrada en
`validate.yaml`. Una sección de one-page indica **su página de destino** en
`add_to_page`, y el plugin la añade al contenido de esa página, en orden, con
un ancla y un envoltorio, sin tocar ninguna plantilla. Usa one-page cuando una
página es una secuencia de secciones. Usa stacks cuando el mismo bloque va en
varios sitios o en un lugar concreto de un layout.

## Siguiente

- [Construye una navegación con estados activos](/es/tutorials/custom-navigation.html)
  añade un menú principal cuando la única página se convierta en unas cuantas.
- [Cómo está construido este sitio web](/es/tutorials/how-this-site-is-built.html)
  muestra un sitio Nera completo con sus plugins trabajando juntos.
