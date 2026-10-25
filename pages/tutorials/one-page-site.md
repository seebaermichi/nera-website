---
layout: pages/tutorial.pug
title: Build a one-page site
slug: one-page-site
lang: en
description: A single scrolling landing page from one Markdown file per section, with an in-page navigation, a mailto contact form and social links in the footer.
keywords: nera one-page, landing page, plugin-one-page, plugin-page-navigation, plugin-contact-form, plugin-social-media-links, mailto form
tags: plugins, one-page, forms
pagination_order: 11
createdAt: 2026-10-25
verified_on: 2026-10-25
verified_with:
    nera: 1.17.0
    plugin-one-page: 3.0.2
    plugin-page-navigation: 2.5.0
    plugin-contact-form: 1.1.1
    plugin-social-media-links: 2.3.0
    starter-business: 1.0.1
    validate: 1.6.2
---
A freelancer or a small business often needs one page, not a site: a hero, the
services, a few words about who you are, and a way to get in touch, all on one
scrolling page. In this tutorial you build that page with each section in its
own Markdown file. `@nera-static/plugin-one-page` merges the sections into the
home page, `@nera-static/plugin-page-navigation` adds the in-page links,
`@nera-static/plugin-contact-form` adds a contact form without a backend, and
`@nera-static/plugin-social-media-links` puts your profiles in the footer.

Want a finished business site to edit instead? The business starter sets one up
with a theme, sample pages for services, about, opening hours and contact, a
contact form and social links:

```bash
npx @nera-static/nera new my-site --starter business
```

Its files won't match the steps below: the starter builds a site of several
pages, while this tutorial builds a single page by hand, to show how the pieces
fit together.

## 1. Scaffold and install

```bash
npx @nera-static/nera new my-site
cd my-site
npm install @nera-static/plugin-one-page @nera-static/plugin-page-navigation \
    @nera-static/plugin-contact-form @nera-static/plugin-social-media-links
```

Nera finds all four plugins on its own. Three of them ship templates. Publish
them into your views folder, where they are yours to edit:

```bash
npx nera-page-navigation
npx nera-contact-form
npx nera-social-media-links
```

On a `nera new` site they land in `theme/views/vendor/plugin-<name>/`, and the
contact form's client script in `theme/assets/js/contact-form.js`.
`plugin-one-page` ships no template and needs no config file.

## 2. The target page

The page the sections are merged into is an ordinary page. Here it is the home
page, and its own content is the hero:

```markdown:pages/index.md
---
layout: pages/one-page.pug
title: Studio Lena
description: Web design for small businesses in Berlin
---
# Websites for small businesses

I design and build fast, simple websites for shops, studios and practices.
```

Give it a template of its own. It grows in the next steps; for now it renders
the content:

```pug:theme/views/pages/one-page.pug
extends ../layouts/layout

block content
  main#main
    != content
```

## 3. One file per section

Each section is a Markdown file that names its target page in
**`add_to_page`** and its position in **`add_to_page_order`**. Keep them
together in `pages/sections/`:

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

Run `npx nera build`. Until step 7 it also warns that `plugin-contact-form` has
no `recipient` configured; the form simply does not render yet.
`public/index.html` now holds the hero followed by the three sections, in their
order (shortened):

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

The sections are always **appended after the target page's own content**.
Each one is wrapped in a `<section>`; `content_wrapper_tag` sets another
element, and `content_wrapper_tag: ''` drops the wrapper. The wrapper
attributes are a plain mapping or a list of `{ attribute, value }` entries, and
their values are HTML-escaped. Quote a value that contains `: `:

```yaml
content_wrapper_attributes:
    style: 'background-color: #f5f5f5;'
```

Unquoted, the frontmatter does not parse: the build logs
`❌ Failed to process page …: Nested mappings are not allowed in compact
mappings …`, drops the page and still exits 0. `nera validate` reports it as a
`yaml-parse` error.

### `add_to_page` must match exactly

`add_to_page` is compared literally with the target page's `href`, which always
starts with `/` and ends in `.html`: `pages/index.md` is `/index.html`,
`pages/de/index.md` is `/de/index.html`. With `add_to_page: index.html` nothing
is merged, and the build says so:

```text
⚠️ one-page: no page has href "index.html" — 1 section(s) targeting it were not merged. `add_to_page` must match a page's href exactly, e.g. "/index.html" for pages/index.md
```

## 4. Anchors

Each section gets an empty `<a id="…">` in front of its content, so
`/index.html#services` jumps to it. **`anchor_id`** sets the id. Without it,
the plugin derives one from the section's first **`<h1>`**, slugified:
lowercase, accents removed, everything else turned into `-`. This section has
no `anchor_id`:

```markdown:pages/sections/team.md
---
title: Team
add_to_page: /index.html
add_to_page_order: 4
---
# Über uns

Zwei Leute, ein Studio.
```

It is merged as:

```html
      <section>
        <a id="uber-uns"></a>
        <h1>Über uns</h1>
        <p>Zwei Leute, ein Studio.</p>

      </section>
```

Lower headings are ignored, so a section with only `##` headings gets no anchor
unless you set `anchor_id`. And an `<h1>` per section is not what you want on
a one-page site: the home page already has its `<h1>`, and with `team.md` in
place `nera build --check` warns `` page has more than one `<h1>` ``
(`a11y-h1`). So give the sections `##` headings and an explicit `anchor_id`, as
in step 3, and delete `team.md` again. Explicit ids also stay the same when you rename a
heading or translate the page (see step 10).

## 5. Sections without a page of their own

A section is still a page of its own. Nera writes a page only if it has a
`layout`, and the sections above have none, so they exist only inside
`/index.html`. Add `layout: pages/default.pug` to `about.md` and the build also
writes `/sections/about.html`, while the section still appears on the home page.
Leave `layout` out unless you want that second URL.

`nera validate` does not know that the missing layout is on purpose:

```text
pages/sections/about.md
        warning  page has no `layout` — the build skips it silently; add `layout: pages/default.pug` to its frontmatter (a template in theme/views), or, if it has none on purpose (a fragment or draft), add `ignore: { layout-missing: [pages/sections/about.md] }` to config/validate.yaml  layout-missing
…
0 error(s), 3 warning(s)
```

Because all sections live in one folder, one entry silences them all:

```yaml:config/validate.yaml
ignore:
    layout-missing:
        - pages/sections
```

A folder covers everything below it. `nera validate` now prints
`✓ No problems found.`

## 6. In-page navigation

`plugin-page-navigation` builds a navigation of **sibling pages** in the same
folder, and skips pages at the site root, so on its own it gives `index.md`
nothing. Its other mode fits: a **`page_navigation`** list in the page's
frontmatter, whose entries go to the template exactly as written. Point them
at the anchors:

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

Quote the `href`s: in YAML an unquoted `#` after a space starts a comment.
Include the published template above the content:

```pug:theme/views/pages/one-page.pug
extends ../layouts/layout

block content
  main#main
    include /vendor/plugin-page-navigation/page-navigation
    != content
```

The `<nav>` is named by the translation key `Page navigation`, so it stays
distinct from a main menu for screen readers. Give it a label in your
language in `config/app.yaml`:

```yaml:config/app.yaml
translations:
  en:
    Page navigation: On this page
```

The built page starts with:

```html
      <nav class="page-nav" aria-label="On this page"><a class="page-nav__link" href="#services">Services</a><a class="page-nav__link" href="#about">About</a><a class="page-nav__link" href="#contact">Contact</a></nav>
```

You could write these three links into the template by hand just as well. The
plugin earns its place once the links differ per page or per language: they
live in each page's frontmatter, next to the content they point to.

## 7. The contact form

`plugin-contact-form` renders a form from `config/contact-form.yaml`. On submit
a small script in the browser builds a `mailto:` link from the fields and opens
the visitor's own email program with subject and message filled in. There is no
backend: your site stores and sends nothing, and the message leaves only through
the visitor's email. (Handling the form on a server is not covered here.)

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

Every user-facing value here is a **translation key**, resolved for each
page's language from `translations:` in `config/app.yaml`. A key without a
translation renders as written, so a site in one language could write the text
directly; keys pay off in step 10. `name` and the option `value`s are data and
are never translated. Add the English texts:

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

Keep the keys `nera new` put under `en:` (`app_description`, `skip_to_content`
and the others) next to these.

The form is Pug, so it goes in the template, not in a Markdown section. The
contact section has the highest `add_to_page_order`, so the form placed after
the content follows its text directly:

```pug:theme/views/pages/one-page.pug
extends ../layouts/layout

block content
  main#main
    include /vendor/plugin-page-navigation/page-navigation
    != content
    include /vendor/plugin-contact-form/contact-form
```

The built form (shortened):

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

Submitted with every field filled in, the form opened this link:

```text
mailto:hello@example.com?subject=Enquiry%20from%20the%20website&body=Your%20name%3A%20Jane%20Doe%0D%0AYour%20email%3A%20jane%40example.org%0D%0AWhat%20can%20I%20help%20with%3F%3A%20redesign%0D%0AYour%20message%3A%20Hello%20Lena
```

Submitted empty, it opened nothing and showed `Please fill in all required
fields.` in the status line. Three details are worth knowing:

- **The recipient is obfuscated, not hidden.** It never appears as readable
  text, but it is in the page:

  | `obfuscation` | What lands in the HTML | Strength |
  | --- | --- | --- |
  | `entities` (default) | each character as an HTML entity, as above | deters naïve scrapers; a determined one can still decode it |
  | `jsassembly` | only an array of character codes, rebuilt in JavaScript on submit | stronger, still not a guarantee |

  Use an address you are willing to publish.
- **A honeypot is built in.** The hidden `website` field is a decoy for bots; a
  submission that fills it is dropped silently. Never give a real field the
  honeypot's name. If you want a real "website" field, rename the decoy with
  `honeypot:` in the config.
- **The plugin ships no CSS** apart from the inline rule that hides the decoy.
  Style the BEM classes `.contact-form`, `.contact-form__field`,
  `.contact-form__input` and the others from your own stylesheet.

## 8. Social links in the footer

`plugin-social-media-links` reads a list of links from
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

The `d` attribute is shortened here; paste the full path of the icon you use.
Simple Icons (simpleicons.org) has brand logos as SVG. `icon` is escaped unless
the entry sets `icon_raw: true`, so set it only for markup you wrote or checked
yourself. The LinkedIn entry has no icon and shows its name only. The plugin's
sample config uses Font Awesome `<i>` tags instead, which need the Font Awesome
CSS. Loading it from a CDN sends every visitor's IP address to a third party,
and `nera build --check` then warns `privacy-third-party`. Inline SVG or plain
text needs no request at all.

`open_in_new_tab: false` lets the visitor decide where a link opens; without
it, every link gets `target="_blank"`. `rel="noopener noreferrer"` is set
either way.

Include the published template in the footer of the base layout that
`nera new` created. Remove its first line, the `//- nera:scaffold-default`
marker, now that the file is your own:

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

The footer now starts with (SVG path shortened):

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

## 9. Scrolling under a sticky navigation

A little CSS makes the page feel like one: the navigation stays at the top, the
links scroll smoothly, and a section does not end up hidden under the
navigation. Create `theme/assets/css/site.css`:

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

The scroll target is the anchor, not the `<section>`, so `scroll-margin-top`
goes on `a[id]`. Load the file in the layout's `head`, after the `meta` lines:

```pug
    link(rel="stylesheet", href="/css/site.css")
```

Files in `theme/assets/` are served from the site root, so the file is
`/css/site.css`. In a headless browser, on a page long enough to scroll that
far, a click on each navigation link put its heading 64 px (4rem) from the top,
just below the 50 px high sticky navigation.

## 10. A second language

A German copy of the page is a second target with its own sections. Set
`lang: de` on each file and target `/de/index.html`:

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

`about.md` and `contact.md` in `pages/de/sections/` follow the same pattern
with `anchor_id: about` and `anchor_id: contact`. The anchors stay the same in
both languages, so the CSS works for both and a link to `#contact` works on
either page.

Extend the `ignore` entry to every language folder; `*` stands for one folder
name:

```yaml:config/validate.yaml
ignore:
    layout-missing:
        - pages/sections
        - pages/*/sections
```

Translate the keys from steps 6 and 7 under `de:` in `config/app.yaml`:

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

The scaffolded layout sets `html(lang=app.lang)`, which is `en` on every page.
Use the page's language instead:

```pug
html(lang=meta.lang || app.lang)
```

`/de/index.html` then has `<html lang="de">`, the German navigation and the
German form, with the same field names:

```html
      <nav class="page-nav" aria-label="Auf dieser Seite"><a class="page-nav__link" href="#services">Leistungen</a><a class="page-nav__link" href="#about">Über mich</a><a class="page-nav__link" href="#contact">Kontakt</a></nav>
      …
        <div class="contact-form__field contact-form__field--text"><label class="contact-form__label" for="contact-name">Ihr Name</label><input class="contact-form__input" type="text" id="contact-name" name="name" data-contact-field="data-contact-field" data-contact-label="Ihr Name" required="required" /></div>
```

The social links' `aria_label` is not passed through `t()` by the shipped
template. To translate it, change the `nav` line in your published
`theme/views/vendor/plugin-social-media-links/social-media-links.pug`:

```pug
    nav.social-media-links(aria-label=t(app.socialMediaLinksLabel))
```

and add `Social media: Soziale Medien` under `de:`. With all of this in place,
`nera validate` and `nera build --check` both print `✓ No problems found.`

## One page or stacks?

[plugin-stacks](/tutorials/reusable-content-blocks.html) also turns Markdown
files into pieces of other pages, but the other way round. A stack is a block
that a **view** places, anywhere and as often as you like, through
`app.stacks`; it marks itself with `type: stack` and needs no `validate.yaml`
entry. A one-page section names **its target page** in `add_to_page`, and the
plugin appends it to that page's content, in order, with an anchor and a
wrapper, without touching a template. Use one-page when a page is a sequence
of sections. Use stacks when the same block belongs in several places or in a
particular spot of a layout.

## Next

- [Build a navigation with active states](/tutorials/custom-navigation.html)
  adds a main menu, once the one page grows into a few.
- [How this website is built](/tutorials/how-this-site-is-built.html) shows a
  complete Nera site with its plugins working together.
