---
layout: pages/tutorial.pug
title: Añadir enlaces anterior/siguiente entre páginas
slug: prev-next-pagination
lang: es
description: Usa plugin-page-pagination para enlazar páginas hermanas en orden de lectura.
keywords: nera paginación, plugin-page-pagination, enlaces anterior siguiente, navegación de docs
tags: plugins, pagination
pagination_order: 5
createdAt: 2026-07-17
---
`@nera-static/plugin-page-pagination` enlaza cada página con su anterior y siguiente
**hermana** — páginas en el mismo directorio — en un orden que tú controlas. Perfecto para
docs y tutoriales de varias partes.

## 1. Instalar y publicar la plantilla

```bash
npm install @nera-static/plugin-page-pagination
npx nera-page-pagination
```

## 2. Ordenar las páginas

Por defecto el plugin lee un número `pagination_order` de cada página:

```markdown
---
title: Getting started
pagination_order: 2
---
```

Las páginas se ordenan primero por `pagination_order`, luego por fecha de creación, luego por
ruta — así una página sin un orden explícito acaba en algún lugar estable.

> El orden puede empezar en `0` si lo deseas: el plugin trata `0` como un valor real,
> no como "ausente". Cambia el nombre de la clave en `config/page-pagination.yaml` con
> `order_property` si lo prefieres.

## 3. Renderizar los enlaces

El plugin añade `meta.pagePagination` con `.previous` y `.next`. Incluye la
plantilla publicada, protegida para que se oculte cuando no haya adónde ir:

```pug
if meta.pagePagination && (meta.pagePagination.previous || meta.pagePagination.next)
  include ../vendor/plugin-page-pagination/page-pagination
```

## Por qué importa "solo hermanas"

La paginación tiene alcance por directorio, así que `pages/docs/*.md` paginan entre ellas
y `pages/tutorials/*.md` entre ellas — nunca se mezclan. Pon
una secuencia en su propia carpeta y simplemente funciona. Las docs de este sitio usan exactamente esto.
