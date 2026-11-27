---
layout: pages/themes.pug
title: Temas
slug: themes
lang: es
description: Los temas oficiales de @nera-static — cuatro temas de blog que comparten un contrato.
keywords: nera temas, nera-static, temas de generador de sitios estáticos, tema de blog
themes:
    - name: Plain
      package: '@nera-static/theme-blog'
      audience: Un blog sencillo para todo — negro sobre blanco, fuentes del sistema, fechas en el margen.
      starters: [blog]
      demo: /themes/blog/plain/
      readme: https://github.com/seebaermichi/nera-theme-blog#readme
      image: /img/themes/plain.webp
      alt: La página de inicio del blog de demostración Plain
    - name: Stack
      package: '@nera-static/theme-stack'
      audience: Un blog para desarrolladores, con series y código resaltado.
      starters: [stack]
      demo: /themes/blog/stack/
      readme: https://github.com/seebaermichi/nera-theme-stack#readme
      image: /img/themes/stack.webp
      alt: La página de inicio del blog de demostración Stack
    - name: Ansitz
      package: '@nera-static/theme-ansitz'
      audience: Un blog de fotografía que pone las fotos grandes en primer plano.
      starters: [ansitz]
      demo: /themes/blog/ansitz/
      readme: https://github.com/seebaermichi/nera-theme-ansitz#readme
      image: /img/themes/ansitz.webp
      alt: La página de inicio del blog de fotografía de demostración Ansitz
    - name: Umwege
      package: '@nera-static/theme-umwege'
      audience: Un blog de viajes con datos del viaje, lugares y fotografías.
      starters: [umwege]
      demo: /themes/blog/umwege/
      readme: https://github.com/seebaermichi/nera-theme-umwege#readme
      image: /img/themes/umwege.webp
      alt: La página de inicio del blog de viajes de demostración Umwege
---

Un tema es un paquete npm con vistas y recursos que los archivos propios de tu
sitio sobrescriben uno a uno. Plain, Stack, Ansitz y Umwege están hechos para
blogs y comparten un contrato: un blog pasa de uno a otro cambiando `theme:` en
`config/app.yaml`. Cada starter de abajo crea un sitio sobre su tema con páginas
de ejemplo. `@nera-static/theme-example` es el modelo para un tema propio; el
tutorial [Usar y personalizar un tema](/es/tutorials/use-a-theme.html) muestra
cómo funcionan los temas.
