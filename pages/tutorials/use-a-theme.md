---
layout: pages/tutorial.pug
title: Use and customise a theme
slug: use-a-theme
lang: en
description: Start a site from an installable theme, change its colours, CSS and markup file by file, and keep receiving the theme's updates through npm.
keywords: nera theme, theme-business, override theme, child theme, design tokens, custom css, nera update, theme-shadowed
tags: themes, getting-started
pagination_order: 14
createdAt: 2026-11-22
verified_on: 2026-11-22
verified_with:
    theme-business: 1.0.3
    nera: 1.28.0
    core: 4.19.0
---
A Nera theme is an npm package: layouts, page types, partials, a stylesheet
and a set of design tokens. Your site does not copy it. It installs the
package and puts a file of its own next to it only where it wants something
different. Every other file still comes from the package, so `npm update`
keeps bringing the theme's fixes, like a child theme in WordPress.

This tutorial uses `@nera-static/theme-business`, the theme of the business
and portfolio starters. You change a colour, add a few CSS rules, replace one
partial, update the theme, and add a theme to a site that has none. Every
command and output below was run in a fresh site with theme-business 1.0.3,
`@nera-static/nera` 1.28.0 and `@nera-static/core` 4.18.3.

## 1. Start a site with a theme

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

`--theme business` does two things. It adds the package to `package.json`:

```json
"dependencies": {
    "@nera-static/nera": "^1.28.0",
    "@nera-static/theme-business": "^1.0.3"
}
```

and it names the theme in `config/app.yaml`:

```yaml:config/app.yaml
theme: business
```

`business` is short for `@nera-static/theme-business`. The site gets no
layout of its own: `theme/` holds only an empty `theme/assets/`, and every
view comes from the package in `node_modules/`.

Want sample pages for services, opening hours and contact as well? The
business starter brings the same theme with them:
`npx @nera-static/nera new my-site --starter business`.

## 2. Make the first build clean

Build with the output checks:

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

Both come from the scaffolded pages, not from the theme:

-   The theme renders the page's `title` as its one `<h1>`, so a page's
    Markdown starts at `##`. Delete the `# Welcome to Nera`, `# Imprint` and
    `# Privacy` lines from the three pages.
-   The footer links the legal pages you list. Create the site's own
    `config/theme.yaml`:

```yaml:config/theme.yaml
footer_links:
    - label: Imprint
      href: /imprint.html
    - label: Privacy
      href: /privacy.html
```

Build again:

```text
✓ No problems found.
```

The footer now carries:

```html
<nav class="site-footer__legal" aria-label="Legal"><a href="/imprint.html">Imprint</a><a href="/privacy.html">Privacy</a></nav>
```

Replace the two placeholder pages with your own texts before you publish.

## 3. How a theme and your site share the work

Nera looks for every view and every asset in two places, your site first:

| what | your site | the theme package |
|---|---|---|
| views | `theme/views/<path>` | `node_modules/@nera-static/theme-business/views/<path>` |
| assets | `theme/assets/<path>` | `node_modules/@nera-static/theme-business/assets/<path>` |
| settings | `config/theme.yaml` | the package's `config/theme.yaml` |

A file in your site wins over the theme's file **of the same path**, and only
that one file. Everything you do not override comes from the package. Assets
are copied theme first, then your site's, so `public/` ends up with both, and
yours on top. Your `config/theme.yaml` is merged key by key over the theme's
defaults: you set only what you change (lists such as `footer_links` are
replaced as a whole).

The theme's README has a table of what to change where. From cheapest to
most expensive:

| to change | do this | you keep theme updates for |
|---|---|---|
| a colour, a font, a width | a token in `config/theme.yaml` | everything |
| a few CSS rules | `theme/assets/css/custom.css` + `extra_css` | everything |
| one partial or page type | copy it to `theme/views/<same path>` | every other file |
| the whole page shell | override `layouts/layout.pug` | page types, partials, CSS |

Sections 4 to 6 go down this table.

## 4. Change a colour

Every token in the theme's `config/theme.yaml` becomes a CSS custom property:
`tokens.color.accent` becomes `--theme-color-accent`. Change the accent (links,
buttons, the top rule) to a dark teal and give the focus outline the old rust
colour:

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

After `npx nera build`, the `<style>` the theme writes into every page's
`<head>` carries your values next to the defaults you did not touch:

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

Keep the contrast when you change colours: the accent is text on the page
background and on cards, and the background of buttons. `#1c5f74` reaches
6.4:1 on the background, 5.5:1 on the card colour and 7.1:1 under white
button text, all above the 4.5:1 that WCAG asks for. The theme's README lists
every token and every colour pair it checks.

## 5. Add your own CSS

For rules the tokens do not cover, add a stylesheet of your own and let the
theme link it. Put it into `theme/assets/css/custom.css`; the rule styles a
line you will add in the next section:

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

and list it under `extra_css` in `config/theme.yaml`:

```yaml:config/theme.yaml
extra_css:
    - /css/custom.css
```

The theme links it after its own stylesheet and the token `<style>`, so your
rules win:

```html
<link rel="stylesheet" href="/css/theme.css">
<style>
  …
</style>
<link rel="stylesheet" href="/css/custom.css">
```

`public/css/` now holds both `theme.css` (from the package) and `custom.css`
(from your site). Use the tokens (`var(--theme-color-accent)`) rather than
copied colour values, so a change in section 4 reaches your rules too. The
theme lists its public class names in its README; those are the ones that
stay stable across minor and patch releases.

Do not override `theme/assets/css/theme.css` itself: your copy would replace
the theme's whole stylesheet, and its fixes would stop reaching you.

## 6. Override one partial

Now change markup. The page header of every page except the front page
lives in the partial `partials/page-header.pug`. Copy it from the package to
the same path in your site:

```bash
mkdir -p theme/views/partials
cp node_modules/@nera-static/theme-business/views/partials/page-header.pug theme/views/partials/
```

and add a small line above the title, read from a new `kicker` frontmatter
key:

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

The class is your own, `page-kicker`, not a name inside the theme's
`page__…` block: a later theme release could add a `page__kicker` of its own.
Use it on a page:

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

`npx nera build` renders `public/about.html` with your header:

```html
<header class="page__header">
  <p class="page-kicker">Since 1998</p>
  <h1 class="page__title">About us</h1>
  <p class="page__lead">A small bakery in the middle of Berlin.</p>
</header>
```

A page without `kicker` renders as before. Every other view, the layout, the
footer, the page types, still comes from the package: you took over one file,
not the theme.

A theme often prepares such places for you. theme-business ships empty
partials, its *seams*, for plugin output: `partials/head-extra.pug` at the end
of `<head>`, `partials/nav-main.pug` in the header navigation,
`partials/footer-extra.pug` in the footer and a few more, listed in its
README. Overriding a seam costs nothing, since there is no theme markup in it
to miss out on. For a page type of your own, put a new file under
`theme/views/pages/` that `extends ../layouts/layout.pug`; the README shows
one.

## 7. Updates keep coming

Update the theme the same way as Nera itself:

```bash
npx nera update
```

```text
🔄 Updating Nera packages: @nera-static/nera, @nera-static/theme-business
```

`nera update` runs `npm update` for every `@nera-static/` package in
`package.json`, the theme included. Like `npm update`, it stays within each
package's range, so a new major version of the theme is never installed
behind your back. `npm ls` shows the version you have:

```bash
npm ls @nera-static/theme-business
```

```text
my-site@1.0.0 …/my-site
└── @nera-static/theme-business@1.0.3
```

An update replaces the files in `node_modules/`, never the ones in your
`theme/`. That cuts both ways:

-   Your tokens, `custom.css` and `page-header.pug` survive every update.
-   Your `page-header.pug` no longer receives the theme's changes to that
    file. Everything else does.

After an update, compare each file you override with the theme's new
version and take over what you want:

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

Here the only differences are yours. The theme follows semantic versioning
over its view paths, tokens, settings and public classes: a minor or patch
release keeps your overrides working, and a major one says in its CHANGELOG
what to change. The fewer files you override, the less there is to compare.

## 8. Add a theme to an existing site

A site created without `--theme` has its own layout, scaffolded by
`nera new`. Install the theme and name it in `config/app.yaml`:

```bash
npm install @nera-static/theme-business
```

```yaml:config/app.yaml
theme: business
```

`nera validate` then points at the two scaffolded views that are in the way:

```text
theme/views/layouts/layout.pug
  :1    warning  the `nera new` starter file hides the theme's own layouts/layout.pug — delete it to use the theme's, or remove the `nera:scaffold-default` line to keep it on purpose  theme-shadowed
theme/views/pages/default.pug
  :1    warning  the `nera new` starter file hides the theme's own pages/default.pug — delete it to use the theme's, or remove the `nera:scaffold-default` line to keep it on purpose  theme-shadowed

0 error(s), 2 warning(s)
```

They have the same paths as two of the theme's views, so by the rule of
section 3 they would win, and the theme would never show. Their first line,
`//- nera:scaffold-default`, marks them as untouched starter files. Delete
them:

```bash
rm theme/views/layouts/layout.pug theme/views/pages/default.pug
npx nera validate
```

```text
✓ No problems found.
```

If you changed one of them and want to keep it, remove its
`nera:scaffold-default` line instead: the file is then a deliberate override
and the warning goes away. Then fix the headings and the footer links as in
section 2.

A page renders with the theme's page type of the same name as its `layout`.
theme-business has `pages/home.pug`, `default.pug`, `contact.pug`,
`list.pug` and `gallery.pug`; a page whose `layout` names a view neither your
site nor the theme has fails `nera validate` with `layout-unresolved`, which
names both places it looked.

## 9. Build your own theme

A theme of your own is an npm package with the same layout: `views/`,
`assets/` and `config/theme.yaml`. `@nera-static/theme-example` is the
smallest one, kept small to copy: its README's section
[Using it as a blueprint for your own theme](https://github.com/seebaermichi/nera-theme-example#using-it-as-a-blueprint-for-your-own-theme)
walks through renaming the package, the fields Nera needs to find it, and the
seams that let a site extend it without forking. theme-business shows the
same ideas at full size: tokens, seams and a documented contract.

## Next

The [theme-business README](https://github.com/seebaermichi/nera-theme-business#readme)
has every token, setting, seam and public class. The plugin tutorials, such
as [Custom navigation](/tutorials/custom-navigation.html), show how to publish
a plugin's templates; with theme-business you include them from a seam, as
its README shows for each plugin it supports.
