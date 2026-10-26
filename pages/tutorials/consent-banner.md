---
layout: pages/tutorial.pug
title: Add a consent banner — or none — with plugin-consent
slug: consent-banner
lang: en
description: Find out whether your site needs a consent banner at all, then gate a YouTube embed and an analytics script with plugin-consent so nothing loads before the visitor agrees.
keywords: nera consent, plugin-consent, cookie banner, consent banner, two-click embed, youtube embed, analytics consent, nera build --check, TDDDG, DSGVO
tags: plugins, privacy
pagination_order: 10
createdAt: 2026-10-25
verified_on: 2026-10-26
verified_with:
    plugin-consent: 1.0.3
    validate: 1.7.0
    nera: 1.19.0
---
A consent banner asks visitors to agree before something on the site that
needs their consent runs: an analytics script, a YouTube video, a map. A site
that loads none of that has nothing to ask. `@nera-static/plugin-consent`
covers both cases: it shows a short info notice (or nothing) on a site without
such services, and a banner with a settings dialog on a site with them, and it
keeps every configured script and embed inert until the visitor agrees.

Every command, config and output below was run in a fresh `nera new` site with
plugin-consent 1.0.2 and `@nera-static/validate` 1.6.2.

## 1. Do you need a banner at all?

Start with what your site loads from other hosts. Every font, video, map or
script from a third-party server sends the visitor's IP address there, and
much of it sets cookies. The first option is not a banner but **not loading it
from elsewhere**:

- serve fonts from your own site (this site's IBM Plex lives in
  `theme/assets/fonts/`),
- serve a video file from your own host with `<video>`, or link to the video
  instead of embedding it,
- run the statistics tool yourself, or do without one.

Self-hosting removes the third-party request. It does not by itself settle
whether a tool that stores something on the visitor's device needs consent;
that depends on what it stores and why. The background, in more depth:
[Do I need a cookie banner?](https://michael-becker-berlin.de/en/blog/2026/10/do-i-need-a-cookie-banner.html)

If nothing is left that needs consent, you need no banner. You can still
install the plugin: without a `config/consent.yaml`, or with one that lists no
categories, it is in **notice mode** and renders a short notice:

```html
<section class="nera-consent nera-consent--notice" data-consent-notice="data-consent-notice" data-consent-revision="1" aria-labelledby="nera-consent-notice-text" hidden="hidden">
  <p class="nera-consent__text" id="nera-consent-notice-text">This site uses only technically necessary cookies. <a class="nera-consent__link" href="/privacy.html">Privacy policy</a></p>
  <div class="nera-consent__actions"><button class="nera-consent__button" type="button" data-consent-dismiss="data-consent-dismiss">Got it</button></div>
</section>
```

The runtime shows it until the visitor clicks "Got it". If you do not want
even that, set `notice: false`:

```yaml:config/consent.yaml
privacy_url: /privacy.html
notice: false
```

`app.consent.mode` is then `'none'`, and the views render nothing at all. Once
you add a category, `notice: false` no longer applies, and the build says so:

```text
⚠️ plugin-consent: config/consent.yaml: ignoring notice: false, the site has categories and shows the banner
```

## 2. Install and wire the layout

```bash
npm install @nera-static/plugin-consent
npx nera-consent-config
npx nera-consent
```

`npx nera-consent-config` copies the documented `config/consent.yaml`, every
example commented out, so the site starts in notice mode. `npx nera-consent`
copies the five views (`banner`, `settings`, `notice`, `head`, `embed`). On a
site scaffolded with `nera new`, they land in
`theme/views/vendor/plugin-consent/`. Both commands skip a file or folder that
already exists; `--force` overwrites it, and your edits with it.

Plugins cannot touch your layout, so this is the one manual step. Add the
stylesheet, the `head` view and the runtime inside `<head>`, a settings link
in the footer, and the three other views at the end of `<body>`:

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

(The scaffold's other `meta` tags and its `style` block stay as they are; they
are left out here.)

- `consent.css` and `consent.js` are copied to `public/_nera/` on every build,
  in every mode. The runtime needs `defer`.
- `banner`, `settings` and `notice` each render only in their own mode, so
  include all three.
- Any element with `data-consent-open` opens the settings dialog, where the
  visitor can change or withdraw a choice at any time. On a link, the `href` is
  the fallback for a page without the dialog or without JavaScript.

The plugin needs `@nera-static/core` 4.13.0 or later, which every current
`@nera-static/nera` brings.

## 3. Gate a YouTube embed

Paste the embed code into a page as usual:

```markdown:pages/video.md
---
layout: pages/default.pug
title: Our video
description: A page with an embedded video
---
# Our video

<iframe src="https://www.youtube-nocookie.com/embed/abc123" title="Our video" width="560" height="315" allowfullscreen></iframe>
```

Then describe the service in `config/consent.yaml`, in one category:

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

- `id: media` is one of four ids with a built-in label and description in
  English and German (`analytics`, `media`, `marketing`, `functional`); any
  other id needs a `label`.
- `name`, `provider` and `purpose` are required; a service without them is
  dropped with a warning.
- `hosts` are bare host names. An `<iframe>` whose `src` host equals one of them
  or is a subdomain of it is gated: `www.youtube-nocookie.com` matches
  `youtube-nocookie.com`.
- `cookies` are listed in the settings dialog. The entry above is an example:
  list what the provider documents.

With a category configured, the site is in banner mode. After `nera build`,
the iframe in `public/video.html` has no `src` left; its URL moved to
`data-consent-src`, and a placeholder follows it:

```html
<div class="nera-consent-embed" data-consent-embed data-consent="media"><iframe data-consent="media" data-consent-src="https://www.youtube-nocookie.com/embed/abc123" title="Our video" width="560" height="315" allowfullscreen hidden></iframe>
  <div class="nera-consent-embed__placeholder">
    <p class="nera-consent-embed__text">This content is provided by YouTube. Loading it connects to <strong>Google Ireland Limited, Dublin</strong>.</p><button class="nera-consent-embed__load" type="button" data-consent-load>Load YouTube</button><a class="nera-consent-embed__privacy" href="https://policies.google.com/privacy" rel="noopener">Privacy policy of the provider</a><button class="nera-consent-embed__settings" type="button" data-consent-open>Privacy settings</button>
  </div>
</div>
```

In a browser, the test page made no request to another host until a click.
"Load YouTube" loaded this one embed and stored nothing; "Accept all" in the
banner stored the choice and loaded every gated element. The banner itself
puts Accept all, Reject all and Settings on the first layer, in that fixed
order and one shared style:

```html
<section class="nera-consent" data-consent-banner="data-consent-banner" data-consent-revision="1" data-consent-categories="media" aria-labelledby="nera-consent-title" hidden="hidden">
  <h2 class="nera-consent__title" id="nera-consent-title">Cookies and external content</h2>
  <p class="nera-consent__text">This site can load content and services from third parties. They only load if you agree. You can change your choice at any time in the settings. <a class="nera-consent__link" href="/privacy.html">Privacy policy</a></p>
  <div class="nera-consent__actions"><button class="nera-consent__button" type="button" data-consent-accept-all="data-consent-accept-all">Accept all</button><button class="nera-consent__button" type="button" data-consent-reject-all="data-consent-reject-all">Reject all</button><button class="nera-consent__button" type="button" data-consent-open="data-consent-open">Settings</button></div>
</section>
```

`<embed>`, `<object>`, `<video>` and `<audio>` from a configured host are
gated the same way. Two places the build does not reach:

- An iframe written directly into a **Pug view** is not rewritten. Use the
  mixin from the published `embed` view there; it renders the same
  placeholder:

  ```pug
  include /vendor/plugin-consent/embed

  +consent-embed({
    category: 'media',
    service: 'YouTube',
    src: 'https://www.youtube-nocookie.com/embed/abc123',
    attributes: { title: 'Our video', width: 560, height: 315, allowfullscreen: true },
  })
  ```

  `category` and `service` must name a configured service, or the build fails
  rather than render a live iframe.
- A gated `<video>`, `<audio>` or `<embed>` written inline in a Markdown
  paragraph ends up inside a `<p>`, which the browser splits around the
  placeholder. Put its opening tag alone on a line, after a blank line.

## 4. Gate an analytics script

A script you configure under a service's `scripts` is emitted by the `head`
view, inert. Add a second category:

```yaml:config/consent.yaml
revision: 2
privacy_url: /privacy.html

categories:
    - id: media
      # … YouTube as above
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

Each script entry has exactly one of `src` and `inline`. In the built `<head>`,
both are `type="text/plain"`, which the browser does not run, and the URL sits
in `data-src`:

```html
<link rel="stylesheet" href="/_nera/consent.css" />
<script type="text/plain" data-consent="analytics">var _paq = window._paq = window._paq || [];
_paq.push(['trackPageView']);
</script>
<script type="text/plain" data-consent="analytics" data-src="https://matomo.example.com/matomo.js" async="async"></script>
<script src="/_nera/consent.js" defer="defer"></script>
```

Once the visitor grants `analytics`, the runtime activates them in document
order. In the test site, `matomo.example.com/matomo.js` was requested only
after "Accept all".

You can write the same form **by hand**, in a view or right in a page's
Markdown; the runtime treats it alike:

```html
<script type="text/plain" data-consent="analytics" data-src="https://stats.example.org/counter.js" defer></script>
```

`data-consent` names the category, `data-src` holds the URL, and every other
attribute (`async`, `defer`, `integrity`, …) is copied to the activated script.

Note **`revision: 2`**. A visitor's stored choice carries the revision it was
made under; when the built revision is higher, the banner shows again. Adding
a service or a category to a site that already shows the banner does not ask
returning visitors again by itself, so bump `revision` whenever you do. In the
test site, a choice stored under revision 2 brought the banner back as soon as
the site was rebuilt with `revision: 3`.

Withdrawal in the settings dialog is stored at once but takes effect from the
next page load: a script that already ran cannot be unloaded.

## 5. List your services on the privacy page

Your privacy page should name the services you use. The plugin puts them into
`app.consent`, per language under `app.consent.locales`, with the texts already
resolved. Give the privacy page its own view:

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

and point `pages/privacy.md` at it with `layout: pages/privacy.pug`. The table
then comes from the same config as the banner and cannot drift from it:

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

The rest of the privacy policy, who you are, what your host logs, the
visitor's rights, is still yours to write.

## 6. Theme and translate

Every color and size of banner, dialog and placeholder is a `--nera-consent-*`
custom property, so your own stylesheet can set them anywhere:

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

Link it in the layout (`link(rel='stylesheet' href='/css/site.css')`). The
plugin's README has the full table of properties. Accept all, Reject all and
Settings share one set of button properties on purpose: there is no way to
make one of them stand out. The defaults reach a contrast of at least 4.5:1;
keep that when you change them.

The texts come in English and German. Every text resolves per page language
(`meta.lang || app.lang`), first hit wins: `texts.<lang>` in
`config/consent.yaml`, then `consent.<key>` in your `app.translations`, then
the built-in text. A Spanish page, for example:

```yaml:config/consent.yaml
texts:
    es:
        banner_title: Cookies y contenido externo
        accept_all: Aceptar todo
        reject_all: Rechazar todo
        settings: Ajustes
```

or, next to your other translations:

```yaml:config/app.yaml
translations:
  es:
    consent.placeholder_load: Cargar {service}
    consent.banner_text: Este sitio puede cargar contenido y servicios de terceros. Solo se cargan si das tu consentimiento.
```

A key you do not translate falls back to English: on the Spanish test page,
the banner's privacy link still read "Privacy policy". The README lists every
key. A category's `label` and `description`, and a service's `purpose`, take
one text per language the same way:

```yaml
    - id: analytics
      label:
          en: Statistics
          es: Estadísticas
```

## 7. What `nera build --check` reports

`nera build --check` checks the built `public/` for privacy problems, among
others. The output below is from `@nera-static/validate` 1.6.2, the version
`@nera-static/nera` 1.17.0 brings. Later releases may report gated markup
differently.

**Before gating**, with the plain iframe in `pages/video.md`, no categories,
and the analytics script as a plain tag in the layout's `head`:

```pug
script(src='https://matomo.example.com/matomo.js' async)
```

`privacy-third-party` reports both:

```text
public/imprint.html
  :24   warning  loads matomo.example.com — a third-party request that sends the visitor's IP address; self-host the resource, gate the element with `data-consent` (the markup of @nera-static/plugin-consent) so it loads only after the visitor agrees, or name the host in the privacy policy and list the host under `privacy.allowed_hosts` in config/validate.yaml once it is accounted for (Art. 6 DSGVO) (on 4 pages, e.g. public/imprint.html, public/index.html, public/privacy.html, …)  privacy-third-party
public/video.html
  :30   warning  loads a YouTube embed from www.youtube-nocookie.com — a third-party request that sends the visitor's IP address; consider a click-to-load placeholder (Art. 6 DSGVO, § 25 TDDDG), e.g. gate the element with `data-consent` (the markup of @nera-static/plugin-consent), or list the host under `privacy.allowed_hosts` in config/validate.yaml once it is accounted for

0 error(s), 2 warning(s)
```

The hint "gate the element with `data-consent`" appears when a host's first
use in a file is an element the plugin can gate: a script, iframe, embed,
object, video or audio. Images, `<link>`s and CSS keep the plain message.

**After gating**, with the config from steps 3 and 4 and the hand-written tag
in `pages/stats.md`:

```text
✓ No problems found.
```

Validate does not read a `<script>` whose `type` is not JavaScript as a
resource, and an iframe or media element with `data-consent` and only
`data-consent-*` loading attributes loads nothing, so the gated markup gives
no `privacy-third-party` finding.

**A tag that is marked but still loads** is what `privacy-consent-leak`
reports. Leave out `type="text/plain"` and keep `src` in the hand-written tag:

```html:pages/stats.md
<script data-consent="analytics" src="https://stats.example.org/counter.js" defer></script>
```

and the check finds it twice:

```text
public/stats.html
  :33   warning  loads stats.example.org — a third-party request that sends the visitor's IP address; self-host the resource, gate the element with `data-consent` (the markup of @nera-static/plugin-consent) so it loads only after the visitor agrees, or name the host in the privacy policy and list the host under `privacy.allowed_hosts` in config/validate.yaml once it is accounted for (Art. 6 DSGVO)  privacy-third-party
  :33   warning  `<script data-consent="analytics" src="https://stats.example.org/counter.js">` is marked `data-consent` but runs as JavaScript — the browser runs it before the visitor agrees; set `type="text/plain"`, rename `src` to `data-src`, as in the markup of @nera-static/plugin-consent (§ 25 TDDDG)  privacy-consent-leak

0 error(s), 2 warning(s)
```

Both are warnings, so the build still succeeds. To fail it, promote the rule
in `config/validate.yaml`:

```yaml:config/validate.yaml
rules:
  privacy-consent-leak: error
```

`privacy-consent-leak: off` switches it off. The check sees only the built
HTML: it cannot tell whether your privacy policy names a service, or whether a
service needs consent in the first place.

## Defaults, not legal advice

The plugin's texts and behaviour are **defaults, not legal advice**, and
nothing here makes a site compliant with any law. What the plugin does is
technical, and it holds whatever the config says:

1. The banner and dialog name each configured service, its provider and
   purpose, so the consent can be informed and specific (Art. 4 Nr. 11,
   Art. 7 DSGVO).
2. "Reject all" is on the first layer, as visible and as easy to use as
   "Accept all".
3. Nothing is pre-selected; "necessary" is implicit and cannot be configured.
4. Nothing gated runs or loads before consent (§ 25 (1) TDDDG).
5. Consent can be withdrawn at any time through the settings link, without a
   rebuild.
6. A `revision` bump asks every visitor again.
7. Storing the visitor's choice (in `localStorage`, under `nera-consent`) is
   strictly necessary and needs no consent (§ 25 (2) Nr. 2 TDDDG).

Whether your site needs consent, which services you list and what your banner
and privacy policy say are your decisions. Check them yourself, or with
someone qualified to advise you. The plugin's
[README](https://github.com/seebaermichi/nera-plugin-consent#readme) and
[npm page](https://www.npmjs.com/package/@nera-static/plugin-consent) have the
full config reference, the markup contract and the known limitations.

## Next

[How this website is built](/tutorials/how-this-site-is-built.html) shows the
plugins of this site working together. nera.js.org itself loads nothing from
another host, so it shows no banner.
