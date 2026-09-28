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
npm run build
```

## Alojarlo

- **Netlify / Vercel** — comando de compilación `npm run build`, directorio de
  publicación `public`.
- **GitHub Pages** — renderiza en CI, luego publica `public/` en la rama `gh-pages`.
- **Cualquier host estático / CDN** — sube el contenido de `public/`.

## Invalidación de caché

Los navegadores guardan en caché hojas de estilo, scripts y fuentes, así que
tras un despliegue los visitantes pueden seguir viendo el CSS o JS antiguo hasta
que fuercen una recarga. Activa el hashing de contenido en `config/app.yaml`
(requiere `@nera-static/core` 4.11 o posterior):

```yaml
asset_hashing: true
```

En cada compilación Nera añade `?v=<hash>` a cada URL de recurso local — hojas
de estilo, scripts, imágenes, `srcset`, el índice de búsqueda y las referencias
`url(…)` dentro del CSS, como las fuentes. El hash se calcula a partir del
contenido del archivo, así que una URL cambia exactamente cuando cambia su
archivo y sigue siendo cacheable en caso contrario. Tus plantillas mantienen
rutas simples como `/css/main.css`; nunca añadas `?v=` a mano.

Los enlaces a páginas, las URL externas y las URL que ya tienen una query string
no se modifican, y funciona junto con `base_path`. Sin la clave, la salida de la
compilación no cambia.

## Antes de lanzar

- Configura `app_origin` en `config/canonical-links.yaml` con tu dominio real para
  que las URL canónicas sean correctas.
- Añade un `.neraignore` en la raíz del proyecto para mantener los recursos solo
  de origen fuera de la compilación.

> `public/` se elimina y se reconstruye en cada renderizado — nunca lo edites a
> mano ni lo incluyas como origen en el control de versiones.
