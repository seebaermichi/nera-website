---
layout: pages/docs.pug
title: Introducción
slug: docs
lang: es
description: Qué es Nera, cómo funciona y adónde ir después.
pagination_order: 1
---

# Documentación

Nera es un generador de sitios estáticos ligero, construido sobre una idea sencilla:
**Markdown entra, HTML sale, y plugins para todo lo demás.** Esta guía te lleva de
una carpeta vacía a un sitio publicado.

## La estructura de un proyecto Nera

```
my-site/
├── config/          # app.yaml + un <plugin>.yaml por plugin
├── pages/           # tu contenido en Markdown
├── theme/
│   ├── views/       # layouts y plantillas de página Pug (vendor/ guarda las de los plugins)
│   └── assets/      # CSS, JS, imágenes, fuentes — copiados tal cual a public/
├── src/plugins/     # plugins locales opcionales, uno por carpeta
├── public/          # salida generada (nunca editar a mano)
├── AGENTS.md        # instrucciones para asistentes de IA (CLAUDE.md apunta a él)
└── package.json     # una sola dependencia de Nera: @nera-static/nera
```

`nera new` crea todo esto salvo `src/plugins/` y `public/`. Los plugins locales
pueden vivir en otra carpeta, indicada con `folders.plugins` en
`config/app.yaml`. Los sitios anteriores al sistema de temas tienen `views/` y
`assets/` en la raíz del proyecto; Nera los sigue construyendo, con un aviso de
obsolescencia, hasta que muevas ambas carpetas a `theme/`.

## Cómo una página se convierte en HTML

1. **Cargar** `config/app.yaml` en el objeto `app` y listar `pages/`.
2. **Renderizar** cada archivo Markdown, extrayendo el frontmatter a `meta`.
3. **Aplicar plugins**, que enriquecen `app` y `meta`.
4. **Escribir** `public/`, pasando cada página por su `layout`.

> Una página solo se renderiza si su frontmatter define un `layout`. Las páginas sin
> él se omiten silenciosamente — es la causa más común de «¿por qué falta mi página?».
> `npx nera validate` las enumera (`layout-missing`).

Continúa en **Primeros pasos** para crear tu primer sitio.
