---
layout: pages/default.pug
title: Acerca de
slug: about
lang: es
description: Qué es Nera, su filosofía y cómo participar.
keywords: acerca de nera, filosofía del generador de sitios estáticos
---

# Acerca de Nera

Nera es un generador de sitios estáticos de código abierto con una superficie
deliberadamente pequeña. Toda la canalización — cargar, renderizar, aplicar
plugins, escribir — cabe en un puñado de archivos que puedes leer de una sentada.

## Filosofía

- **Transparente en lugar de mágico.** Sin convenciones ocultas; una página se
  renderiza porque su frontmatter así lo indica.
- **Componible en lugar de monolítico.** Las funciones viven en pequeños paquetes
  `@nera-static/plugin-*` que eliges usar.
- **Tuyo para poseer.** Las plantillas se publican en tu proyecto para que puedas
  darles estilo y editarlas directamente.

## Participar

Nera y sus plugins se desarrollan de forma abierta en
[GitHub](https://github.com/seebaermichi/nera). Los issues, las ideas y los pull
requests son bienvenidos — consulta el catálogo de plugins en la página
[Plugins](/es/plugins/index.html).

## Este sitio

Este sitio web está construido con Nera, usando `plugin-navigation`,
`plugin-tags`, `plugin-search`, `plugin-page-pagination` y
`plugin-canonical-links` — más un pequeño plugin local para la lista de
tutoriales.
