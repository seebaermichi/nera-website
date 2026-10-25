---
layout: pages/tutorial.pug
title: Eine One-Page-Website bauen
slug: one-page-site
lang: de
description: Eine einzige scrollende Landingpage aus einer Markdown-Datei je Abschnitt, mit seiteninterner Navigation, mailto-Kontaktformular und Social-Links im Footer.
keywords: nera One-Page, Landingpage, plugin-one-page, plugin-page-navigation, plugin-contact-form, plugin-social-media-links, mailto-Formular
tags: plugins, one-page, forms
pagination_order: 11
createdAt: 2026-10-25
---
Selbstständige und kleine Unternehmen brauchen oft eine Seite, keine ganze
Website: einen Hero, die Leistungen, ein paar Worte darüber, wer du bist, und
einen Weg, Kontakt aufzunehmen, alles auf einer scrollenden Seite. In diesem
Tutorial baust du diese Seite, mit jedem Abschnitt in einer eigenen
Markdown-Datei. `@nera-static/plugin-one-page` fügt die Abschnitte in die
Startseite ein, `@nera-static/plugin-page-navigation` ergänzt die Links
innerhalb der Seite, `@nera-static/plugin-contact-form` ein Kontaktformular
ohne Backend, und `@nera-static/plugin-social-media-links` setzt deine Profile
in den Footer.

Lieber eine fertige Business-Website zum Anpassen? Der Business-Starter legt
eine an, mit Theme, Beispielseiten für Leistungen, Über uns, Öffnungszeiten und
Kontakt, einem Kontaktformular und Social-Links:

```bash
npx @nera-static/nera new my-site --starter business
```

Seine Dateien passen nicht zu den Schritten unten: Der Starter baut eine
Website aus mehreren Seiten, dieses Tutorial baut eine einzige Seite von Hand,
um zu zeigen, wie die Teile zusammenpassen.

## 1. Gerüst anlegen und installieren

```bash
npx @nera-static/nera new my-site
cd my-site
npm install @nera-static/plugin-one-page @nera-static/plugin-page-navigation \
    @nera-static/plugin-contact-form @nera-static/plugin-social-media-links
```

Nera findet alle vier Plugins von selbst. Drei davon bringen Templates mit.
Veröffentliche sie in deinen Views-Ordner, wo sie dir gehören und du sie
ändern kannst:

```bash
npx nera-page-navigation
npx nera-contact-form
npx nera-social-media-links
```

Auf einer `nera new`-Website landen sie in
`theme/views/vendor/plugin-<name>/`, das Client-Skript des Kontaktformulars in
`theme/assets/js/contact-form.js`. `plugin-one-page` bringt kein Template mit
und braucht keine Konfigurationsdatei.

## 2. Die Zielseite

Die Seite, in die die Abschnitte eingefügt werden, ist eine ganz normale
Seite. Hier ist es die Startseite, und ihr eigener Inhalt ist der Hero:

```markdown:pages/index.md
---
layout: pages/one-page.pug
title: Studio Lena
description: Web design for small businesses in Berlin
---
# Websites for small businesses

I design and build fast, simple websites for shops, studios and practices.
```

Gib ihr ein eigenes Template. Es wächst in den nächsten Schritten; vorerst
rendert es nur den Inhalt:

```pug:theme/views/pages/one-page.pug
extends ../layouts/layout

block content
  main#main
    != content
```

## 3. Eine Datei je Abschnitt

Jeder Abschnitt ist eine Markdown-Datei, die in **`add_to_page`** ihre
Zielseite nennt und in **`add_to_page_order`** ihre Position. Halte sie in
`pages/sections/` beisammen:

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

Führe `npx nera build` aus. Bis Schritt 7 warnt der Build außerdem, dass
`plugin-contact-form` kein `recipient` konfiguriert hat; das Formular wird
einfach noch nicht gerendert. `public/index.html` enthält jetzt den Hero und
danach die drei Abschnitte, in ihrer Reihenfolge (gekürzt):

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

Die Abschnitte werden immer **nach dem eigenen Inhalt der Zielseite
angehängt**. Jeder steckt in einem `<section>`; `content_wrapper_tag` setzt ein
anderes Element, und `content_wrapper_tag: ''` lässt den Wrapper weg. Die
Wrapper-Attribute sind ein einfaches Mapping oder eine Liste von
`{ attribute, value }`-Einträgen, und ihre Werte werden HTML-escaped. Setze
einen Wert, der `: ` enthält, in Anführungszeichen:

```yaml
content_wrapper_attributes:
    style: 'background-color: #f5f5f5;'
```

Ohne Anführungszeichen lässt sich das Frontmatter nicht parsen: Der Build
meldet `❌ Failed to process page …: Nested mappings are not allowed in compact
mappings …`, lässt die Seite weg und endet trotzdem mit Exit-Code 0.
`nera validate` meldet es als Fehler `yaml-parse`.

### `add_to_page` muss genau passen

`add_to_page` wird wörtlich mit dem `href` der Zielseite verglichen, und der
beginnt immer mit `/` und endet auf `.html`: `pages/index.md` ist
`/index.html`, `pages/de/index.md` ist `/de/index.html`. Mit
`add_to_page: index.html` wird nichts eingefügt, und der Build sagt es:

```text
⚠️ one-page: no page has href "index.html" — 1 section(s) targeting it were not merged. `add_to_page` must match a page's href exactly, e.g. "/index.html" for pages/index.md
```

## 4. Anker

Jeder Abschnitt bekommt vor seinem Inhalt ein leeres `<a id="…">`, sodass
`/index.html#services` dorthin springt. **`anchor_id`** setzt die ID. Fehlt
sie, leitet das Plugin eine aus dem ersten **`<h1>`** des Abschnitts ab, als
Slug: kleingeschrieben, Akzente entfernt, alles andere wird zu `-`. Dieser
Abschnitt hat keine `anchor_id`:

```markdown:pages/sections/team.md
---
title: Team
add_to_page: /index.html
add_to_page_order: 4
---
# Über uns

Zwei Leute, ein Studio.
```

Er wird so eingefügt:

```html
      <section>
        <a id="uber-uns"></a>
        <h1>Über uns</h1>
        <p>Zwei Leute, ein Studio.</p>

      </section>
```

Tiefere Überschriften werden ignoriert, ein Abschnitt mit nur
`##`-Überschriften bekommt also keinen Anker, solange du keine `anchor_id`
setzt. Und ein `<h1>` je Abschnitt willst du auf einer One-Page-Website nicht:
Die Startseite hat schon ihr `<h1>`, und mit `team.md` meldet
`nera build --check` die Warnung `page has more than one <h1>` (`a11y-h1`).
Gib den Abschnitten deshalb `##`-Überschriften und eine ausdrückliche
`anchor_id`, wie in Schritt 3, und lösche `team.md` wieder. Ausdrückliche IDs
bleiben außerdem gleich, wenn du eine Überschrift umbenennst oder die Seite
übersetzt (siehe Schritt 10).

## 5. Abschnitte ohne eigene Seite

Ein Abschnitt ist trotzdem eine eigene Seite. Nera schreibt eine Seite nur,
wenn sie ein `layout` hat, und die Abschnitte oben haben keins, also gibt es
sie nur innerhalb von `/index.html`. Ergänzt du `layout: pages/default.pug` in
`about.md`, schreibt der Build zusätzlich `/sections/about.html`, und der
Abschnitt erscheint weiterhin auf der Startseite. Lass `layout` weg, wenn du
diese zweite URL nicht willst.

`nera validate` weiß nicht, dass das fehlende Layout Absicht ist:

```text
pages/sections/about.md
        warning  page has no `layout` — the build skips it silently; add `layout: pages/default.pug` to its frontmatter (a template in theme/views), or, if it has none on purpose (a fragment or draft), add `ignore: { layout-missing: [pages/sections/about.md] }` to config/validate.yaml  layout-missing
…
0 error(s), 3 warning(s)
```

Weil alle Abschnitte in einem Ordner liegen, bringt ein einziger Eintrag sie
alle zum Schweigen:

```yaml:config/validate.yaml
ignore:
    layout-missing:
        - pages/sections
```

Ein Ordner deckt alles darunter ab. `nera validate` meldet jetzt
`✓ No problems found.`

## 6. Navigation innerhalb der Seite

`plugin-page-navigation` baut eine Navigation aus **Geschwisterseiten** im
selben Ordner und überspringt Seiten im Wurzelverzeichnis, für `index.md`
liefert es von sich aus also nichts. Sein anderer Modus passt: eine Liste
**`page_navigation`** im Frontmatter der Seite, deren Einträge genau so beim
Template ankommen, wie sie dastehen. Lass sie auf die Anker zeigen:

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

Setze die `href`s in Anführungszeichen: In YAML beginnt ein `#` ohne
Anführungszeichen nach einem Leerzeichen einen Kommentar. Binde das
veröffentlichte Template über dem Inhalt ein:

```pug:theme/views/pages/one-page.pug
extends ../layouts/layout

block content
  main#main
    include /vendor/plugin-page-navigation/page-navigation
    != content
```

Das `<nav>` bekommt seinen Namen aus dem Übersetzungsschlüssel
`Page navigation`, damit Screenreader es von einem Hauptmenü unterscheiden
können. Gib ihm in `config/app.yaml` eine Bezeichnung in deiner Sprache:

```yaml:config/app.yaml
translations:
  en:
    Page navigation: On this page
```

Die gebaute Seite beginnt mit:

```html
      <nav class="page-nav" aria-label="On this page"><a class="page-nav__link" href="#services">Services</a><a class="page-nav__link" href="#about">About</a><a class="page-nav__link" href="#contact">Contact</a></nav>
```

Diese drei Links könntest du genauso gut von Hand ins Template schreiben. Das
Plugin lohnt sich, sobald die Links je Seite oder je Sprache verschieden sind:
Sie stehen im Frontmatter jeder Seite, neben dem Inhalt, auf den sie zeigen.

## 7. Das Kontaktformular

`plugin-contact-form` rendert ein Formular aus `config/contact-form.yaml`. Beim
Absenden baut ein kleines Skript im Browser aus den Feldern einen
`mailto:`-Link und öffnet das eigene E-Mail-Programm des Besuchers, mit Betreff
und Nachricht schon ausgefüllt. Es gibt kein Backend: Deine Website speichert
und versendet nichts, die Nachricht verlässt den Rechner nur über die E-Mail
des Besuchers. (Die Verarbeitung des Formulars auf einem Server ist nicht Teil
dieses Tutorials.)

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

Jeder Wert, den Besucher sehen, ist hier ein **Übersetzungsschlüssel**, der
für die Sprache jeder Seite aus `translations:` in `config/app.yaml` aufgelöst
wird. Ein Schlüssel ohne Übersetzung erscheint so, wie er dasteht; eine
einsprachige Website könnte also gleich den Text hineinschreiben, Schlüssel
zahlen sich in Schritt 10 aus. `name` und die `value`s der Optionen sind Daten
und werden nie übersetzt. Ergänze die englischen Texte:

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

Behalte die Schlüssel, die `nera new` unter `en:` angelegt hat
(`app_description`, `skip_to_content` und die anderen), neben diesen.

Das Formular ist Pug, es gehört also ins Template, nicht in einen
Markdown-Abschnitt. Der Kontakt-Abschnitt hat die höchste `add_to_page_order`,
also folgt das Formular nach dem Inhalt direkt auf seinen Text:

```pug:theme/views/pages/one-page.pug
extends ../layouts/layout

block content
  main#main
    include /vendor/plugin-page-navigation/page-navigation
    != content
    include /vendor/plugin-contact-form/contact-form
```

Das gebaute Formular (gekürzt):

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

Mit allen Feldern ausgefüllt und abgeschickt, öffnete das Formular diesen
Link:

```text
mailto:hello@example.com?subject=Enquiry%20from%20the%20website&body=Your%20name%3A%20Jane%20Doe%0D%0AYour%20email%3A%20jane%40example.org%0D%0AWhat%20can%20I%20help%20with%3F%3A%20redesign%0D%0AYour%20message%3A%20Hello%20Lena
```

Leer abgeschickt, öffnete es nichts und zeigte in der Statuszeile
`Please fill in all required fields.`. Drei Details solltest du kennen:

- **Der Empfänger ist verschleiert, nicht versteckt.** Er erscheint nie als
  lesbarer Text, steht aber in der Seite:

  | `obfuscation` | Was im HTML landet | Stärke |
  | --- | --- | --- |
  | `entities` (Standard) | jedes Zeichen als HTML-Entity, wie oben | hält naive Scraper ab; ein entschlossener kann es trotzdem dekodieren |
  | `jsassembly` | nur ein Array von Zeichencodes, beim Absenden in JavaScript zusammengesetzt | stärker, aber immer noch keine Garantie |

  Nimm eine Adresse, die du veröffentlichen willst.
- **Ein Honeypot ist eingebaut.** Das versteckte Feld `website` ist ein Köder
  für Bots; eine Nachricht, die es ausfüllt, wird stillschweigend verworfen.
  Gib nie einem echten Feld den Namen des Honeypots. Willst du ein echtes Feld
  „website“, benenne den Köder mit `honeypot:` in der Konfiguration um.
- **Das Plugin bringt kein CSS mit**, außer der Inline-Regel, die den Köder
  versteckt. Gestalte die BEM-Klassen `.contact-form`, `.contact-form__field`,
  `.contact-form__input` und die anderen aus deinem eigenen Stylesheet.

## 8. Social-Links im Footer

`plugin-social-media-links` liest eine Liste von Links aus
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

Das Attribut `d` ist hier gekürzt; füge den vollständigen Pfad des Icons ein,
das du verwendest. Simple Icons (simpleicons.org) hat Markenlogos als SVG.
`icon` wird escaped, außer der Eintrag setzt `icon_raw: true`; setze es also
nur für Markup, das du selbst geschrieben oder geprüft hast. Der Eintrag
LinkedIn hat kein Icon und zeigt nur seinen Namen. Die Beispielkonfiguration
des Plugins verwendet stattdessen `<i>`-Tags von Font Awesome, die das CSS von
Font Awesome brauchen. Lädst du es von einem CDN, geht die IP-Adresse jedes
Besuchers an einen Dritten, und `nera build --check` warnt dann
`privacy-third-party`. Inline-SVG oder reiner Text braucht gar keine Anfrage.

Mit `open_in_new_tab: false` entscheidet der Besucher, wo ein Link sich
öffnet; ohne die Zeile bekommt jeder Link `target="_blank"`.
`rel="noopener noreferrer"` wird in beiden Fällen gesetzt.

Binde das veröffentlichte Template in den Footer des Basis-Layouts ein, das
`nera new` angelegt hat. Entferne seine erste Zeile, die Markierung
`//- nera:scaffold-default`, jetzt, wo die Datei dir gehört:

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

Der Footer beginnt jetzt mit (SVG-Pfad gekürzt):

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

## 9. Scrollen unter einer festen Navigation

Ein wenig CSS lässt die Seite wie aus einem Guss wirken: Die Navigation bleibt
oben stehen, die Links scrollen weich, und ein Abschnitt verschwindet nicht
unter der Navigation. Lege `theme/assets/css/site.css` an:

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

Das Scrollziel ist der Anker, nicht das `<section>`, also gehört
`scroll-margin-top` an `a[id]`. Lade die Datei im `head` des Layouts, nach den
`meta`-Zeilen:

```pug
    link(rel="stylesheet", href="/css/site.css")
```

Dateien in `theme/assets/` werden vom Wurzelverzeichnis der Website
ausgeliefert, die Datei ist also `/css/site.css`. In einem Headless-Browser
setzte ein Klick auf jeden Navigationslink, auf einer Seite, die lang genug zum
Scrollen ist, seine Überschrift 64 px (4rem) unter den oberen Rand, direkt unter
die 50 px hohe feste Navigation.

## 10. Eine zweite Sprache

Eine deutsche Fassung der Seite ist ein zweites Ziel mit eigenen Abschnitten.
Setze `lang: de` in jeder Datei und ziele auf `/de/index.html`:

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

`about.md` und `contact.md` in `pages/de/sections/` folgen demselben Muster,
mit `anchor_id: about` und `anchor_id: contact`. Die Anker bleiben in beiden
Sprachen gleich, also passt das CSS für beide, und ein Link auf `#contact`
funktioniert auf jeder der beiden Seiten.

Erweitere den `ignore`-Eintrag auf jeden Sprachordner; `*` steht für genau
einen Ordnernamen:

```yaml:config/validate.yaml
ignore:
    layout-missing:
        - pages/sections
        - pages/*/sections
```

Übersetze die Schlüssel aus den Schritten 6 und 7 unter `de:` in
`config/app.yaml`:

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

Das Gerüst-Layout setzt `html(lang=app.lang)`, und das ist auf jeder Seite
`en`. Nimm stattdessen die Sprache der Seite:

```pug
html(lang=meta.lang || app.lang)
```

`/de/index.html` hat dann `<html lang="de">`, die deutsche Navigation und das
deutsche Formular, mit denselben Feldnamen:

```html
      <nav class="page-nav" aria-label="Auf dieser Seite"><a class="page-nav__link" href="#services">Leistungen</a><a class="page-nav__link" href="#about">Über mich</a><a class="page-nav__link" href="#contact">Kontakt</a></nav>
      …
        <div class="contact-form__field contact-form__field--text"><label class="contact-form__label" for="contact-name">Ihr Name</label><input class="contact-form__input" type="text" id="contact-name" name="name" data-contact-field="data-contact-field" data-contact-label="Ihr Name" required="required" /></div>
```

Das mitgelieferte Template gibt das `aria_label` der Social-Links nicht durch
`t()`. Um es zu übersetzen, ändere die `nav`-Zeile in deiner veröffentlichten
`theme/views/vendor/plugin-social-media-links/social-media-links.pug`:

```pug
    nav.social-media-links(aria-label=t(app.socialMediaLinksLabel))
```

und ergänze `Social media: Soziale Medien` unter `de:`. Ist all das erledigt,
melden `nera validate` und `nera build --check` beide `✓ No problems found.`

## One-Page oder Stacks?

[plugin-stacks](/de/tutorials/reusable-content-blocks.html) macht ebenfalls
Markdown-Dateien zu Teilen anderer Seiten, nur andersherum. Ein Stack ist ein
Block, den eine **View** über `app.stacks` platziert, an beliebiger Stelle und
so oft du willst; er kennzeichnet sich mit `type: stack` und braucht keinen
Eintrag in `validate.yaml`. Ein One-Page-Abschnitt nennt in `add_to_page`
**seine Zielseite**, und das Plugin hängt ihn an den Inhalt dieser Seite an, in
Reihenfolge, mit Anker und Wrapper, ohne dass du ein Template anfasst. Nimm
One-Page, wenn eine Seite eine Folge von Abschnitten ist. Nimm Stacks, wenn
derselbe Block an mehrere Stellen gehört oder an einen bestimmten Platz in
einem Layout.

## Weiter

- [Eine Navigation mit aktiven Zuständen bauen](/de/tutorials/custom-navigation.html)
  ergänzt ein Hauptmenü, sobald aus der einen Seite ein paar werden.
- [Wie diese Website gebaut ist](/de/tutorials/how-this-site-is-built.html)
  zeigt eine vollständige Nera-Website, deren Plugins zusammenspielen.
