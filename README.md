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
- `plugins/tutorials-list` — a small **local** plugin that builds `app.tutorials`
- `plugins/llms-txt` — a **local** plugin that writes `llms.txt`, `llms-full.txt`
  and a `.md` beside every English docs and tutorials page (`config/llms-txt.yaml`)

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

## Design

IBM Plex (self-hosted, `theme/assets/fonts/`) with an amber accent; the design
tokens are the custom properties at the top of `theme/assets/css/main.css`.
