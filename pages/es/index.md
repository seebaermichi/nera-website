---
layout: pages/home.pug
title: Inicio
slug: home
lang: es
description: Nera es un generador de sitios estáticos ligero y basado en plugins. Escribe Markdown, maqueta con Pug y amplía con plugins pequeños y específicos.
keywords: nera, generador de sitios estáticos, ssg, markdown, pug, node
---

## Por qué Nera

Nera convierte una carpeta de Markdown en un sitio estático rápido. Sin ataduras a un
framework, sin una cadena de herramientas pesada — una canalización de cuatro etapas
que puedes entender en una tarde, y un sistema de plugins donde cada función es un
paquete pequeño y específico que decides añadir.

### Markdown entra, HTML sale
Escribe el contenido en Markdown con frontmatter YAML. Nera renderiza cada página a
través de una plantilla Pug que tú controlas y escribe HTML limpio y rápido en
`public/`.

### Plugins, no magia
Navegación, etiquetas, búsqueda, paginación, enlaces canónicos y más se distribuyen
como paquetes `@nera-static/plugin-*` independientes. Instala lo que necesites e
ignora el resto.

### Plantillas que son tuyas
Publica las plantillas Pug de un plugin en `views/vendor/` y dales estilo con tu
propio CSS. Nada queda oculto dentro de `node_modules`, fuera de tu alcance.

### Sin paso de compilación
Ningún bundler que configurar. `npm run render` construye el sitio; `npm run dev` te
da una vista previa con recarga en vivo. Node ≥ 18, y esa es toda la historia de
dependencias.
