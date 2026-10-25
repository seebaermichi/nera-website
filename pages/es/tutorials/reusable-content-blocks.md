---
layout: pages/tutorial.pug
title: Bloques de contenido reutilizables con plugin-stacks
slug: reusable-content-blocks
lang: es
description: Escribe secciones una vez en Markdown y colócalas en cualquier vista con plugin-stacks, como bloques sueltos o como grupos de stacks ordenados por idioma.
keywords: nera stacks, plugin-stacks, contenido reutilizable, bloques de contenido, grupos de stacks, cuadrícula de características
tags: plugins, stacks
pagination_order: 9
createdAt: 2026-10-23
---
Hay contenido que no pertenece a ninguna página concreta: una llamada a la
acción bajo cada artículo, un recuadro de newsletter, la cuadrícula de
características de una página de inicio. `@nera-static/plugin-stacks` te
permite escribir ese bloque una sola vez, como archivo Markdown en `pages/`, y
colocarlo en cualquier vista a través de `app.stacks`. Varios bloques que forman
una misma sección se convierten en un **grupo de stacks**, ordenado y separado
por idioma.

## 1. Instalar

```bash
npm install @nera-static/plugin-stacks
```

Nera encuentra el plugin por sí solo. No necesita archivo de configuración:
los stacks se definen en el frontmatter.

## 2. Qué convierte una página en un stack

Un stack es un archivo Markdown bajo `pages/` cuyo frontmatter define
**`type: stack`** y un `slug` o un `title`. Dónde esté el archivo no importa.
Una carpeta `pages/stacks/` simplemente mantiene juntos los bloques:

```markdown:pages/stacks/newsletter.md
---
type: stack
title: Newsletter signup
---
Get **one email a month** with what changed.
```

Fíjate en lo que falta: **`layout`**. Nera solo escribe una página en
`public/` si su frontmatter tiene un layout, así que un stack sin layout sigue
siendo un fragmento que otras páginas incrustan, no una página propia.
`nera validate` y `nera build --check` lo saben: desde
`@nera-static/validate` 1.6.1 ya no avisan `layout-missing` para una página
con `type: stack`.

## 3. Usar un stack suelto

Cada stack acaba en `app.stacks`, con su slug como clave, y con la misma forma
`{ content, meta }` que una página: `content` es el HTML renderizado, `meta`
todo el frontmatter. Sin un `slug` explícito, la clave es el título en
minúsculas, con los espacios sustituidos por **guiones bajos**:
`Newsletter signup` pasa a ser `newsletter_signup`.

Colócalo en una vista, con una comprobación para que un stack que falte no
rompa la página:

```pug:theme/views/pages/default.pug
extends ../layouts/layout

block content
  main#main
    != content
    if app.stacks.newsletter_signup
      aside.newsletter!= app.stacks.newsletter_signup.content
```

El `aside` contiene entonces
`<p>Get <strong>one email a month</strong> with what changed.</p>`.

Solo se sustituyen los espacios: un título con signos de puntuación produce
una clave que el acceso con punto no puede leer. Define un `slug` explícito
para esos títulos, o siempre que quieras una clave que no cambie cuando cambie
el título. Los slugs forman un único espacio de nombres para todo el sitio; si
dos stacks acaban con el mismo, gana el último y el plugin avisa.

## 4. Renderizar un stack con una plantilla

Un stack puede traer su propio marcado. Publica la plantilla por defecto del
plugin:

```bash
npx nera-stacks
```

Acaba en `theme/views/vendor/plugin-stacks/stack-template.pug`. Apunta un
stack a ella con **`stack_layout`**, una ruta desde la **raíz del proyecto**
(donde ejecutas `nera build`), no desde la carpeta de vistas:

```markdown:pages/stacks/call-to-action.md
---
type: stack
slug: call_to_action
title: Ready to start?
description: One command scaffolds a site.
stack_layout: theme/views/vendor/plugin-stacks/stack-template.pug
---
Run `npx @nera-static/nera new my-site` and you are live in minutes.
```

`app.stacks.call_to_action.content` contiene ahora la salida de la plantilla,
no el Markdown sin más:

```html
<section class="stack">
  <header class="stack__header">
    <h2 class="stack__title">Ready to start?</h2>
    <p class="stack__description">One command scaffolds a site.</p>
  </header>
  <article class="stack__content">
    <p>Run <code>npx @nera-static/nera new my-site</code> and you are live in minutes.</p>
  </article>
</section>
```

La plantilla lee el stack como `stack.meta` y `stack.content`, así que puedes
editar tu copia o escribir la tuya. Las clases BEM son el contrato público del
plugin: dales estilo desde tu CSS. La publicación se salta una carpeta que ya
existe, así que tras actualizar el plugin `npx nera-stacks --force` trae la
nueva plantilla y sobrescribe tus cambios.

## 5. Grupos de stacks

Una cuadrícula de características es una *lista* de bloques. Da a cada bloque
su propia página de stack, ponlos en el mismo **`stack_group`** y fija su
orden con **`stack_order`**:

```markdown:pages/stacks/home-features/01-markdown.md
---
type: stack
stack_group: home_features
stack_order: 1
lang: en
title: Markdown in, HTML out
---
Author content in Markdown with YAML frontmatter.
```

El plugin añade entonces dos claves:

- **`app.stackGroups[<group>]`** — todos los stacks del grupo, en orden.
- **`app.stackGroupsByLang[<group>][<lang>]`** — lo mismo, separado por
  `lang`. Un stack sin `lang` cuenta como el `app.lang` del sitio.

Cada entrada vuelve a ser `{ content, meta }`, así que una vista la recorre:

```pug
- const features = app.stackGroupsByLang?.home_features?.[meta.lang || app.lang] || []
each feature in features
  .feature
    h2.feature__title #{ feature.meta.title }
    .feature__body!= feature.content
```

En un sitio de un solo idioma basta con
`each feature in app.stackGroups.home_features || []`.

Los stacks con un `stack_order` numérico van primero, en orden ascendente; el
resto les sigue en el orden de construcción. Un stack agrupado no necesita ni
`slug` ni `title`, y se queda **fuera de `app.stacks`** salvo que defina un
`slug` explícito. En un sitio de prueba con tres stacks agrupados, de los que
solo uno tenía `slug: feature_plugins`, `app.stacks` contenía exactamente ese
junto a los dos stacks sin grupo: `call_to_action`, `feature_plugins`,
`newsletter_signup`. Así la misma sección en tres idiomas no choca por claves
derivadas del título.

## 6. Un ejemplo real: la cuadrícula de este sitio

Los cuatro recuadros de la [página de inicio de nera.js.org](/es/index.html)
son un grupo de stacks. Cada recuadro es un archivo en
`pages/es/stacks/home-features/`, con las traducciones en
`pages/stacks/home-features/` y `pages/de/stacks/home-features/`:

```markdown:pages/es/stacks/home-features/01-markdown.md
---
type: stack
stack_group: home_features
stack_order: 1
lang: es
title: Markdown entra, HTML sale
---

Escribe el contenido en Markdown con frontmatter YAML. Nera renderiza cada página con una plantilla Pug que tú controlas y escribe HTML limpio.
```

La vista de la página de inicio elige los recuadros del idioma actual y los
numera según su posición en la lista:

```pug:theme/views/pages/home.pug
- const features = app.stackGroupsByLang?.home_features?.[curLang] || []
if features.length
  .home-body__grid
    each feature, i in features
      .home-body__feature
        p.home-body__feature-num #{ String(i + 1).padStart(2, '0') }
        h2.home-body__feature-title #{ feature.meta.title }
        .home-body__feature-desc!= feature.content
```

`curLang` se define en el layout base del sitio a partir de `meta.lang`.
Añadir un quinto recuadro es un archivo Markdown nuevo por idioma, sin cambiar
la vista.

## 7. Trampa: las páginas de stack siguen siendo páginas

Un stack no tiene layout, así que nunca se construye, pero sigue en la lista
de páginas que ve cualquier otro plugin. En un sitio de prueba con stacks en
`pages/stacks/`, los plugins se comportaron así:

| plugin | ¿ve las páginas de stack? | qué hacer |
|---|---|---|
| `plugin-search` | no — las páginas sin `layout` quedan fuera del índice | nada |
| `plugin-page-pagination` | no — una página sin `layout` nunca es destino de anterior/siguiente | nada |
| `plugin-navigation` | no — solo lista los `href` de `config/navigation.yaml` | nada |
| `plugin-statistics` | **sí** — cuenta cada archivo Markdown bajo `pages/` | mantener las claves contadas (`tags`, `category`, …) fuera de las páginas de stack |
| `plugin-simple-page-list` | **sí** — con `page_path: /stacks`, listó cada stack con un `href` como `/stacks/newsletter.html` que nunca se construyó | mantener los stacks fuera de las carpetas listadas, o excluirlos con `exclude_pages` |

Las entradas de `exclude_pages` usan la URL que tendría el stack como página:

```yaml:config/simple-page-list.yaml
page_path: /blog
exclude_pages:
    - /blog/newsletter.html
```

Una carpeta propia, como `pages/stacks/`, es la solución más sencilla: ninguna
ruta listada coincide con ella, así que no hay nada que excluir.

## Siguiente

[Cómo está construido este sitio web](/es/tutorials/how-this-site-is-built.html)
muestra cómo plugin-stacks trabaja junto con los demás plugins de este sitio.
Para unir secciones enteras en una sola página con scroll, consulta
[Construye un sitio de una sola página](/es/tutorials/one-page-site.html).
