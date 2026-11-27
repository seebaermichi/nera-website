---
layout: pages/themes.pug
title: Themes
slug: themes
lang: de
description: Die offiziellen @nera-static-Themes — vier Blog-Themes mit einem gemeinsamen Vertrag und ein Theme für Unternehmen und Portfolios.
keywords: nera themes, nera-static, Static-Site-Generator-Themes, Blog-Theme
themes:
    - name: Plain
      package: '@nera-static/theme-blog'
      audience: Ein schlichtes Blog für alles — schwarz auf weiß, Systemschriften, Datum am Rand.
      starters: [blog]
      demo: /themes/blog/plain/
      readme: https://github.com/seebaermichi/nera-theme-blog#readme
      image: /img/themes/plain.webp
      alt: Die Startseite des Plain-Demo-Blogs
    - name: Stack
      package: '@nera-static/theme-stack'
      audience: Ein Blog für Entwickler, mit Serien und hervorgehobenem Code.
      starters: [stack]
      demo: /themes/blog/stack/
      readme: https://github.com/seebaermichi/nera-theme-stack#readme
      image: /img/themes/stack.webp
      alt: Die Startseite des Stack-Demo-Blogs
    - name: Ansitz
      package: '@nera-static/theme-ansitz'
      audience: Ein Fotoblog, das große Fotografien in den Vordergrund stellt.
      starters: [ansitz]
      demo: /themes/blog/ansitz/
      readme: https://github.com/seebaermichi/nera-theme-ansitz#readme
      image: /img/themes/ansitz.webp
      alt: Die Startseite des Ansitz-Demo-Fotoblogs
    - name: Umwege
      package: '@nera-static/theme-umwege'
      audience: Ein Reiseblog mit Reisedaten, Orten und Fotografien.
      starters: [umwege]
      demo: /themes/blog/umwege/
      readme: https://github.com/seebaermichi/nera-theme-umwege#readme
      image: /img/themes/umwege.webp
      alt: Die Startseite des Umwege-Demo-Reiseblogs
    - name: Business
      package: '@nera-static/theme-business'
      audience: Eine Website für ein kleines Unternehmen oder ein Portfolio, mit Leistungen, Öffnungszeiten und Kontaktformular.
      starters: [business, portfolio]
      readme: https://github.com/seebaermichi/nera-theme-business#readme
      image: /img/themes/business.webp
      alt: Die Startseite der Business-Starter-Website
---

Ein Theme ist ein npm-Paket mit Views und Assets, die die eigenen Dateien deiner
Website einzeln überschreiben. Plain, Stack, Ansitz und Umwege sind für Blogs
gemacht und teilen einen Vertrag: Ein Blog wechselt zwischen ihnen, indem du
`theme:` in `config/app.yaml` änderst. Jeder Starter unten legt eine Website auf
seinem Theme mit Beispielseiten an. `@nera-static/theme-example` ist die Vorlage
für ein eigenes Theme; das Tutorial
[Ein Theme verwenden und anpassen](/de/tutorials/use-a-theme.html) zeigt, wie
Themes funktionieren.
