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
npx nera add link-attributes
```

`nera add` instala el paquete y copia su `config/link-attributes.yaml`
predeterminado a tu sitio. No hay plantilla que publicar — este plugin solo
transforma el contenido, y su único ajuste vive en ese archivo.

## 2. Configurar

`config/link-attributes.yaml`, el archivo que copió `nera add`, lista los atributos
a añadir:

```yaml
attributes:
    - target="_blank"
    - rel="noopener noreferrer"
```

Estos valores por defecto son justo lo que quiere este tutorial, así que puedes
dejar el archivo tal cual. Volver a ejecutar `nera add` conserva tus cambios; para
recuperar los valores por defecto, el comando del propio plugin,
`npx nera-link-attributes --force`, reemplaza el archivo por una copia nueva.

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
