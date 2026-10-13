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
`theme/views/vendor/plugin-navigation/`, donde puedes editarlas libremente.

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

Las tres claves de clase son opcionales, y los valores de arriba son sus valores por
defecto, así que este ejemplo se renderiza igual que uno sin ellas. `active_class` va en el
enlace a la página actual, y `active_path_class` en un enlace de sección —uno que apunta al
índice de una carpeta, como `/docs/index.html` o `/docs/`— cuando la página actual está en esa
carpeta o más abajo (la raíz del sitio nunca cuenta). `nav_class` es el nombre de bloque BEM del
que derivan las demás clases: `nav_class: mainmenu` renombra toda la familia a `.mainmenu`,
`.mainmenu--list`, `.mainmenu__item`, `.mainmenu__link`, `.mainmenu__link--active` y
`.mainmenu__link--active-path`. Las dos claves de estado solo sobrescriben su propia clase,
así que al renombrar, quítalas — tal como están arriba, se quedan en `nav__link--active`.

Cada entrada necesita un `href`: una sin él se omite con una advertencia, y el build se
completa igualmente.

> ¿Actualizas desde 2.x? Publicar omite una carpeta `theme/views/vendor/plugin-navigation/`
> ya existente, así que las plantillas antiguas se quedan y `nav_class` parece no hacer nada.
> Ejecuta `npx nera-navigation --force` una vez — sobrescribe esa carpeta, así que si
> editaste tu copia, guarda antes tus cambios y vuelve a aplicarlos.

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
include /vendor/plugin-navigation/partials/link-list-navigation

header.site-header
  if app.nav && app.nav.main
    nav.nav--main(aria-label='Menú principal')
      +linkListNav(app.nav.main.elements)
```

El plugin añade la clase activa de la sección 2 (`nav__link--active` por defecto) al enlace
que coincide con la página actual, y la clase de ruta activa (`nav__link--active-path`) al
enlace de la sección en la que está la página, de modo que dar estilo a la sección actual es
solo CSS. El `nav` con su `aria-label` convierte el menú en un punto de referencia de
navegación con nombre para los lectores de pantalla. La `/` inicial del include se resuelve
desde `theme/views/`, esté donde esté el archivo que lo incluye.

> ¿Prefieres una forma diferente? El plugin también incluye los partials `simple-navigation` y
> `pipe-separated-navigation` — los mismos datos, distinto markup.

Este sitio usa exactamente esta configuración para su cabecera y pie de página — consulta
`config/navigation.yaml` en el código fuente.
