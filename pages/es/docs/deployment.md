---
layout: pages/docs.pug
title: Despliegue
slug: deployment
lang: es
description: Compilar el sitio y alojar la carpeta public/.
pagination_order: 6
---

# Despliegue

Nera produce una simple carpeta `public/` — despliégala en cualquier lugar que
sirva archivos estáticos.

## Compilar

```bash
npm run render
```

## Alojarlo

- **Netlify / Vercel** — comando de compilación `npm run render`, directorio de
  publicación `public`.
- **GitHub Pages** — renderiza en CI, luego publica `public/` en la rama `gh-pages`.
- **Cualquier host estático / CDN** — sube el contenido de `public/`.

## Antes de lanzar

- Configura `app_origin` en `config/canonical-links.yaml` con tu dominio real para
  que las URL canónicas sean correctas.
- Añade un `.neraignore` en la raíz del proyecto para mantener los recursos solo
  de origen fuera de la compilación.

> `public/` se elimina y se reconstruye en cada renderizado — nunca lo edites a
> mano ni lo incluyas como origen en el control de versiones.
