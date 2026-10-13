---
layout: pages/tutorial.pug
title: Abrir enlaces externos en una pestaña nueva
slug: external-links-new-tab
lang: es
description: Usa plugin-link-attributes para añadir target y rel automáticamente a los enlaces salientes.
keywords: nera enlaces externos, plugin-link-attributes, target blank, noopener
tags: plugins, links
pagination_order: 6
createdAt: 2026-07-16
---
`@nera-static/plugin-link-attributes` posprocesa tu HTML renderizado y añade
atributos a los enlaces salientes — de modo que cada enlace externo se abre en una pestaña nueva, de forma segura,
sin que tengas que tocar el Markdown.

## 1. Instalar

```bash
npm install @nera-static/plugin-link-attributes
```

No hay plantilla que publicar — este plugin solo transforma el contenido. Su único ajuste
vive en un archivo de configuración.

## 2. Configurar

`config/link-attributes.yaml` lista los atributos a añadir. La forma rápida de obtenerlo
es el comando del propio plugin, que escribe los valores por defecto que ves abajo:

```bash
npx nera-link-attributes
```

Si el archivo ya existe, lo deja tal cual, así que volver a ejecutarlo nunca sobrescribe tus
cambios; `npx nera-link-attributes --force` lo reemplaza por una copia nueva. También puedes
escribir el archivo a mano:

```yaml
attributes:
    - target="_blank"
    - rel="noopener noreferrer"
```

Sin ningún atributo en `attributes`, el plugin deja tus páginas sin cambios — sin archivo,
no hay pestañas nuevas.

El plugin apunta solo a los enlaces cuyo `href` empieza por `http` o `www`, así que tus
enlaces internos (`/docs/...`) quedan intactos, y nunca se sobrescribe un atributo que el
enlace ya tenga. Vale la pena conservar el `rel="noopener noreferrer"` — cierra el agujero
de tab-nabbing que abre un `target="_blank"` a secas.

## 3. El único inconveniente: enlaces del layout

El plugin reescribe los enlaces dentro de tu **contenido Markdown**, no los enlaces que escribes
directamente en los layouts Pug (un botón "GitHub" en la cabecera, un enlace en el pie). Añade los mismos
atributos a esos a mano:

```pug
a.site-header__cta(href=app.repo_url, target="_blank", rel="noopener noreferrer") GitHub
```

Renderiza, y cada enlace saliente — en el contenido y en tu layout — se abre en una pestaña
nueva. Este sitio hace exactamente esto; prueba cualquier enlace de GitHub.
