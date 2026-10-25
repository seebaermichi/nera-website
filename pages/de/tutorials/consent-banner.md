---
layout: pages/tutorial.pug
title: Einen Consent-Banner einbauen — oder keinen — mit plugin-consent
slug: consent-banner
lang: de
description: Finde heraus, ob deine Website überhaupt einen Consent-Banner braucht, und lade ein YouTube-Video und ein Analyse-Skript mit plugin-consent erst nach der Einwilligung.
keywords: nera Einwilligung, plugin-consent, Cookie-Banner, Consent-Banner, Zwei-Klick-Lösung, YouTube einbetten, Analyse Einwilligung, nera build --check, TDDDG, DSGVO
tags: plugins, privacy
pagination_order: 10
createdAt: 2026-10-25
---
Ein Consent-Banner bittet Besucherinnen und Besucher um ihre Einwilligung,
bevor etwas auf der Website läuft, das sie braucht: ein Analyse-Skript, ein
YouTube-Video, eine Karte. Eine Website, die nichts davon lädt, hat nichts zu
fragen. `@nera-static/plugin-consent` deckt beide Fälle ab: Auf einer Website
ohne solche Dienste zeigt es einen kurzen Hinweis (oder gar nichts), auf einer
Website mit ihnen einen Banner mit Einstellungsdialog, und es hält jedes
konfigurierte Skript und jede Einbettung inaktiv, bis die Einwilligung da ist.

Jeder Befehl, jede Konfiguration und jede Ausgabe unten stammt aus einer
frischen `nera new`-Website mit plugin-consent 1.0.2 und
`@nera-static/validate` 1.6.2.

## 1. Brauchst du überhaupt einen Banner?

Fang damit an, was deine Website von anderen Hosts lädt. Jede Schrift, jedes
Video, jede Karte und jedes Skript von einem fremden Server schickt die
IP-Adresse der Besucher dorthin, und vieles davon setzt Cookies. Die erste
Option ist kein Banner, sondern **es nicht von anderswo zu laden**:

- Schriften von der eigenen Website ausliefern (das IBM Plex dieser Website
  liegt in `theme/assets/fonts/`),
- eine Videodatei mit `<video>` vom eigenen Host ausliefern, oder auf das
  Video verlinken, statt es einzubetten,
- das Statistik-Werkzeug selbst betreiben, oder ohne auskommen.

Selbst hosten entfernt die Anfrage an Dritte. Ob ein Werkzeug, das etwas auf
dem Gerät der Besucher speichert, eine Einwilligung braucht, ist damit allein
noch nicht entschieden; das hängt davon ab, was es speichert und wozu. Der
Hintergrund, ausführlicher:
[Brauche ich einen Cookie-Banner?](https://michael-becker-berlin.de/de/blog/2026/10/brauche-ich-einen-cookie-banner.html)

Bleibt nichts übrig, das eine Einwilligung braucht, brauchst du keinen Banner.
Das Plugin kannst du trotzdem installieren: Ohne `config/consent.yaml`, oder
mit einer, die keine Kategorien nennt, ist es im **Hinweis-Modus** und rendert
einen kurzen Hinweis:

```html
<section class="nera-consent nera-consent--notice" data-consent-notice="data-consent-notice" data-consent-revision="1" aria-labelledby="nera-consent-notice-text" hidden="hidden">
  <p class="nera-consent__text" id="nera-consent-notice-text">This site uses only technically necessary cookies. <a class="nera-consent__link" href="/privacy.html">Privacy policy</a></p>
  <div class="nera-consent__actions"><button class="nera-consent__button" type="button" data-consent-dismiss="data-consent-dismiss">Got it</button></div>
</section>
```

Die Laufzeit zeigt ihn, bis jemand auf „Got it“ klickt. Auf einer Seite mit
`lang: de` stehen dort die eingebauten deutschen Texte: „Diese Website
verwendet nur technisch notwendige Cookies.“ und „Verstanden“. Willst du nicht
einmal das, setze `notice: false`:

```yaml:config/consent.yaml
privacy_url: /privacy.html
notice: false
```

`app.consent.mode` ist dann `'none'`, und die Views rendern gar nichts. Sobald
du eine Kategorie hinzufügst, gilt `notice: false` nicht mehr, und der Build
sagt das:

```text
⚠️ plugin-consent: config/consent.yaml: ignoring notice: false, the site has categories and shows the banner
```

## 2. Installieren und das Layout verdrahten

```bash
npm install @nera-static/plugin-consent
npx nera-consent-config
npx nera-consent
```

`npx nera-consent-config` kopiert die dokumentierte `config/consent.yaml`,
jedes Beispiel auskommentiert, sodass die Website im Hinweis-Modus startet.
`npx nera-consent` kopiert die fünf Views (`banner`, `settings`, `notice`,
`head`, `embed`). Auf einer mit `nera new` erzeugten Website landen sie in
`theme/views/vendor/plugin-consent/`. Beide Befehle überspringen eine Datei
oder einen Ordner, die schon existieren; `--force` überschreibt sie, und
damit deine Änderungen.

Plugins können dein Layout nicht anfassen, also ist das der eine Handgriff.
Setze das Stylesheet, die `head`-View und die Laufzeit in `<head>`, einen Link
zu den Einstellungen in den Footer und die drei anderen Views ans Ende von
`<body>`:

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

(Die übrigen `meta`-Tags und der `style`-Block des Gerüsts bleiben, wie sie
sind; hier sind sie weggelassen.)

- `consent.css` und `consent.js` werden bei jedem Build nach `public/_nera/`
  kopiert, in jedem Modus. Die Laufzeit braucht `defer`.
- `banner`, `settings` und `notice` rendern jeweils nur in ihrem eigenen
  Modus, also binde alle drei ein.
- Jedes Element mit `data-consent-open` öffnet den Einstellungsdialog, in dem
  Besucher ihre Wahl jederzeit ändern oder widerrufen können. Bei einem Link
  ist das `href` der Rückfall für eine Seite ohne Dialog oder ohne JavaScript.

Das Plugin braucht `@nera-static/core` 4.13.0 oder neuer, das jedes aktuelle
`@nera-static/nera` mitbringt.

## 3. Ein YouTube-Video erst nach Einwilligung laden

Füge den Einbettungscode wie gewohnt in eine Seite ein:

```markdown:pages/video.md
---
layout: pages/default.pug
title: Our video
description: A page with an embedded video
---
# Our video

<iframe src="https://www.youtube-nocookie.com/embed/abc123" title="Our video" width="560" height="315" allowfullscreen></iframe>
```

Dann beschreibe den Dienst in `config/consent.yaml`, in einer Kategorie:

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

- `id: media` ist eine von vier IDs mit eingebautem Label und Beschreibung
  auf Deutsch und Englisch (`analytics`, `media`, `marketing`, `functional`);
  jede andere ID braucht ein `label`.
- `name`, `provider` und `purpose` sind Pflicht; ein Dienst ohne sie wird mit
  einer Warnung verworfen.
- `hosts` sind bloße Hostnamen. Ein `<iframe>`, dessen `src`-Host einem davon
  gleicht oder eine Subdomain davon ist, wird gesperrt:
  `www.youtube-nocookie.com` passt zu `youtube-nocookie.com`.
- `cookies` stehen im Einstellungsdialog. Der Eintrag oben ist ein Beispiel:
  Trag ein, was der Anbieter dokumentiert.

Mit einer konfigurierten Kategorie ist die Website im Banner-Modus. Nach
`nera build` hat das iframe in `public/video.html` kein `src` mehr; seine URL
ist nach `data-consent-src` gewandert, und ein Platzhalter folgt ihm:

```html
<div class="nera-consent-embed" data-consent-embed data-consent="media"><iframe data-consent="media" data-consent-src="https://www.youtube-nocookie.com/embed/abc123" title="Our video" width="560" height="315" allowfullscreen hidden></iframe>
  <div class="nera-consent-embed__placeholder">
    <p class="nera-consent-embed__text">This content is provided by YouTube. Loading it connects to <strong>Google Ireland Limited, Dublin</strong>.</p><button class="nera-consent-embed__load" type="button" data-consent-load>Load YouTube</button><a class="nera-consent-embed__privacy" href="https://policies.google.com/privacy" rel="noopener">Privacy policy of the provider</a><button class="nera-consent-embed__settings" type="button" data-consent-open>Privacy settings</button>
  </div>
</div>
```

Im Browser stellte die Testseite bis zu einem Klick keine Anfrage an einen
anderen Host. „Load YouTube“ lud diese eine Einbettung und speicherte nichts;
„Accept all“ im Banner speicherte die Wahl und lud jedes gesperrte Element.
Der Banner selbst setzt Accept all, Reject all und Settings auf die erste
Ebene, in fester Reihenfolge und einem gemeinsamen Stil:

```html
<section class="nera-consent" data-consent-banner="data-consent-banner" data-consent-revision="1" data-consent-categories="media" aria-labelledby="nera-consent-title" hidden="hidden">
  <h2 class="nera-consent__title" id="nera-consent-title">Cookies and external content</h2>
  <p class="nera-consent__text">This site can load content and services from third parties. They only load if you agree. You can change your choice at any time in the settings. <a class="nera-consent__link" href="/privacy.html">Privacy policy</a></p>
  <div class="nera-consent__actions"><button class="nera-consent__button" type="button" data-consent-accept-all="data-consent-accept-all">Accept all</button><button class="nera-consent__button" type="button" data-consent-reject-all="data-consent-reject-all">Reject all</button><button class="nera-consent__button" type="button" data-consent-open="data-consent-open">Settings</button></div>
</section>
```

`<embed>`, `<object>`, `<video>` und `<audio>` von einem konfigurierten Host
werden genauso gesperrt. Zwei Stellen erreicht der Build nicht:

- Ein iframe, das direkt in einer **Pug-View** steht, wird nicht
  umgeschrieben. Nimm dort das Mixin aus der veröffentlichten `embed`-View; es
  rendert denselben Platzhalter:

  ```pug
  include /vendor/plugin-consent/embed

  +consent-embed({
    category: 'media',
    service: 'YouTube',
    src: 'https://www.youtube-nocookie.com/embed/abc123',
    attributes: { title: 'Our video', width: 560, height: 315, allowfullscreen: true },
  })
  ```

  `category` und `service` müssen einen konfigurierten Dienst nennen, sonst
  bricht der Build ab, statt ein aktives iframe zu rendern.
- Ein gesperrtes `<video>`, `<audio>` oder `<embed>`, das inline in einem
  Markdown-Absatz steht, landet in einem `<p>`, das der Browser um den
  Platzhalter herum aufteilt. Stell sein öffnendes Tag allein in eine Zeile,
  nach einer Leerzeile.

## 4. Ein Analyse-Skript erst nach Einwilligung laden

Ein Skript, das du unter `scripts` eines Dienstes konfigurierst, gibt die
`head`-View inaktiv aus. Füge eine zweite Kategorie hinzu:

```yaml:config/consent.yaml
revision: 2
privacy_url: /privacy.html

categories:
    - id: media
      # … YouTube wie oben
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

Jeder Skript-Eintrag hat genau eins von `src` und `inline`. Im gebauten
`<head>` sind beide `type="text/plain"`, was der Browser nicht ausführt, und
die URL steht in `data-src`:

```html
<link rel="stylesheet" href="/_nera/consent.css" />
<script type="text/plain" data-consent="analytics">var _paq = window._paq = window._paq || [];
_paq.push(['trackPageView']);
</script>
<script type="text/plain" data-consent="analytics" data-src="https://matomo.example.com/matomo.js" async="async"></script>
<script src="/_nera/consent.js" defer="defer"></script>
```

Sobald jemand `analytics` zustimmt, aktiviert die Laufzeit sie in der
Reihenfolge des Dokuments. In der Testseite wurde
`matomo.example.com/matomo.js` erst nach „Accept all“ angefragt.

Dieselbe Form kannst du **von Hand** schreiben, in einer View oder direkt im
Markdown einer Seite; die Laufzeit behandelt sie gleich:

```html
<script type="text/plain" data-consent="analytics" data-src="https://stats.example.org/counter.js" defer></script>
```

`data-consent` nennt die Kategorie, `data-src` enthält die URL, und jedes
andere Attribut (`async`, `defer`, `integrity`, …) wird auf das aktivierte
Skript übertragen.

Beachte **`revision: 2`**. Eine gespeicherte Wahl trägt die Revision, unter
der sie getroffen wurde; ist die gebaute Revision höher, erscheint der Banner
erneut. Einen Dienst oder eine Kategorie zu einer Website hinzuzufügen, die
den Banner schon zeigt, fragt wiederkehrende Besucher nicht von selbst neu,
also erhöhe `revision` jedes Mal. In der Testseite brachte eine unter
Revision 2 gespeicherte Wahl den Banner zurück, sobald die Website mit
`revision: 3` neu gebaut war.

Ein Widerruf im Einstellungsdialog wird sofort gespeichert, wirkt aber erst
ab dem nächsten Seitenaufruf: Ein Skript, das schon lief, lässt sich nicht
entladen.

## 5. Deine Dienste auf der Datenschutzseite auflisten

Deine Datenschutzerklärung sollte die Dienste nennen, die du nutzt. Das Plugin
legt sie in `app.consent` ab, je Sprache unter `app.consent.locales`, mit
bereits aufgelösten Texten. Gib der Datenschutzseite eine eigene View:

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

und verweise `pages/privacy.md` mit `layout: pages/privacy.pug` darauf. Die
Tabelle kommt dann aus derselben Konfiguration wie der Banner und kann nicht
von ihm abweichen:

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

Den Rest der Datenschutzerklärung, wer du bist, was dein Hoster
protokolliert, die Rechte der Besucher, schreibst du weiterhin selbst.

## 6. Gestalten und übersetzen

Jede Farbe und Größe von Banner, Dialog und Platzhalter ist eine
`--nera-consent-*`-Custom-Property, dein eigenes Stylesheet kann sie also
überall setzen:

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

Binde es im Layout ein (`link(rel='stylesheet' href='/css/site.css')`). Die
README des Plugins hat die ganze Tabelle der Properties. Accept all, Reject
all und Settings teilen sich mit Absicht einen Satz Button-Properties: Es gibt
keinen Weg, einen davon hervorzuheben. Die Voreinstellungen erreichen einen
Kontrast von mindestens 4,5:1; halte das, wenn du sie änderst.

Die Texte gibt es auf Englisch und Deutsch. Jeder Text wird je Seitensprache
(`meta.lang || app.lang`) aufgelöst, der erste Treffer gewinnt:
`texts.<lang>` in `config/consent.yaml`, dann `consent.<key>` in deinen
`app.translations`, dann der eingebaute Text. Eine spanische Seite zum
Beispiel:

```yaml:config/consent.yaml
texts:
    es:
        banner_title: Cookies y contenido externo
        accept_all: Aceptar todo
        reject_all: Rechazar todo
        settings: Ajustes
```

oder, neben deinen anderen Übersetzungen:

```yaml:config/app.yaml
translations:
  es:
    consent.placeholder_load: Cargar {service}
    consent.banner_text: Este sitio puede cargar contenido y servicios de terceros. Solo se cargan si das tu consentimiento.
```

Ein Schlüssel, den du nicht übersetzt, fällt auf Englisch zurück: Auf der
spanischen Testseite hieß der Datenschutz-Link im Banner weiter „Privacy
policy“. Die README listet jeden Schlüssel. `label` und `description` einer
Kategorie und `purpose` eines Dienstes nehmen auf dieselbe Weise einen Text je
Sprache:

```yaml
    - id: analytics
      label:
          en: Statistics
          es: Estadísticas
```

## 7. Was `nera build --check` meldet

`nera build --check` prüft das gebaute `public/` unter anderem auf
Datenschutzprobleme. Die Ausgabe unten stammt von `@nera-static/validate`
1.6.2, der Version, die `@nera-static/nera` 1.17.0 mitbringt. Spätere
Versionen können gesperrtes Markup anders melden.

**Vor dem Sperren**, mit dem einfachen iframe in `pages/video.md`, ohne
Kategorien und mit dem Analyse-Skript als einfachem Tag im `head` des Layouts:

```pug
script(src='https://matomo.example.com/matomo.js' async)
```

meldet `privacy-third-party` beides:

```text
public/imprint.html
  :24   warning  loads matomo.example.com — a third-party request that sends the visitor's IP address; self-host the resource, gate the element with `data-consent` (the markup of @nera-static/plugin-consent) so it loads only after the visitor agrees, or name the host in the privacy policy and list the host under `privacy.allowed_hosts` in config/validate.yaml once it is accounted for (Art. 6 DSGVO) (on 4 pages, e.g. public/imprint.html, public/index.html, public/privacy.html, …)  privacy-third-party
public/video.html
  :30   warning  loads a YouTube embed from www.youtube-nocookie.com — a third-party request that sends the visitor's IP address; consider a click-to-load placeholder (Art. 6 DSGVO, § 25 TDDDG), e.g. gate the element with `data-consent` (the markup of @nera-static/plugin-consent), or list the host under `privacy.allowed_hosts` in config/validate.yaml once it is accounted for

0 error(s), 2 warning(s)
```

Der Hinweis „gate the element with `data-consent`“ erscheint, wenn die erste
Verwendung eines Hosts in einer Datei ein Element ist, das das Plugin sperren
kann: ein Skript, iframe, embed, object, video oder audio. Bilder, `<link>`s
und CSS behalten die einfache Meldung.

**Nach dem Sperren**, mit der Konfiguration aus Schritt 3 und 4 und dem von
Hand geschriebenen Tag in `pages/stats.md`:

```text
✓ No problems found.
```

Validate liest ein `<script>`, dessen `type` kein JavaScript ist, nicht als
Ressource, und ein iframe oder Medienelement mit `data-consent` und nur
`data-consent-*`-Ladeattributen lädt nichts. Das gesperrte Markup ergibt also
keinen `privacy-third-party`-Befund.

**Ein Tag, das markiert ist, aber trotzdem lädt**, meldet
`privacy-consent-leak`. Lass im von Hand geschriebenen Tag
`type="text/plain"` weg und behalte `src`:

```html:pages/stats.md
<script data-consent="analytics" src="https://stats.example.org/counter.js" defer></script>
```

und die Prüfung findet es zweimal:

```text
public/stats.html
  :33   warning  loads stats.example.org — a third-party request that sends the visitor's IP address; self-host the resource, gate the element with `data-consent` (the markup of @nera-static/plugin-consent) so it loads only after the visitor agrees, or name the host in the privacy policy and list the host under `privacy.allowed_hosts` in config/validate.yaml once it is accounted for (Art. 6 DSGVO)  privacy-third-party
  :33   warning  `<script data-consent="analytics" src="https://stats.example.org/counter.js">` is marked `data-consent` but runs as JavaScript — the browser runs it before the visitor agrees; set `type="text/plain"`, rename `src` to `data-src`, as in the markup of @nera-static/plugin-consent (§ 25 TDDDG)  privacy-consent-leak

0 error(s), 2 warning(s)
```

Beides sind Warnungen, der Build gelingt also trotzdem. Soll er scheitern,
stufe die Regel in `config/validate.yaml` hoch:

```yaml:config/validate.yaml
rules:
  privacy-consent-leak: error
```

`privacy-consent-leak: off` schaltet sie ab. Die Prüfung sieht nur das
gebaute HTML: Sie kann nicht beurteilen, ob deine Datenschutzerklärung einen
Dienst nennt oder ob ein Dienst überhaupt eine Einwilligung braucht.

## Voreinstellungen, keine Rechtsberatung

Die Texte und das Verhalten des Plugins sind **Voreinstellungen, keine
Rechtsberatung**, und nichts hier macht eine Website mit irgendeinem Gesetz
konform. Was das Plugin tut, ist technisch, und es gilt unabhängig davon, was
in der Konfiguration steht:

1. Banner und Dialog nennen jeden konfigurierten Dienst, seinen Anbieter und
   Zweck, damit die Einwilligung informiert und für den bestimmten Fall
   erteilt werden kann (Art. 4 Nr. 11, Art. 7 DSGVO).
2. „Reject all“ steht auf der ersten Ebene, so sichtbar und so leicht zu
   bedienen wie „Accept all“.
3. Nichts ist vorausgewählt; „notwendig“ ist implizit und nicht
   konfigurierbar.
4. Nichts Gesperrtes läuft oder lädt vor der Einwilligung (§ 25 Abs. 1 TDDDG).
5. Die Einwilligung lässt sich jederzeit über den Link zu den Einstellungen
   widerrufen, ohne neuen Build.
6. Eine erhöhte `revision` fragt alle Besucher erneut.
7. Die Wahl der Besucher zu speichern (in `localStorage`, unter
   `nera-consent`) ist unbedingt erforderlich und braucht keine Einwilligung
   (§ 25 Abs. 2 Nr. 2 TDDDG).

Ob deine Website eine Einwilligung braucht, welche Dienste du nennst und was
dein Banner und deine Datenschutzerklärung sagen, entscheidest du. Prüfe es
selbst oder mit jemandem, der dich dazu beraten darf. Die
[README](https://github.com/seebaermichi/nera-plugin-consent#readme) und die
[npm-Seite](https://www.npmjs.com/package/@nera-static/plugin-consent) des
Plugins haben die vollständige Konfigurationsreferenz, den Markup-Vertrag und
die bekannten Einschränkungen.

## Weiter

[Wie diese Website gebaut ist](/de/tutorials/how-this-site-is-built.html)
zeigt die Plugins dieser Website im Zusammenspiel. nera.js.org selbst lädt
nichts von einem anderen Host und zeigt deshalb keinen Banner.
