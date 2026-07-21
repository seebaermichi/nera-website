# nera-website

The official website, documentation, and tutorials for the
[Nera](https://github.com/seebaermichi/nera) static site generator —
**built with Nera itself.**

## What's here

| Section | Source | Layout |
| --- | --- | --- |
| Home | `pages/index.md` | `views/pages/home.pug` |
| Docs | `pages/docs/*.md` | `views/pages/docs.pug` |
| Plugins | `pages/plugins/index.md` | `views/pages/plugins.pug` |
| Tutorials | `pages/tutorials/*.md` | `views/pages/tutorial.pug` + `tutorials-index.pug` |
| About | `pages/about.md` | `views/pages/default.pug` |
| Search | `pages/search.md` | `views/pages/search.pug` |

Tag overview pages (`/tags/*.html`) are generated automatically from tutorial
`tags:` frontmatter.

## Plugins in use

- `@nera-static/plugin-navigation` — header + footer nav (`config/navigation.yaml`)
- `@nera-static/plugin-tags` — tutorial tags + tag pages (`config/tags.yaml`)
- `@nera-static/plugin-search` — client-side search (`config/search.yaml`)
- `@nera-static/plugin-page-pagination` — docs & tutorial prev/next
- `@nera-static/plugin-canonical-links` — SEO canonical tags (`config/canonical-links.yaml`)
- `src/plugins/tutorials-list` — a small **local** plugin that builds `app.tutorials`

Published plugin templates live under `views/vendor/` and are safe to edit.

## Develop

```bash
npm install
npm run dev      # render + live-reload preview on http://localhost:3000
npm run render   # one-off production build into public/
```

## Design

The styles in `assets/css/main.css` are a **deliberately minimal placeholder**.
The visual design is being produced separately (Claude Design); drop the design
system in over these BEM class names — the markup is already structured for it.

## Before launch

- Set `app_origin` in `config/canonical-links.yaml` to the real domain.
- Review nav labels/order in `config/navigation.yaml`.
