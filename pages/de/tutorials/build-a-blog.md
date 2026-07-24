---
layout: pages/tutorial.pug
title: Einen Blog mit Nera bauen
slug: build-a-blog
lang: de
description: Eine Website erstellen, Beiträge hinzufügen und sie mit einem lokalen Plugin nach Datum auflisten.
keywords: nera blog tutorial, statischer blog, markdown blog
tags: getting-started, blog, plugins
pagination_order: 1
createdAt: 2026-07-21
---
In diesem Tutorial erstellst du eine Nera-Website, fügst ein paar Beiträge hinzu und
listest sie auf einer Übersichtsseite nach Datum (neueste zuerst) auf.

## 1. Website erstellen

```bash
npx @nera-static/nera new my-blog
cd my-blog
```

## 2. Beiträge hinzufügen

Erstelle `pages/posts/hello-world.md`:

```markdown
---
layout: pages/default.pug
title: Hallo Welt
description: Mein erster Beitrag.
---

# Hallo Welt

Willkommen in meinem neuen Nera-Blog.
```

## 3. Beiträge auflisten

Ein kleines lokales Plugin unter `src/plugins/` kann jeden Beitrag in `app.posts`
sammeln, sortiert nach `meta.createdAt`. Dein Übersichts-Layout iteriert dann über
diese Liste. (Genau das macht diese Website für ihre Tutorials — siehe
`src/plugins/tutorials-list`.)

## 4. Vorschau

```bash
npm run dev
```

Das ist ein funktionierender Blog. Von hier aus kannst du
[Tags](/de/tutorials/add-search.html) oder Pagination ergänzen, um ihn auszubauen.
