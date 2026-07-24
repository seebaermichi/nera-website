---
layout: pages/tutorial.pug
title: Construye una navegación con estados activos
slug: custom-navigation
lang: es
description: Usa plugin-navigation para renderizar un menú de cabecera y pie de página, con la página actual resaltada.
keywords: nera navegación, plugin-navigation, menú activo, navegación de sitio estático
tags: plugins, navigation
pagination_order: 2
createdAt: 2026-07-20
---
`@nera-static/plugin-navigation` convierte una lista YAML en un menú de navegación y marca
el enlace de la página actual — sin necesidad de JavaScript.

## 1. Instala y publica la plantilla

```bash
npm install @nera-static/plugin-navigation
npx nera-navigation
```

El segundo comando copia las plantillas de navegación en
`views/vendor/plugin-navigation/`, donde puedes editarlas libremente.

## 2. Define el menú

Crea `config/navigation.yaml`. Un único menú plano se ve así:

```yaml
active_class: nav__link--active
active_path_class: nav__link--active-path
nav_class: nav

elements:
    - href: /index.html
      name: Home
    - href: /docs/index.html
      name: Docs
```

¿Necesitas más de un menú? Anídalos bajo nombres — cada uno se convierte en
`app.nav.<name>.elements`:

```yaml
elements:
    main:
        - href: /index.html
          name: Home
        - href: /docs/index.html
          name: Docs
    footer:
        - href: /about.html
          name: About
```

El plugin expone todo bajo `app.nav`.

## 3. Renderízalo en un layout

Incluye el partial publicado y llama a su mixin:

```pug
include ../vendor/plugin-navigation/partials/link-list-navigation

header.site-header
  if app.nav && app.nav.main
    +linkListNav(app.nav.main.elements, 'nav--main')
```

El plugin añade `nav__link--active` al enlace que coincide con la página actual y
`nav__link--active-path` a cualquier enlace ancestro, de modo que dar estilo a la sección actual
es solo CSS.

> ¿Prefieres una forma diferente? El plugin también incluye los partials `simple-navigation` y
> `pipe-separated-navigation` — los mismos datos, distinto markup.

Este sitio usa exactamente esta configuración para su cabecera y pie de página — consulta
`config/navigation.yaml` en el código fuente.
