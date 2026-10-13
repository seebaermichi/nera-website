---
layout: pages/tutorial.pug
title: Einen Blog mit Nera bauen
slug: build-a-blog
lang: de
description: Eine Website erstellen, Beiträge schreiben und sie mit plugin-simple-page-list auf der Startseite nach Datum auflisten, neueste zuerst.
keywords: nera blog tutorial, statischer blog, markdown blog, plugin-simple-page-list
tags: getting-started, blog, plugins
pagination_order: 1
createdAt: 2026-07-21
---
In diesem Tutorial erstellst du eine Nera-Website, schreibst zwei Beiträge und
machst die Startseite zur Blog-Übersicht, die sie nach Datum auflistet — neueste
zuerst. Jede Datei steht vollständig da, sodass du Schritt für Schritt mitmachen
kannst.

## 1. Website erstellen

```bash
npx @nera-static/nera new my-blog
cd my-blog
```

`nera new` legt die Website an und installiert ihre Abhängigkeiten. Du arbeitest
an drei Stellen: `pages/` für deine Inhalte (anfangs nur `pages/index.md`),
`theme/views/` für die Pug-Templates (`layouts/layout.pug` ist das HTML-Gerüst,
`pages/default.pug` rendert eine Seite hinein) und `config/` für Einstellungen.

## 2. Beiträge schreiben

Beiträge sind Markdown-Dateien in `pages/posts/`. Erstelle
`pages/posts/hello-world.md`:

```markdown
---
layout: pages/default.pug
title: Hello world
description: My first post.
createdAt: 2026-10-01
---

# Hello world

Welcome to my new Nera blog.
```

Und einen zweiten, `pages/posts/second-post.md`:

```markdown
---
layout: pages/default.pug
title: My second post
description: What I learned this week.
createdAt: 2026-10-08
---

# My second post

A week in, and the blog lists this post first.
```

Eine Seite wird nur gerendert, wenn sie ein `layout` angibt. `title` und
`description` erscheinen in der Liste, und `createdAt` ist das Datum des
Beitrags. Setze es immer: Fehlt es, nimmt Nera die Erstellungszeit der Datei, und
die ist nach einem frischen Checkout — etwa auf einem CI-Build-Server — bei jeder
Datei gleich, die Reihenfolge wäre also zufällig.

## 3. Beiträge auf der Startseite auflisten

`@nera-static/plugin-simple-page-list` sammelt die Seiten eines Ordners in einer
sortierten Liste. Installiere es und veröffentliche sein Template:

```bash
npm install @nera-static/plugin-simple-page-list
npx nera-simple-page-list
```

Nera findet das Plugin von selbst über deine `package.json`. Der zweite Befehl
kopiert das Template nach
`theme/views/vendor/plugin-simple-page-list/simple-page-list.pug`.

Sag dem Plugin, welchen Ordner es auflisten und wie es sortieren soll. Erstelle
`config/simple-page-list.yaml`:

```yaml
page_path: /posts
more_link_text: Read more
sortBy: date
sortOrder: descending
```

`page_path` ergibt eine flache Liste in `app.pageList` — mehr braucht ein Blog
mit nur einem Bereich nicht. `sortBy: date` liest das `date` eines Beitrags aus
dem Frontmatter und weicht auf `createdAt` aus, deine Beiträge werden also nach
den Daten sortiert, die du gerade gesetzt hast.

Jetzt ein Seiten-Template, das den Inhalt der Seite und darunter die Liste
rendert. Erstelle `theme/views/pages/blog.pug`:

```pug
extends ../layouts/layout

block content
  main
    != content
    include /vendor/plugin-simple-page-list/simple-page-list
```

Die beiden `content` haben nichts miteinander zu tun. `block content` füllt den
gleichnamigen Platzhalter in `layouts/layout.pug`. `!= content` gibt den Markdown
der Seite aus, den Nera schon zu HTML gerendert hat; `!=` lässt ihn unmaskiert,
sodass er als Markup ankommt. Der führende Schrägstrich lässt den Include-Pfad
bei `theme/views/` beginnen, egal wo das Template liegt.

Zum Schluss soll die Startseite es verwenden. Ersetze `pages/index.md` durch:

```markdown
---
layout: pages/blog.pug
title: My blog
description: Notes and posts, newest first.
---

# My blog

Welcome! Here is everything I have written so far.
```

Das ist das Template, das du veröffentlicht hast — du kannst es frei anpassen:

```pug
//- Handles both shapes `getAppData` can produce:
//-   flat    — `app.pageList` is an array          (config uses `page_path`)
//-   grouped — `app.pageList` is keyed by path     (config uses `page_paths`)
//- The flat branch emits exactly the markup this template has always emitted,
//- so published copies keep rendering identically.
mixin pageListItems(pages)
    each page in pages
        article.page-list__item
            header.page-list__header
                h3.page-list__item-title
                    a.page-list__link(href=page.href) #{page.title}
            if page.description
                p.page-list__description #{page.description}
            footer.page-list__footer
                a.page-list__more-link(href=page.href) #{page.moreLinkText}

-
    var pageList = app.pageList
    var isFlat = Array.isArray(pageList)
    var groups = []

    if (isFlat) {
        groups = pageList.length ? [{ key: null, pages: pageList }] : []
    } else if (pageList && typeof pageList === 'object') {
        groups = Object.keys(pageList)
            .filter(function (key) {
                return Array.isArray(pageList[key]) && pageList[key].length > 0
            })
            .map(function (key) {
                return { key: key, pages: pageList[key] }
            })
    }

if groups.length > 0
    section.page-list
        h2.page-list__title Recent Pages
        if isFlat
            +pageListItems(groups[0].pages)
        else
            each group in groups
                div.page-list__group
                    h3.page-list__group-title #{group.key}
                    +pageListItems(group.pages)
```

Jeder Beitrag wird ein `article` mit Titel, Beschreibung und einem
„Read more“-Link, unter der Überschrift „Recent Pages“. Um die Überschrift oder das
Markup zu ändern, bearbeite diese Datei — sie ist jetzt deine Kopie. Ein erneutes
`npx nera-simple-page-list` überspringt den Ordner, weil er schon existiert;
`npx nera-simple-page-list --force` überschreibt ihn mit der mitgelieferten
Version und verwirft deine Änderungen.

Du willst die Liste lieber selbst schreiben? Sieh dir
[Schreibe dein eigenes lokales Plugin](/de/tutorials/write-a-local-plugin.html) an.

## 4. Ausbauen

- **Tags:** Gib Beiträgen `tags:` und erhalte eine Seite pro Tag mit
  [Tagge deine Inhalte](/de/tutorials/tag-your-content.html).
- **Vor-/Zurück-Links:** Verknüpfe jeden Beitrag mit seinen Nachbarn in
  `pages/posts/` mit
  [Vor-/Zurück-Links zwischen Seiten hinzufügen](/de/tutorials/prev-next-pagination.html).
- **Sitemap:** Setze den Origin deiner Website wie in
  [Canonical-Links für SEO hinzufügen](/de/tutorials/canonical-links-seo.html) und
  füge dann `@nera-static/plugin-sitemap` aus dem
  [Plugin-Katalog](/de/plugins/index.html) hinzu.
- **Bilder und Code:** `@nera-static/plugin-images` (responsive Bilder) und
  `@nera-static/plugin-code-blocks` (Syntax-Highlighting) findest du ebenfalls im
  [Plugin-Katalog](/de/plugins/index.html).

## 5. Vorschau und Build

```bash
npm run dev
```

Öffne `http://localhost:3000`: Die Startseite listet „My second post“ über „Hello
world“, und jeder Titel verlinkt auf seinen Beitrag. Die Vorschau baut neu, sobald
du eine Datei speicherst.

Wenn du veröffentlichen willst, baue die Website einmal:

```bash
npm run build
```

Der fertige Blog liegt in `public/` — lade diesen Ordner auf einen beliebigen
statischen Host hoch.
