---
layout: pages/tutorial.pug
title: Wiederverwendbare Inhaltsblöcke mit plugin-stacks
slug: reusable-content-blocks
lang: de
description: Abschnitte einmal in Markdown schreiben und mit plugin-stacks in jede View setzen, als einzelne Blöcke oder als geordnete Stack-Gruppen je Sprache.
keywords: nera Stacks, plugin-stacks, wiederverwendbare Inhalte, Inhaltsblöcke, Stack-Gruppen, Feature-Raster
tags: plugins, stacks
pagination_order: 9
createdAt: 2026-10-23
---
Manche Inhalte gehören zu keiner einzelnen Seite: ein Call to Action unter
jedem Artikel, eine Newsletter-Box, das Feature-Raster auf einer Startseite.
`@nera-static/plugin-stacks` lässt dich so einen Block einmal schreiben, als
Markdown-Datei in `pages/`, und ihn über `app.stacks` in jede View setzen.
Mehrere Blöcke, die zusammen einen Abschnitt bilden, werden zu einer
**Stack-Gruppe**, geordnet und nach Sprache aufgeteilt.

## 1. Installieren

```bash
npm install @nera-static/plugin-stacks
```

Nera findet das Plugin von selbst. Es braucht keine Konfigurationsdatei:
Stacks werden im Frontmatter definiert.

## 2. Was eine Seite zum Stack macht

Ein Stack ist eine Markdown-Datei unter `pages/`, deren Frontmatter
**`type: stack`** und einen `slug` oder einen `title` setzt. Wo die Datei
liegt, spielt keine Rolle. Ein Ordner `pages/stacks/` hält die Blöcke einfach
beisammen:

```markdown:pages/stacks/newsletter.md
---
type: stack
title: Newsletter signup
---
Get **one email a month** with what changed.
```

Beachte, was fehlt: **`layout`**. Nera schreibt eine Seite nur dann nach
`public/`, wenn ihr Frontmatter ein Layout hat. Ein Stack ohne Layout bleibt
also ein Fragment, das andere Seiten einbetten, keine eigene Seite.
`nera validate` und `nera build --check` wissen das: Seit
`@nera-static/validate` 1.6.1 warnen sie bei einer Seite mit `type: stack`
nicht mehr `layout-missing`.

## 3. Einen einzelnen Stack verwenden

Jeder Stack landet in `app.stacks`, unter seinem Slug als Schlüssel, in
derselben Form `{ content, meta }` wie eine Seite: `content` ist das
gerenderte HTML, `meta` das ganze Frontmatter. Ohne expliziten `slug` ist der
Schlüssel der Titel in Kleinbuchstaben, Leerzeichen durch **Unterstriche**
ersetzt: Aus `Newsletter signup` wird `newsletter_signup`.

Setze ihn in eine View, abgesichert, damit ein fehlender Stack die Seite nicht
kaputt macht:

```pug:theme/views/pages/default.pug
extends ../layouts/layout

block content
  main#main
    != content
    if app.stacks.newsletter_signup
      aside.newsletter!= app.stacks.newsletter_signup.content
```

Das `aside` enthält dann
`<p>Get <strong>one email a month</strong> with what changed.</p>`.

Ersetzt werden nur Leerzeichen: Ein Titel mit Satzzeichen ergibt einen
Schlüssel, den der Punktzugriff nicht lesen kann. Setze für solche Titel einen
expliziten `slug`, oder immer dann, wenn der Schlüssel sich nicht mit dem
Titel ändern soll. Slugs bilden einen Namensraum für die ganze Website; haben
zwei Stacks am Ende denselben, gewinnt der spätere, und das Plugin warnt.

## 4. Einen Stack über ein Template rendern

Ein Stack kann sein eigenes Markup mitbringen. Veröffentliche das
Standard-Template des Plugins:

```bash
npx nera-stacks
```

Es landet in `theme/views/vendor/plugin-stacks/stack-template.pug`. Verweise
einen Stack mit **`stack_layout`** darauf, mit einem Pfad vom
**Projektverzeichnis** aus (dort, wo du `nera build` ausführst), nicht vom
Views-Ordner:

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

`app.stacks.call_to_action.content` enthält jetzt die Ausgabe des Templates,
nicht das blanke Markdown:

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

Das Template liest den Stack als `stack.meta` und `stack.content`, du kannst
deine Kopie also anpassen oder ein eigenes schreiben. Die BEM-Klassen sind der
öffentliche Vertrag des Plugins: Gestalte sie aus deinem CSS. Das
Veröffentlichen überspringt einen Ordner, der schon existiert. Nach einem
Plugin-Update holt `npx nera-stacks --force` das neue Template und
überschreibt deine Änderungen.

## 5. Stack-Gruppen

Ein Feature-Raster ist eine *Liste* von Blöcken. Gib jedem Block eine eigene
Stack-Seite, stecke sie in dieselbe **`stack_group`** und lege ihre
Reihenfolge mit **`stack_order`** fest:

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

Das Plugin fügt dann zwei Schlüssel hinzu:

- **`app.stackGroups[<group>]`** — alle Stacks der Gruppe, in Reihenfolge.
- **`app.stackGroupsByLang[<group>][<lang>]`** — dasselbe, nach `lang`
  aufgeteilt. Ein Stack ohne `lang` zählt als `app.lang` der Website.

Jeder Eintrag ist wieder `{ content, meta }`, eine View läuft also darüber:

```pug
- const features = app.stackGroupsByLang?.home_features?.[meta.lang || app.lang] || []
each feature in features
  .feature
    h2.feature__title #{ feature.meta.title }
    .feature__body!= feature.content
```

Auf einer einsprachigen Website reicht
`each feature in app.stackGroups.home_features || []`.

Stacks mit numerischer `stack_order` kommen zuerst, aufsteigend; die übrigen
folgen in Build-Reihenfolge. Ein gruppierter Stack braucht weder `slug` noch
`title`, und er bleibt **außerhalb von `app.stacks`**, es sei denn, er setzt
einen expliziten `slug`. In einer Test-Website mit drei gruppierten Stacks,
von denen nur einer `slug: feature_plugins` hatte, enthielt `app.stacks` genau
diesen einen neben den zwei ungruppierten Stacks: `call_to_action`,
`feature_plugins`, `newsletter_signup`. So kollidiert derselbe Abschnitt in
drei Sprachen nicht über aus dem Titel abgeleitete Schlüssel.

## 6. Ein echtes Beispiel: das Feature-Raster dieser Website

Die vier Kästen auf der [Startseite von nera.js.org](/de/index.html) sind eine
Stack-Gruppe. Jeder Kasten ist eine Datei in
`pages/de/stacks/home-features/`, mit den Übersetzungen in
`pages/stacks/home-features/` und `pages/es/stacks/home-features/`:

```markdown:pages/de/stacks/home-features/01-markdown.md
---
type: stack
stack_group: home_features
stack_order: 1
lang: de
title: Markdown rein, HTML raus
---

Schreibe Inhalte in Markdown mit YAML-Frontmatter. Nera rendert jede Seite über ein Pug-Layout, das du kontrollierst, und schreibt schlankes HTML.
```

Die View der Startseite wählt die Kästen der aktuellen Sprache aus und nummeriert
sie nach ihrer Position in der Liste:

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

`curLang` wird im Basis-Layout der Website aus `meta.lang` gesetzt. Ein fünfter
Kasten ist eine neue Markdown-Datei je Sprache, ohne Änderung an der View.

## 7. Stolperfalle: Stack-Seiten sind trotzdem Seiten

Ein Stack hat kein Layout und wird deshalb nie gebaut, aber er bleibt in der
Seitenliste, die jedes andere Plugin sieht. In einer Test-Website mit Stacks in
`pages/stacks/` verhielten sich die Plugins so:

| Plugin | sieht Stack-Seiten? | was zu tun ist |
|---|---|---|
| `plugin-search` | nein — Seiten ohne `layout` bleiben aus dem Index | nichts |
| `plugin-page-pagination` | nein — eine Seite ohne `layout` ist nie Ziel von Zurück/Weiter | nichts |
| `plugin-navigation` | nein — es listet nur die `href`s aus `config/navigation.yaml` | nichts |
| `plugin-statistics` | **ja** — es zählt jede Markdown-Datei unter `pages/` | die gezählten Schlüssel (`tags`, `category`, …) von Stack-Seiten fernhalten |
| `plugin-simple-page-list` | **ja** — mit `page_path: /stacks` listete es jeden Stack mit einem `href` wie `/stacks/newsletter.html`, der nie gebaut wurde | Stacks aus gelisteten Ordnern heraushalten oder mit `exclude_pages` ausschließen |

Die Einträge in `exclude_pages` verwenden die URL, die der Stack als Seite
hätte:

```yaml:config/simple-page-list.yaml
page_path: /blog
exclude_pages:
    - /blog/newsletter.html
```

Ein eigener Ordner wie `pages/stacks/` ist die einfachere Lösung: Kein
gelisteter Pfad passt darauf, also muss nichts ausgeschlossen werden.

## Weiter

[Wie diese Website gebaut ist](/de/tutorials/how-this-site-is-built.html)
zeigt, wie plugin-stacks auf dieser Website mit den anderen Plugins
zusammenspielt.
