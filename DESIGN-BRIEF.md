# Design brief — Nera website

Hand this to Claude Design (or any designer). The site is already scaffolded and
building; this brief describes the visual design we need on top of the existing
markup. Styling approach is **hand-written CSS, token-driven — no Tailwind, no CSS
framework, no build step** (see `README.md` for why).

---

**Project:** Nera — an open-source (MIT) static site generator for Node.js. This is
its official website: marketing home, full documentation, a plugin catalog, and
ongoing tutorials.

**What Nera is:** A lightweight, plugin-based static site generator. You write
Markdown with YAML frontmatter, template with Pug, and a simple four-stage pipeline
renders `pages/` into static HTML. No heavy build toolchain, no framework lock-in.
Every feature beyond "Markdown → HTML" is a small, single-purpose
`@nera-static/plugin-*` package you opt into (navigation, tags, search, pagination,
canonical links, and more).

**Feel to convey:** Minimal, fast, transparent, developer-friendly — "understand the
whole thing in an afternoon." Calm and confident, not busy or corporate. Reference
aesthetics: the docs sites for Eleventy, Astro, Zola, and Tailwind's own docs —
clean, technical, generous whitespace, great code blocks.

**Audience:** Developers who want a small, hackable SSG for blogs, docs, and content
sites and value simplicity and control over batteries-included magic.

**Pages to design** (mockups needed for the starred ones):

- ★ **Home** — hero (product name, tagline, two CTAs, an install command in a code
  block) + a feature grid (4 features).
- ★ **Docs article** — left sidebar nav + long-form content area with headings,
  prose, code blocks (with copy affordance), tables, blockquote callouts, and a
  prev/next pager at the bottom.
- ★ **Plugin catalog** — a responsive grid of plugin cards (name, one-line
  description, package name in mono, "Docs →" link).
- Tutorial index (card/list with topic tags), tutorial article (title, date, tag
  chips, prose body, pager), Search page (search input + results list), footer.

**Hard technical constraints (these shape the design):**

- **Output must be plain, hand-written CSS** — no Tailwind, no CSS framework, no
  build step. The site copies `assets/css/main.css` verbatim; deliver CSS that drops
  straight in.
- **Target our existing BEM class names** (inventory below) — the HTML markup already
  exists and won't change. Please style those classes rather than inventing new
  markup. Where a component needs new sub-elements, extend within the existing BEM
  block.
- **Light and dark mode**, driven by CSS custom properties + `prefers-color-scheme`.
- **Fonts:** Prefer self-hosted (recommended — avoids sending visitor IPs to Google's
  CDN, a GDPR concern for EU sites, and keeps the site fully self-contained). Google
  Fonts / a CDN is acceptable if you'd rather keep setup simple. Either way, propose a
  pairing — a clean UI/text face + a monospace for code. Self-hosted files live in
  `assets/fonts/`.
- **Low-JS, responsive, mobile-first.** Wide content (code blocks, tables) scrolls
  within its own container; the page body never scrolls horizontally.
- **The site is trilingual (English, German, Spanish).** The header carries a
  compact **language switch** (`EN / DE / ES`) that must fit alongside the main nav
  on desktop and collapse gracefully on mobile. German labels run longer than
  English — design the nav so longer strings don't break the layout.

**Brand:** No established brand yet — please propose a simple wordmark and a
restrained 1–2 accent-color palette that reads technical and trustworthy.

**What we need as output:**

1. **Design tokens as CSS custom properties** — color (light + dark), type scale,
   spacing scale, radii, borders, shadows — ready to paste into `:root` /
   `@media (prefers-color-scheme: dark)`.
2. **A complete `assets/css/main.css`** implementing the system against the BEM
   classes below — including the `.prose` long-form styles (headings, paragraphs,
   lists, `pre`/`code`, tables, blockquotes, links).
3. **Visual mockups** of the three starred pages (Home, Docs article, Plugin catalog)
   in light and dark — as static HTML/CSS or an image/artifact — for sign-off before
   we wire it in.
4. A short note on the **font choice** and where to source the files.

**BEM class inventory to target** (grouped; classes marked ⚙︎ come from plugin
templates and appear on generated markup — please style them as named):

- **Shell:** `.container`, `.prose`, `.site-main`, `.site-header`
  (`__inner/__brand/__logo/__name/__cta`), `.site-footer`
  (`__inner/__brand/__name/__tagline/__meta`)
- ⚙︎ **Nav:** `.nav`, `.nav--main`, `.nav--footer`, `.nav--list`, `.nav__item`,
  `.nav__link`, `.nav__link--active`, `.nav__link--active-path`
- **Language switch (i18n):** `.lang-switch`, `.lang-switch__link`,
  `.lang-switch__link--active` — the compact EN/DE/ES toggle in the header.
- **Home:** `.hero` (`__inner/__eyebrow/__title/__tagline/__actions/__code`),
  `.button`, `.button--primary`, `.button--ghost`, `.home-body`
- **Docs:** `.docs-layout`, `.docs-content`, `.docs-sidebar`
  (`__heading/__list/__item/__link`), `.docs-sidebar__link--active`
- **Plugins:** `.plugins` (`__header/__title`), `.plugin-cards`, `.plugin-card`
  (`__name/__desc/__pkg/__link`)
- **Tutorials:** `.tutorials`
  (`__header/__title/__intro/__list/__item/__link/__item-title/__item-desc`),
  `.tutorial` (`__header/__title/__date/__body`)
- ⚙︎ **Tags:** `.tag-links`, `.tag-links__item`, `.tag-cloud`, `.tag-cloud__item`,
  `.tag-overview`
  (`__header/__title/__image/__content/__item/__item-title/__item-date/__item-description/__item-link`)
- ⚙︎ **Pagination:** `.page-pagination`, `.page-pagination__link`,
  `.page-pagination__link--previous`, `.page-pagination__link--next`
- ⚙︎ **Search:** `.search`, `.search__title`, `.search__input`, `.search__results`,
  `.search-page`

> The ⚙︎ plugin classes come from templates in `views/vendor/` — we own those copies,
> so that markup *can* be adjusted if needed, but styling the classes as-named keeps
> things clean.
