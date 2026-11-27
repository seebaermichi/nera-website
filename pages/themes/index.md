---
layout: pages/themes.pug
title: Themes
slug: themes
lang: en
description: The official @nera-static themes — four blog themes that share one contract.
keywords: nera themes, nera-static, static site generator themes, blog theme
themes:
    - name: Plain
      package: '@nera-static/theme-blog'
      audience: A plain, general-purpose blog — black on white, system fonts, dates in the margin.
      starters: [blog]
      demo: /themes/blog/plain/
      readme: https://github.com/seebaermichi/nera-theme-blog#readme
      image: /img/themes/plain.webp
      alt: The home page of the Plain demo blog
    - name: Stack
      package: '@nera-static/theme-stack'
      audience: A blog for developers, with series and highlighted code.
      starters: [stack]
      demo: /themes/blog/stack/
      readme: https://github.com/seebaermichi/nera-theme-stack#readme
      image: /img/themes/stack.webp
      alt: The home page of the Stack demo blog
    - name: Ansitz
      package: '@nera-static/theme-ansitz'
      audience: A photo blog that puts large photographs first.
      starters: [ansitz]
      demo: /themes/blog/ansitz/
      readme: https://github.com/seebaermichi/nera-theme-ansitz#readme
      image: /img/themes/ansitz.webp
      alt: The home page of the Ansitz demo photo blog
    - name: Umwege
      package: '@nera-static/theme-umwege'
      audience: A travel blog with trip facts, places and photographs.
      starters: [umwege]
      demo: /themes/blog/umwege/
      readme: https://github.com/seebaermichi/nera-theme-umwege#readme
      image: /img/themes/umwege.webp
      alt: The home page of the Umwege demo travel blog
---

A theme is an npm package with views and assets that your site's own files
override one by one. Plain, Stack, Ansitz and Umwege are made for blogs and share
one contract: a blog moves between them by changing `theme:` in
`config/app.yaml`. Each starter below creates a site on its theme with sample
pages. `@nera-static/theme-example` is the blueprint for a theme of your own; the
[Use a theme](/tutorials/use-a-theme.html) tutorial shows how themes work.
