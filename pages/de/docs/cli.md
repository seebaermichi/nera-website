---
layout: pages/docs.pug
title: CLI-Referenz
slug: cli
lang: de
description: Die Befehle des nera-Installers und die npm-Skripte des Generators.
pagination_order: 7
---

# CLI-Referenz

## Installer (`@nera-static/installer`)

```bash
npx @nera-static/installer new <project-name>   # scaffold a new site
npx @nera-static/installer update               # update the generator core in place
```

## Generator-Skripte

Führe diese aus dem Inneren einer Seite aus:

| Befehl | Was er macht |
| --- | --- |
| `npm run render` | `pages/` → `public/` bauen |
| `npm run dev` | Rendern + Live-Reload-Vorschau auf `:3000` |
| `npm run serve` | `public/` ausliefern, ohne neu zu bauen |

## Plugin-Publish-Befehle

Jedes Template-ausliefernde Plugin stellt ein Bin bereit, um sein Pug nach
`views/vendor/` zu kopieren, z. B.:

```bash
npx nera-navigation
npx nera-tags
npx nera-search --force   # overwrite existing published templates
```
