---
layout: pages/docs.pug
title: Referencia de la CLI
slug: cli
lang: es
description: La CLI de nera — crea, compila, previsualiza, actualiza y valida un sitio.
pagination_order: 7
---

# Referencia de la CLI

## La CLI `nera` (`@nera-static/nera`)

Un solo comando crea, compila, previsualiza, actualiza y valida un sitio. Crea
uno nuevo con:

```bash
npx @nera-static/nera new <project-name>
```

Un sitio creado depende de `@nera-static/nera`, así que ejecuta estos desde
dentro de él (el andamiaje también los enlaza a un script npm, p. ej.
`npm run dev`):

| Comando | Qué hace |
| --- | --- |
| `nera build` | Compila `pages/` → `public/` |
| `nera dev` | Compila + vista previa con recarga en vivo en `:3000` |
| `nera serve` | Sirve `public/` sin recompilar |
| `nera update` | Actualiza los paquetes Nera del sitio (`npm update`) |
| `nera validate` | Comprueba layouts, includes y YAML antes de publicar |

### Migrar un sitio antiguo (clonado)

Los sitios creados antes de la CLI eran clones de git que incluían el motor bajo
`src/`. Dentro de un sitio así, ejecuta `nera update --migrate` — añade la
dependencia `@nera-static/nera`, reescribe los scripts, elimina el motor `src/`
incluido e instala, dejando intactos tus `pages/`, `config/` y `theme/`.

## Comandos de publicación de plugins

Cada plugin que incluye plantillas expone un bin para copiar su Pug a
`views/vendor/`, p. ej.:

```bash
npx nera-navigation
npx nera-tags
npx nera-search --force   # overwrite existing published templates
```
