---
layout: pages/tutorial.pug
title: Ein Theme verwenden und anpassen
slug: use-a-theme
lang: de
description: Starte eine Website mit einem installierbaren Theme, ändere seine Farben, sein CSS und sein Markup Datei für Datei und bekomm die Updates des Themes weiterhin über npm.
keywords: nera Theme, theme-business, Theme überschreiben, Child-Theme, Design-Tokens, eigenes CSS, nera update, theme-shadowed
tags: themes, getting-started
pagination_order: 14
createdAt: 2026-11-22
---
Ein Nera-Theme ist ein npm-Paket: Layouts, Seitentypen, Partials, ein
Stylesheet und ein Satz Design-Tokens. Deine Website kopiert es nicht. Sie
installiert das Paket und legt nur dort eine eigene Datei daneben, wo sie
etwas anders haben will. Jede andere Datei kommt weiterhin aus dem Paket, sodass
`npm update` die Korrekturen des Themes weiterhin bringt, wie ein Child-Theme in
WordPress.

Dieses Tutorial verwendet `@nera-static/theme-business`, das Theme der
Starter business und portfolio. Du änderst eine Farbe, fügst ein paar
CSS-Regeln hinzu, ersetzt ein Partial, aktualisierst das Theme und fügst
einer Website ohne Theme eines hinzu. Jeder Befehl und jede Ausgabe unten
stammt aus einer frischen Website mit theme-business 1.0.3,
`@nera-static/nera` 1.29.0 und `@nera-static/core` 4.19.1.

## 1. Eine Website mit Theme anlegen

```bash
npx @nera-static/nera new my-site --theme business
cd my-site
```

```text
📦 Creating a new Nera site in …/my-site...
  ✓ Configured project as "my-site"
  ✓ Using theme "business" (@nera-static/theme-business)
  • pages/imprint.md and pages/privacy.md are placeholders: link them from the theme's layout (theme-blog and theme-business take `footer_links` in config/theme.yaml), or `nera build --check` keeps warning legal-imprint-link and legal-privacy-link.
```

`--theme business` tut zwei Dinge. Es trägt das Paket in `package.json` ein:

```json
"dependencies": {
    "@nera-static/nera": "^1.29.0",
    "@nera-static/theme-business": "^1.0.3"
}
```

und es nennt das Theme in `config/app.yaml`:

```yaml:config/app.yaml
theme: business
```

`business` ist die Kurzform von `@nera-static/theme-business`. Die Website
bekommt kein eigenes Layout: `theme/` enthält nur leere
Ordner (`views/layouts/`, `views/pages/` und `assets/`), und jede View kommt
aus dem Paket in `node_modules/`.

Du willst auch Beispielseiten für Leistungen, Öffnungszeiten und Kontakt? Der
Starter business bringt dasselbe Theme mit ihnen:
`npx @nera-static/nera new my-site --starter business`.

## 2. Den ersten Build sauber machen

Bau mit den Ausgabeprüfungen:

```bash
npx nera build --check
```

```text
public/imprint.html
  :44   warning  page has more than one `<h1>` — one main heading per page keeps its outline clear; keep one and make the others `<h2>` (WCAG 1.3.1, best practice) (on 3 pages, e.g. public/imprint.html, public/index.html, public/privacy.html)  a11y-h1
  :33   warning  page has no link whose text names the imprint (Impressum, Imprint, Legal notice) — it should be easy to find and directly reachable from every page; link it from the layout, such as in the footer, or, if it is linked under another name, set `legal.imprint` in config/validate.yaml (§ 5 DDG) (on 3 pages, e.g. public/imprint.html, public/index.html, public/privacy.html)  legal-imprint-link
  :33   warning  page has no link whose text names the privacy policy (Datenschutz, Privacy, Data protection) — it should be easy to find and directly reachable from every page; link it from the layout, such as in the footer, or, if it is linked under another name, set `legal.privacy` in config/validate.yaml (Art. 13 DSGVO) (on 3 pages, e.g. public/imprint.html, public/index.html, public/privacy.html)  legal-privacy-link

0 error(s), 3 warning(s)
```

Beide kommen von den angelegten Seiten, nicht vom Theme:

-   Das Theme rendert den `title` der Seite als ihr einziges `<h1>`, das
    Markdown einer Seite beginnt also bei `##`. Lösch die Zeilen
    `# Welcome to Nera`, `# Imprint` und `# Privacy` aus den drei Seiten.
-   Der Footer verlinkt die rechtlichen Seiten, die du aufführst. Leg die
    eigene `config/theme.yaml` der Website an:

```yaml:config/theme.yaml
footer_links:
    - label: Imprint
      href: /imprint.html
    - label: Privacy
      href: /privacy.html
```

Bau noch einmal:

```text
✓ No problems found.
```

Der Footer enthält jetzt:

```html
<nav class="site-footer__legal" aria-label="Legal"><a href="/imprint.html">Imprint</a><a href="/privacy.html">Privacy</a></nav>
```

Ersetz die beiden Platzhalterseiten durch deine eigenen Texte, bevor du
veröffentlichst.

## 3. Wie sich Theme und Website die Arbeit teilen

Nera sucht jede View und jedes Asset an zwei Orten, zuerst in deiner
Website:

| was | deine Website | das Theme-Paket |
|---|---|---|
| Views | `theme/views/<path>` | `node_modules/@nera-static/theme-business/views/<path>` |
| Assets | `theme/assets/<path>` | `node_modules/@nera-static/theme-business/assets/<path>` |
| Einstellungen | `config/theme.yaml` | die `config/theme.yaml` des Pakets |

Eine Datei deiner Website gewinnt gegen die Datei des Themes **mit demselben
Pfad**, und nur diese eine Datei. Alles, was du nicht überschreibst, kommt
aus dem Paket. Assets werden zuerst aus dem Theme kopiert, dann aus deiner
Website, sodass `public/` beide enthält, und deine obenauf. Deine
`config/theme.yaml` wird Schlüssel für Schlüssel über die Voreinstellungen
des Themes gelegt: Du setzt nur, was du änderst (Listen wie `footer_links`
werden als Ganzes ersetzt).

Die README des Themes hat eine Tabelle, was wo zu ändern ist. Vom günstigsten
zum teuersten:

| um zu ändern | tu das | du behältst Theme-Updates für |
|---|---|---|
| eine Farbe, eine Schrift, eine Breite | ein Token in `config/theme.yaml` | alles |
| ein paar CSS-Regeln | `theme/assets/css/custom.css` + `extra_css` | alles |
| ein Partial oder einen Seitentyp | kopier es nach `theme/views/<same path>` | jede andere Datei |
| den ganzen Seitenrahmen | `layouts/layout.pug` überschreiben | Seitentypen, Partials, CSS |

Die Abschnitte 4 bis 6 gehen diese Tabelle hinunter.

## 4. Eine Farbe ändern

Jedes Token in der `config/theme.yaml` des Themes wird zu einer CSS Custom
Property: `tokens.color.accent` wird zu `--theme-color-accent`. Ändere den
Akzent (Links, Buttons, die Linie oben) in ein dunkles Petrol und gib dem
Fokusrahmen die alte Rostfarbe:

```yaml:config/theme.yaml
tokens:
    color:
        accent: '#1c5f74'
        focus: '#a1400f'
footer_links:
    - label: Imprint
      href: /imprint.html
    - label: Privacy
      href: /privacy.html
```

Nach `npx nera build` enthält das `<style>`, das das Theme in den `<head>`
jeder Seite schreibt, deine Werte neben den Voreinstellungen, die du nicht
angefasst hast:

```html
<style>
  :root {
    --theme-color-bg: #fbf2e3;
    --theme-color-surface: #f1e0c3;
    --theme-color-text: #3b2314;
    --theme-color-muted: #6e4b2e;
    --theme-color-accent: #1c5f74;
    --theme-color-accent-text: #ffffff;
    --theme-color-border: #dcc6a3;
    --theme-color-focus: #a1400f;
    …
  }
</style>
```

Behalte den Kontrast im Blick, wenn du Farben änderst: Der Akzent ist Text
auf dem Seitenhintergrund und auf Karten und der Hintergrund von Buttons.
`#1c5f74` erreicht 6,4:1 auf dem Hintergrund, 5,5:1 auf der Kartenfarbe und
7,1:1 unter weißem Button-Text, alles über den 4,5:1, die die WCAG
verlangen. Die README des Themes führt jedes Token und jedes Farbpaar auf,
das es prüft.

## 5. Eigenes CSS hinzufügen

Für Regeln, die die Tokens nicht abdecken, fügst du ein eigenes Stylesheet
hinzu und lässt das Theme es verlinken. Leg es nach
`theme/assets/css/custom.css`; die Regel gestaltet eine Zeile, die du im
nächsten Abschnitt hinzufügst:

```css:theme/assets/css/custom.css
.page-kicker {
    margin: 0 0 0.25rem;
    color: var(--theme-color-accent);
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}
```

und führ es unter `extra_css` in `config/theme.yaml` auf:

```yaml:config/theme.yaml
extra_css:
    - /css/custom.css
```

Das Theme verlinkt es nach seinem eigenen Stylesheet und dem Token-`<style>`,
sodass deine Regeln gewinnen:

```html
<link rel="stylesheet" href="/css/theme.css">
<style>
  …
</style>
<link rel="stylesheet" href="/css/custom.css">
```

`public/css/` enthält jetzt sowohl `theme.css` (aus dem Paket) als auch
`custom.css` (aus deiner Website). Verwende die Tokens
(`var(--theme-color-accent)`) statt kopierter Farbwerte, damit eine Änderung
aus Abschnitt 4 auch deine Regeln erreicht. Das Theme führt seine
öffentlichen Klassennamen in seiner README auf; das sind die, die über
Minor- und Patch-Releases stabil bleiben.

Überschreib nicht `theme/assets/css/theme.css` selbst: Deine Kopie würde das
ganze Stylesheet des Themes ersetzen, und seine Korrekturen würden dich
nicht mehr erreichen.

## 6. Ein Partial überschreiben

Jetzt ändern wir Markup. Der Seitenkopf jeder Seite außer der Startseite
steht im Partial `partials/page-header.pug`. Kopier es aus dem Paket an
denselben Pfad in deiner Website:

```bash
mkdir -p theme/views/partials
cp node_modules/@nera-static/theme-business/views/partials/page-header.pug theme/views/partials/
```

und füg über dem Titel eine kleine Zeile hinzu, gelesen aus einem neuen
Frontmatter-Schlüssel `kicker`:

```pug:theme/views/partials/page-header.pug
//- Overrides the theme's partials/page-header.pug: adds a kicker line
//- above the page title, from the page's `kicker` frontmatter.
header.page__header
    if meta.kicker
        p.page-kicker= meta.kicker
    h1.page__title= meta.title || app.name
    if meta.lead
        p.page__lead= meta.lead
```

Die Klasse ist deine eigene, `page-kicker`, kein Name innerhalb des
`page__…`-Blocks des Themes: Ein späteres Release des Themes könnte ein
eigenes `page__kicker` hinzufügen. Verwende sie auf einer Seite:

```markdown:pages/about.md
---
layout: pages/default.pug
title: About us
kicker: Since 1998
lead: A small bakery in the middle of Berlin.
description: Who we are and how we bake
---
## Our story

We bake every loaf by hand.
```

`npx nera build` rendert `public/about.html` mit deinem Kopf:

```html
<header class="page__header">
  <p class="page-kicker">Since 1998</p>
  <h1 class="page__title">About us</h1>
  <p class="page__lead">A small bakery in the middle of Berlin.</p>
</header>
```

Eine Seite ohne `kicker` rendert wie vorher. Jede andere View, das Layout,
der Footer, die Seitentypen, kommt weiterhin aus dem Paket: Du hast eine Datei
übernommen, nicht das Theme.

Oft bereitet ein Theme solche Stellen für dich vor. theme-business liefert
leere Partials, seine *Seams*, für die Ausgabe von Plugins:
`partials/head-extra.pug` am Ende von `<head>`, `partials/nav-main.pug` in
der Navigation im Kopf, `partials/footer-extra.pug` im Footer und ein paar
weitere, aufgeführt in seiner README. Einen Seam zu überschreiben kostet
nichts, denn darin steht kein Markup des Themes, das dir entgehen könnte.
Für einen eigenen Seitentyp legst du unter `theme/views/pages/` eine neue
Datei an, die `extends ../layouts/layout.pug`; die README zeigt einen.

## 7. Die Updates kommen weiterhin

Aktualisiere das Theme genauso wie Nera selbst:

```bash
npx nera update
```

```text
🔄 Updating Nera packages: @nera-static/nera, @nera-static/theme-business
```

`nera update` führt `npm update` für jedes `@nera-static/`-Paket in
`package.json` aus, das Theme eingeschlossen. Wie `npm update` bleibt es im
Bereich jedes Pakets, sodass eine neue Major-Version des Themes nie hinter
deinem Rücken installiert wird. `npm ls` zeigt die Version, die du hast:

```bash
npm ls @nera-static/theme-business
```

```text
my-site@1.0.0 …/my-site
└── @nera-static/theme-business@1.0.3
```

Ein Update ersetzt die Dateien in `node_modules/`, nie die in deinem
`theme/`. Das wirkt in beide Richtungen:

-   Deine Tokens, `custom.css` und `page-header.pug` überstehen jedes
    Update.
-   Dein `page-header.pug` bekommt die Änderungen des Themes an dieser Datei
    nicht mehr. Alles andere schon.

Vergleich nach einem Update jede Datei, die du überschreibst, mit der neuen
Version des Themes und übernimm, was du willst:

```bash
diff node_modules/@nera-static/theme-business/views/partials/page-header.pug theme/views/partials/page-header.pug
```

```text
1,2c1,2
< //- The page header of every page type but home (§S3.1 "Header"): the page's
< //- one <h1> and its lead.
---
> //- Overrides the theme's partials/page-header.pug: adds a kicker line
> //- above the page title, from the page's `kicker` frontmatter.
3a4,5
>     if meta.kicker
>         p.page-kicker= meta.kicker
```

Hier sind die einzigen Unterschiede deine. Das Theme folgt Semantic
Versioning über seine View-Pfade, Tokens, Einstellungen und öffentlichen
Klassen: Ein Minor- oder Patch-Release lässt deine Überschreibungen
funktionieren, und ein Major-Release sagt in seinem CHANGELOG, was zu ändern
ist. Je weniger Dateien du überschreibst, desto weniger ist zu vergleichen.

## 8. Einer bestehenden Website ein Theme hinzufügen

Eine Website, die ohne `--theme` angelegt wurde, hat ein eigenes Layout, das
`nera new` angelegt hat. Installier das Theme und nenn es in
`config/app.yaml`:

```bash
npm install @nera-static/theme-business
```

```yaml:config/app.yaml
theme: business
```

`nera validate` zeigt dann auf die beiden angelegten Views, die im Weg sind:

```text
theme/views/layouts/layout.pug
  :1    warning  the `nera new` starter file hides the theme's own layouts/layout.pug — delete it to use the theme's, or remove the `nera:scaffold-default` line to keep it on purpose  theme-shadowed
theme/views/pages/default.pug
  :1    warning  the `nera new` starter file hides the theme's own pages/default.pug — delete it to use the theme's, or remove the `nera:scaffold-default` line to keep it on purpose  theme-shadowed

0 error(s), 2 warning(s)
```

Sie haben dieselben Pfade wie zwei Views des Themes, nach der Regel aus
Abschnitt 3 würden sie also gewinnen, und das Theme wäre nie zu sehen. Ihre
erste Zeile, `//- nera:scaffold-default`, kennzeichnet sie als unveränderte
Starter-Dateien. Lösch sie:

```bash
rm theme/views/layouts/layout.pug theme/views/pages/default.pug
npx nera validate
```

```text
✓ No problems found.
```

Hast du eine davon geändert und willst sie behalten, entferne stattdessen
ihre Zeile `nera:scaffold-default`: Die Datei ist dann eine bewusste
Überschreibung, und die Warnung verschwindet. Bring danach die Überschriften
und die Footer-Links in Ordnung wie in Abschnitt 2.

Eine Seite rendert mit dem Seitentyp des Themes, der so heißt wie ihr
`layout`. theme-business hat `pages/home.pug`, `default.pug`, `contact.pug`,
`list.pug` und `gallery.pug`; eine Seite, deren `layout` eine View nennt,
die weder deine Website noch das Theme hat, lässt `nera validate` mit
`layout-unresolved` scheitern, das beide Orte nennt, an denen es gesucht hat.

## 9. Ein eigenes Theme bauen

Ein eigenes Theme ist ein npm-Paket mit demselben Aufbau: `views/`,
`assets/` und `config/theme.yaml`. `@nera-static/theme-example` ist das
kleinste, klein gehalten zum Kopieren: Der Abschnitt
[Using it as a blueprint for your own theme](https://github.com/seebaermichi/nera-theme-example#using-it-as-a-blueprint-for-your-own-theme)
seiner README führt durch das Umbenennen des Pakets, die Felder, die Nera
braucht, um es zu finden, und die Seams, mit denen eine Website es erweitert,
ohne es zu forken. theme-business zeigt dieselben Ideen in voller Größe:
Tokens, Seams und einen dokumentierten Vertrag.

## Weiter

Die [README von theme-business](https://github.com/seebaermichi/nera-theme-business#readme)
enthält jedes Token, jede Einstellung, jeden Seam und jede öffentliche
Klasse. Die Plugin-Tutorials, etwa
[Eine Navigation mit aktiven Zuständen bauen](/de/tutorials/custom-navigation.html), zeigen, wie du die
Templates eines Plugins veröffentlichst; mit theme-business bindest du sie
aus einem Seam ein, wie seine README für jedes unterstützte Plugin zeigt.
