---
layout: pages/docs.pug
title: Referencia de la CLI
slug: cli
lang: es
description: Los comandos del instalador de nera y los scripts npm del generador.
pagination_order: 7
---

# Referencia de la CLI

## Instalador (`@nera-static/installer`)

```bash
npx @nera-static/installer new <project-name>   # scaffold a new site
npx @nera-static/installer update               # update the generator core in place
```

## Scripts del generador

Ejecuta estos desde dentro de un sitio:

| Comando | Qué hace |
| --- | --- |
| `npm run render` | Compila `pages/` → `public/` |
| `npm run dev` | Renderiza + vista previa con recarga en vivo en `:3000` |
| `npm run serve` | Sirve `public/` sin recompilar |

## Comandos de publicación de plugins

Cada plugin que incluye plantillas expone un bin para copiar su Pug a
`views/vendor/`, p. ej.:

```bash
npx nera-navigation
npx nera-tags
npx nera-search --force   # overwrite existing published templates
```
