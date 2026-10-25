---
layout: pages/tutorial.pug
title: Añade un banner de consentimiento — o ninguno — con plugin-consent
slug: consent-banner
lang: es
description: Averigua si tu sitio necesita un banner de consentimiento, y carga un vídeo de YouTube y un script de analítica con plugin-consent solo después del consentimiento.
keywords: nera consentimiento, plugin-consent, banner de cookies, banner de consentimiento, inserción en dos clics, insertar YouTube, consentimiento analítica, nera build --check, RGPD
tags: plugins, privacy
pagination_order: 10
createdAt: 2026-10-25
---
Un banner de consentimiento pide a los visitantes su consentimiento antes de
que se ejecute en el sitio algo que lo necesita: un script de analítica, un
vídeo de YouTube, un mapa. Un sitio que no carga nada de eso no tiene nada que
preguntar. `@nera-static/plugin-consent` cubre ambos casos: en un sitio sin
esos servicios muestra un aviso breve (o nada), en un sitio con ellos un banner
con un diálogo de ajustes, y mantiene inactivos todos los scripts e
inserciones configurados hasta que el visitante da su consentimiento.

Cada comando, configuración y salida de abajo se ejecutó en un sitio recién
creado con `nera new`, con plugin-consent 1.0.2 y `@nera-static/validate`
1.6.2.

## 1. ¿Necesitas un banner?

Empieza por lo que tu sitio carga desde otros hosts. Cada fuente, vídeo, mapa
o script de un servidor ajeno envía allí la dirección IP del visitante, y mucho
de ello instala cookies. La primera opción no es un banner, sino **no cargarlo
desde fuera**:

- sirve las fuentes desde tu propio sitio (la IBM Plex de este sitio está en
  `theme/assets/fonts/`),
- sirve un archivo de vídeo desde tu propio host con `<video>`, o enlaza el
  vídeo en lugar de insertarlo,
- aloja tú mismo la herramienta de estadísticas, o prescinde de ella.

Alojarlo tú mismo elimina la petición a terceros. Eso no decide por sí solo si
una herramienta que guarda algo en el dispositivo del visitante necesita
consentimiento; depende de qué guarda y para qué. El trasfondo, con más
detalle (en inglés):
[Do I need a cookie banner?](https://michael-becker-berlin.de/en/blog/2026/10/do-i-need-a-cookie-banner.html)

Si no queda nada que necesite consentimiento, no necesitas banner. Aun así
puedes instalar el plugin: sin `config/consent.yaml`, o con uno que no
indica categorías, está en **modo aviso** y muestra un aviso breve:

```html
<section class="nera-consent nera-consent--notice" data-consent-notice="data-consent-notice" data-consent-revision="1" aria-labelledby="nera-consent-notice-text" hidden="hidden">
  <p class="nera-consent__text" id="nera-consent-notice-text">This site uses only technically necessary cookies. <a class="nera-consent__link" href="/privacy.html">Privacy policy</a></p>
  <div class="nera-consent__actions"><button class="nera-consent__button" type="button" data-consent-dismiss="data-consent-dismiss">Got it</button></div>
</section>
```

El runtime lo muestra hasta que el visitante pulsa «Got it». Los textos
vienen en inglés y alemán; para el español, mira el paso 6. Si no quieres ni
siquiera eso, pon `notice: false`:

```yaml:config/consent.yaml
privacy_url: /privacy.html
notice: false
```

`app.consent.mode` es entonces `'none'`, y las vistas no muestran nada. En
cuanto añades una categoría, `notice: false` deja de aplicarse, y el build lo
dice:

```text
⚠️ plugin-consent: config/consent.yaml: ignoring notice: false, the site has categories and shows the banner
```

## 2. Instalar y conectar el layout

```bash
npm install @nera-static/plugin-consent
npx nera-consent-config
npx nera-consent
```

`npx nera-consent-config` copia el `config/consent.yaml` documentado, con
todos los ejemplos comentados, así que el sitio empieza en modo aviso.
`npx nera-consent` copia las cinco vistas (`banner`, `settings`, `notice`,
`head`, `embed`). En un sitio creado con `nera new` acaban en
`theme/views/vendor/plugin-consent/`. Ambos comandos se saltan un archivo o
una carpeta que ya existe; `--force` lo sobrescribe, y con ello tus cambios.

Los plugins no pueden tocar tu layout, así que este es el único paso manual.
Añade la hoja de estilos, la vista `head` y el runtime dentro de `<head>`, un
enlace a los ajustes en el pie y las otras tres vistas al final de `<body>`:

```pug:theme/views/layouts/layout.pug
<!DOCTYPE html>
html(lang=app.lang)
  head
    meta(charset="UTF-8")
    meta(name="viewport", content="width=device-width, initial-scale=1.0")
    title #{ meta.title } | #{ app.name }
    link(rel='stylesheet' href='/_nera/consent.css')
    include /vendor/plugin-consent/head
    script(src='/_nera/consent.js' defer)

  body
    a.skip-link(href="#main") #{ t('skip_to_content') }
    block content
    footer
      a(href="/imprint.html") #{ t('imprint') }
      = ' · '
      a(href="/privacy.html") #{ t('privacy') }
      = ' · '
      a(href='/privacy.html' data-consent-open) Privacy settings
    include /vendor/plugin-consent/banner
    include /vendor/plugin-consent/settings
    include /vendor/plugin-consent/notice
```

(Las demás etiquetas `meta` y el bloque `style` de la plantilla inicial se
quedan como están; aquí se omiten.)

- `consent.css` y `consent.js` se copian a `public/_nera/` en cada build, en
  todos los modos. El runtime necesita `defer`.
- `banner`, `settings` y `notice` solo se muestran cada uno en su propio modo,
  así que incluye los tres.
- Cualquier elemento con `data-consent-open` abre el diálogo de ajustes, donde
  el visitante puede cambiar o retirar su elección en cualquier momento. En un
  enlace, el `href` es la alternativa para una página sin el diálogo o sin
  JavaScript.

El plugin necesita `@nera-static/core` 4.13.0 o posterior, que trae cualquier
`@nera-static/nera` actual.

## 3. Cargar un vídeo de YouTube solo tras el consentimiento

Pega el código de inserción en una página como siempre:

```markdown:pages/video.md
---
layout: pages/default.pug
title: Our video
description: A page with an embedded video
---
# Our video

<iframe src="https://www.youtube-nocookie.com/embed/abc123" title="Our video" width="560" height="315" allowfullscreen></iframe>
```

Después describe el servicio en `config/consent.yaml`, en una categoría:

```yaml:config/consent.yaml
revision: 1
privacy_url: /privacy.html

categories:
    - id: media
      services:
          - name: YouTube
            provider: Google Ireland Limited, Dublin
            purpose: Shows embedded videos.
            privacy_url: https://policies.google.com/privacy
            hosts: [youtube.com, youtube-nocookie.com]
            cookies:
                - name: VISITOR_INFO1_LIVE
                  duration: 6 months
                  purpose: Estimates the visitor's bandwidth.
```

- `id: media` es uno de los cuatro ids con etiqueta y descripción integradas
  en inglés y alemán (`analytics`, `media`, `marketing`, `functional`);
  cualquier otro id necesita un `label`.
- `name`, `provider` y `purpose` son obligatorios; un servicio sin ellos se
  descarta con un aviso.
- `hosts` son nombres de host sin más. Un `<iframe>` cuyo host de `src` es
  igual a uno de ellos o es un subdominio suyo queda bloqueado:
  `www.youtube-nocookie.com` coincide con `youtube-nocookie.com`.
- `cookies` aparecen en el diálogo de ajustes. La entrada de arriba es un
  ejemplo: indica lo que documenta el proveedor.

Con una categoría configurada, el sitio está en modo banner. Tras
`nera build`, el iframe de `public/video.html` ya no tiene `src`; su URL pasó
a `data-consent-src`, y le sigue un marcador de posición:

```html
<div class="nera-consent-embed" data-consent-embed data-consent="media"><iframe data-consent="media" data-consent-src="https://www.youtube-nocookie.com/embed/abc123" title="Our video" width="560" height="315" allowfullscreen hidden></iframe>
  <div class="nera-consent-embed__placeholder">
    <p class="nera-consent-embed__text">This content is provided by YouTube. Loading it connects to <strong>Google Ireland Limited, Dublin</strong>.</p><button class="nera-consent-embed__load" type="button" data-consent-load>Load YouTube</button><a class="nera-consent-embed__privacy" href="https://policies.google.com/privacy" rel="noopener">Privacy policy of the provider</a><button class="nera-consent-embed__settings" type="button" data-consent-open>Privacy settings</button>
  </div>
</div>
```

En un navegador, la página de prueba no hizo ninguna petición a otro host
hasta un clic. «Load YouTube» cargó esa inserción y no guardó nada; «Accept
all» en el banner guardó la elección y cargó todos los elementos bloqueados.
El propio banner pone Accept all, Reject all y Settings en la primera capa, en
ese orden fijo y con un mismo estilo:

```html
<section class="nera-consent" data-consent-banner="data-consent-banner" data-consent-revision="1" data-consent-categories="media" aria-labelledby="nera-consent-title" hidden="hidden">
  <h2 class="nera-consent__title" id="nera-consent-title">Cookies and external content</h2>
  <p class="nera-consent__text">This site can load content and services from third parties. They only load if you agree. You can change your choice at any time in the settings. <a class="nera-consent__link" href="/privacy.html">Privacy policy</a></p>
  <div class="nera-consent__actions"><button class="nera-consent__button" type="button" data-consent-accept-all="data-consent-accept-all">Accept all</button><button class="nera-consent__button" type="button" data-consent-reject-all="data-consent-reject-all">Reject all</button><button class="nera-consent__button" type="button" data-consent-open="data-consent-open">Settings</button></div>
</section>
```

`<embed>`, `<object>`, `<video>` y `<audio>` de un host configurado se
bloquean igual. Hay dos sitios a los que el build no llega:

- Un iframe escrito directamente en una **vista Pug** no se reescribe. Usa allí
  el mixin de la vista `embed` publicada; genera el mismo marcador:

  ```pug
  include /vendor/plugin-consent/embed

  +consent-embed({
    category: 'media',
    service: 'YouTube',
    src: 'https://www.youtube-nocookie.com/embed/abc123',
    attributes: { title: 'Our video', width: 560, height: 315, allowfullscreen: true },
  })
  ```

  `category` y `service` deben nombrar un servicio configurado; si no, el
  build falla en lugar de generar un iframe activo.
- Un `<video>`, `<audio>` o `<embed>` bloqueado escrito en línea dentro de un
  párrafo de Markdown acaba dentro de un `<p>`, que el navegador parte
  alrededor del marcador. Pon su etiqueta de apertura sola en una línea,
  después de una línea en blanco.

## 4. Cargar un script de analítica solo tras el consentimiento

Un script que configuras en `scripts` de un servicio lo emite la vista `head`,
inactivo. Añade una segunda categoría:

```yaml:config/consent.yaml
revision: 2
privacy_url: /privacy.html

categories:
    - id: media
      # … YouTube como arriba
    - id: analytics
      services:
          - name: Matomo
            provider: Example GmbH, Berlin
            purpose: Counts visits without profiles.
            cookies:
                - name: _pk_id
                  duration: 13 months
                  purpose: Recognises returning visitors.
            scripts:
                - inline: |
                      var _paq = window._paq = window._paq || [];
                      _paq.push(['trackPageView']);
                - src: https://matomo.example.com/matomo.js
                  async: true
```

Cada entrada de script tiene exactamente uno de `src` e `inline`. En el
`<head>` generado, ambos son `type="text/plain"`, que el navegador no ejecuta,
y la URL está en `data-src`:

```html
<link rel="stylesheet" href="/_nera/consent.css" />
<script type="text/plain" data-consent="analytics">var _paq = window._paq = window._paq || [];
_paq.push(['trackPageView']);
</script>
<script type="text/plain" data-consent="analytics" data-src="https://matomo.example.com/matomo.js" async="async"></script>
<script src="/_nera/consent.js" defer="defer"></script>
```

En cuanto el visitante acepta `analytics`, el runtime los activa en el orden
del documento. En el sitio de prueba, `matomo.example.com/matomo.js` solo se
pidió después de «Accept all».

Puedes escribir la misma forma **a mano**, en una vista o directamente en el
Markdown de una página; el runtime la trata igual:

```html
<script type="text/plain" data-consent="analytics" data-src="https://stats.example.org/counter.js" defer></script>
```

`data-consent` nombra la categoría, `data-src` contiene la URL, y cualquier
otro atributo (`async`, `defer`, `integrity`, …) se copia al script activado.

Fíjate en **`revision: 2`**. Una elección guardada lleva la revisión bajo la
que se hizo; cuando la revisión generada es mayor, el banner vuelve a
aparecer. Añadir un servicio o una categoría a un sitio que ya muestra el
banner no vuelve a preguntar por sí solo a quien ya eligió, así que sube
`revision` cada vez. En el sitio de prueba, una elección guardada con la
revisión 2 hizo volver el banner en cuanto el sitio se generó con
`revision: 3`.

Retirar el consentimiento en el diálogo de ajustes se guarda al momento, pero
surte efecto a partir de la siguiente carga de página: un script que ya se
ejecutó no se puede descargar.

## 5. Listar tus servicios en la página de privacidad

Tu política de privacidad debería nombrar los servicios que usas. El plugin
los deja en `app.consent`, por idioma en `app.consent.locales`, con los
textos ya resueltos. Dale a la página de privacidad su propia vista:

```pug:theme/views/pages/privacy.pug
extends ../layouts/layout

block content
  main#main
    != content
    - const consentLocale = app.consent.locales[meta.lang || app.lang] || app.consent.locales.en
    each category in consentLocale.categories
      h2= category.label
      each service in category.services
        h3= service.name
        p #{service.provider}: #{service.purpose}
        if service.privacyUrl
          p
            a(href=service.privacyUrl rel='noopener') #{consentLocale.texts.service_privacy}
        if service.cookies.length
          table
            thead
              tr
                th(scope='col')= consentLocale.texts.cookie_name
                th(scope='col')= consentLocale.texts.cookie_duration
                th(scope='col')= consentLocale.texts.cookie_purpose
            tbody
              each cookie in service.cookies
                tr
                  td= cookie.name
                  td= cookie.duration
                  td= cookie.purpose
```

y apunta `pages/privacy.md` a ella con `layout: pages/privacy.pug`. La tabla
sale entonces de la misma configuración que el banner y no puede desviarse de
ella:

```html
<h2>External media</h2>
<h3>YouTube</h3>
<p>Google Ireland Limited, Dublin: Shows embedded videos.</p>
<p><a href="https://policies.google.com/privacy" rel="noopener">Privacy policy of the provider</a></p>
<table>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Duration</th>
      <th scope="col">Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>VISITOR_INFO1_LIVE</td>
      <td>6 months</td>
      <td>Estimates the visitor's bandwidth.</td>
    </tr>
  </tbody>
</table>
<h2>Statistics</h2>
…
```

El resto de la política de privacidad, quién eres, qué registra tu
alojamiento, los derechos de los visitantes, sigue siendo cosa tuya.

## 6. Estilo y traducción

Cada color y tamaño del banner, el diálogo y el marcador es una propiedad
personalizada `--nera-consent-*`, así que tu propia hoja de estilos puede
definirlas en cualquier sitio:

```css:theme/assets/css/site.css
:root {
    --nera-consent-font: system-ui, sans-serif;
    --nera-consent-bg: #fffbeb;
    --nera-consent-fg: #1c1917;
    --nera-consent-button-bg: #92400e;
    --nera-consent-button-fg: #ffffff;
    --nera-consent-radius: 0;
}

@media (prefers-color-scheme: dark) {
    :root {
        --nera-consent-bg: #1c1917;
        --nera-consent-fg: #fafaf9;
        --nera-consent-button-bg: #fbbf24;
        --nera-consent-button-fg: #1c1917;
    }
}
```

Enlázala en el layout (`link(rel='stylesheet' href='/css/site.css')`). El
README del plugin tiene la tabla completa de propiedades. Accept all, Reject
all y Settings comparten a propósito un mismo juego de propiedades de botón:
no hay forma de destacar uno de ellos. Los valores por defecto alcanzan un
contraste de al menos 4,5:1; mantenlo cuando los cambies.

Los textos vienen en inglés y alemán. Cada texto se resuelve según el idioma
de la página (`meta.lang || app.lang`), y gana la primera coincidencia:
`texts.<lang>` en `config/consent.yaml`, luego `consent.<key>` en tus
`app.translations`, luego el texto integrado. Para una página en español, por
ejemplo:

```yaml:config/consent.yaml
texts:
    es:
        banner_title: Cookies y contenido externo
        accept_all: Aceptar todo
        reject_all: Rechazar todo
        settings: Ajustes
```

o, junto a tus otras traducciones:

```yaml:config/app.yaml
translations:
  es:
    consent.placeholder_load: Cargar {service}
    consent.banner_text: Este sitio puede cargar contenido y servicios de terceros. Solo se cargan si das tu consentimiento.
```

Una clave que no traduces vuelve al inglés: en la página de prueba en español,
el enlace de privacidad del banner seguía diciendo «Privacy policy». El README
lista todas las claves. El `label` y la `description` de una categoría, y el
`purpose` de un servicio, admiten igual un texto por idioma:

```yaml
    - id: analytics
      label:
          en: Statistics
          es: Estadísticas
```

## 7. Qué informa `nera build --check`

`nera build --check` revisa el `public/` generado en busca, entre otras cosas,
de problemas de privacidad. La salida de abajo es de `@nera-static/validate`
1.6.2, la versión que trae `@nera-static/nera` 1.16.1. Versiones posteriores
pueden informar del marcado bloqueado de otra forma.

**Antes de bloquear**, con el iframe sin más en `pages/video.md`, sin
categorías y con el script de analítica como etiqueta normal en el `head` del
layout:

```pug
script(src='https://matomo.example.com/matomo.js' async)
```

`privacy-third-party` informa de ambos:

```text
public/imprint.html
  :24   warning  loads matomo.example.com — a third-party request that sends the visitor's IP address; self-host the resource, gate the element with `data-consent` (the markup of @nera-static/plugin-consent) so it loads only after the visitor agrees, or name the host in the privacy policy and list the host under `privacy.allowed_hosts` in config/validate.yaml once it is accounted for (Art. 6 DSGVO) (on 4 pages, e.g. public/imprint.html, public/index.html, public/privacy.html, …)  privacy-third-party
public/video.html
  :30   warning  loads a YouTube embed from www.youtube-nocookie.com — a third-party request that sends the visitor's IP address; consider a click-to-load placeholder (Art. 6 DSGVO, § 25 TDDDG), e.g. gate the element with `data-consent` (the markup of @nera-static/plugin-consent), or list the host under `privacy.allowed_hosts` in config/validate.yaml once it is accounted for

0 error(s), 2 warning(s)
```

La pista «gate the element with `data-consent`» aparece cuando el primer uso
de un host en un archivo es un elemento que el plugin puede bloquear: un
script, iframe, embed, object, video o audio. Las imágenes, los `<link>` y el
CSS conservan el mensaje simple. (DSGVO y TDDDG son las leyes alemanas que
cita validate; DSGVO es el nombre alemán del RGPD.)

**Después de bloquear**, con la configuración de los pasos 3 y 4 y la
etiqueta escrita a mano en `pages/stats.md`:

```text
✓ No problems found.
```

Validate no lee como recurso un `<script>` cuyo `type` no es JavaScript, y un
iframe o elemento multimedia con `data-consent` y solo atributos de carga
`data-consent-*` no carga nada, así que el marcado bloqueado no da ningún
hallazgo de `privacy-third-party`.

**Una etiqueta marcada que aun así carga** es lo que informa
`privacy-consent-leak`. Quita `type="text/plain"` de la etiqueta escrita a
mano y deja `src`:

```html:pages/stats.md
<script data-consent="analytics" src="https://stats.example.org/counter.js" defer></script>
```

y la revisión la encuentra dos veces:

```text
public/stats.html
  :33   warning  loads stats.example.org — a third-party request that sends the visitor's IP address; self-host the resource, gate the element with `data-consent` (the markup of @nera-static/plugin-consent) so it loads only after the visitor agrees, or name the host in the privacy policy and list the host under `privacy.allowed_hosts` in config/validate.yaml once it is accounted for (Art. 6 DSGVO)  privacy-third-party
  :33   warning  `<script data-consent="analytics" src="https://stats.example.org/counter.js">` is marked `data-consent` but runs as JavaScript — the browser runs it before the visitor agrees; set `type="text/plain"`, rename `src` to `data-src`, as in the markup of @nera-static/plugin-consent (§ 25 TDDDG)  privacy-consent-leak

0 error(s), 2 warning(s)
```

Ambos son avisos, así que el build sigue funcionando. Para que falle, sube la
regla de nivel en `config/validate.yaml`:

```yaml:config/validate.yaml
rules:
  privacy-consent-leak: error
```

`privacy-consent-leak: off` la desactiva. La revisión solo ve el HTML
generado: no puede saber si tu política de privacidad nombra un servicio, ni
si un servicio necesita consentimiento en primer lugar.

## Valores por defecto, no asesoramiento legal

Los textos y el comportamiento del plugin son **valores por defecto, no
asesoramiento legal**, y nada de esto hace que un sitio cumpla ninguna ley. Lo
que hace el plugin es técnico, y se mantiene diga lo que diga la
configuración:

1. Nada que no sea estrictamente necesario se ejecuta o carga antes del
   consentimiento (§ 25 (1) TDDDG); el banner y el diálogo nombran cada
   servicio, su proveedor y su finalidad, para que el consentimiento pueda ser
   informado y específico (art. 4.11 y art. 7 RGPD).
2. «Reject all» está en la primera capa, tan visible y tan fácil de usar como
   «Accept all».
3. Nada está preseleccionado; «necesario» es implícito y no se puede
   configurar.
4. Nada bloqueado se ejecuta o carga antes del consentimiento.
5. El consentimiento se puede retirar en cualquier momento mediante el enlace
   a los ajustes, sin volver a generar el sitio.
6. Subir `revision` vuelve a preguntar a todos los visitantes.
7. Guardar la elección del visitante (en `localStorage`, bajo
   `nera-consent`) es estrictamente necesario y no requiere consentimiento
   (§ 25 (2) n.º 2 TDDDG).

Si tu sitio necesita consentimiento, qué servicios indicas y qué dicen tu
banner y tu política de privacidad lo decides tú. Revísalo tú mismo o con
alguien cualificado para asesorarte. El
[README](https://github.com/seebaermichi/nera-plugin-consent#readme) y la
[página de npm](https://www.npmjs.com/package/@nera-static/plugin-consent) del
plugin tienen la referencia completa de configuración, el contrato de marcado
y las limitaciones conocidas.

## Siguiente

[Cómo está construido este sitio web](/es/tutorials/how-this-site-is-built.html)
muestra los plugins de este sitio trabajando juntos. nera.js.org no carga
nada de otro host, así que no muestra ningún banner.
