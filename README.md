# nera-website

The official website, documentation, and tutorials for the
[Nera](https://github.com/seebaermichi/nera) static site generator —
**built with Nera itself.**

## What's here

Live at https://nera.js.org, in English, German (`pages/de/`) and Spanish
(`pages/es/`).

| Section | Source | Layout |
| --- | --- | --- |
| Home | `pages/index.md` | `theme/views/pages/home.pug` |
| Docs | `pages/docs/*.md` | `theme/views/pages/docs.pug` |
| Plugins | `pages/plugins/index.md` | `theme/views/pages/plugins.pug` |
| Tutorials | `pages/tutorials/*.md` | `theme/views/pages/tutorial.pug` + `tutorials-index.pug` |
| About | `pages/about.md` | `theme/views/pages/default.pug` |
| Search | `pages/search.md` | `theme/views/pages/search.pug` |

Tag overview pages (`/tags/*.html`) are generated automatically from tutorial
`tags:` frontmatter.

## Plugins in use

- `@nera-static/plugin-navigation` — header + footer nav (`config/navigation.yaml`)
- `@nera-static/plugin-tags` — tutorial tags + tag pages (`config/tags.yaml`)
- `@nera-static/plugin-search` — client-side search (`config/search.yaml`)
- `@nera-static/plugin-page-pagination` — docs & tutorial prev/next
- `@nera-static/plugin-canonical-links` — canonical and alternate-language links (`config/canonical-links.yaml`)
- `@nera-static/plugin-code-blocks` — highlighted code blocks (`config/code-blocks.yaml`)
- `@nera-static/plugin-link-attributes` — attributes for external links (`config/link-attributes.yaml`)
- `@nera-static/plugin-stacks` — the homepage feature grid (`pages/stacks/home-features/`)
- `plugins/tutorials-list` — a small **local** plugin that builds `app.tutorials`
- `plugins/llms-txt` — a **local** plugin that writes `llms.txt`, `llms-full.txt`
  and a `.md` beside every English docs and tutorials page (`config/llms-txt.yaml`)
- `plugins/skill-zip` — a **local** plugin that publishes the Nera skill from the
  installed `@nera-static/nera` as a zip
- `plugins/heading-ids` — a **local** plugin that gives every h2–h4 an `id`
- `plugins/table-scroll` — a **local** plugin that wraps Markdown tables in a
  `.table-scroll` box

Published plugin templates live under `theme/views/vendor/` and are safe to edit.

## Develop

```bash
npm install
npm run dev        # build + live-reload preview on http://localhost:3000
npm run build      # one-off production build into public/
npm run validate   # check layouts, includes and YAML
npm test           # tests of the local plugins
```

CI runs `npm run lint`, `npm test`, `npm run validate` and
`npm run build -- --check`. A push to `main` deploys the site to GitHub Pages.

## Theme demos

The deploy also publishes live demos of the four blog themes under
`/themes/blog/plain/`, `/stack/`, `/ansitz/` and `/umwege/`. Each one is
scaffolded from the latest release of its starter (`starter-blog`,
`starter-stack`, `starter-ansitz`, `starter-umwege`), served under its own
base path, kept out of search results (`noindex,follow`) and linked to
nera.js.org's imprint and privacy pages (`scripts/theme-demos.js`).

```bash
npm run build          # the site first: it deletes public/
npm run build:demos    # scaffold and build the demos into public/themes/blog/
npm run check:demos    # noindex, footer links, every internal URL resolves
npm run serve          # look at them under /themes/blog/<name>/
```

The temp sites and their image caches live in `.theme-demos/` (git-ignored);
the deploy caches `.theme-demos/cache/` per starter version. CI's test run
does not build the demos; a demo that fails to build or check stops the
deploy, and the live site stays as it was.

The themes page shows a screenshot of each theme's home page,
`theme/assets/img/themes/<name>.webp` (`plain`, `stack`, `ansitz`, `umwege`,
`business`), committed and taken by hand, not in CI. To redo one, capture
the live demo (business: a fresh
`nera new <dir> --starter @nera-static/starter-business --yes`, built and
served locally) with Playwright at a 1440×900 viewport, after fonts and
lazy images have loaded, then shrink it to 960×600:

```bash
cwebp -q 80 -m 6 -resize 960 600 <name>.png -o theme/assets/img/themes/<name>.webp
```

The Ansitz and Umwege shots show the Unsplash photographs their starters
ship (Unsplash licence, credited in each starter's `LICENSE`).

## Design

IBM Plex (self-hosted, `theme/assets/fonts/`) with an amber accent; the design
tokens are the custom properties at the top of `theme/assets/css/main.css`.
