---
layout: pages/docs.pug
title: Themes und Starter
slug: style-guide-themes-and-starters
lang: de
description: Der Aufbau eines Nera-Themes und eines Nera-Starters — eine theme.css, Design-Tokens, Seams, das Helfer-Objekt neraTheme, die Präfixe der Custom Properties, Webfonts, die Fixture-Website und was ein Starter kopiert.
pagination_order: 3
---

# Themes und Starter

Ein Theme ist das Aussehen einer Website, ausgeliefert als npm-Paket, dessen
Dateien eine Website einzeln überschreibt. Ein Starter ist eine ganze
Beispiel-Website, die `nera new --starter <name>` einmal kopiert. Beide
folgen einem Aufbau: Wer ein offizielles Theme kennt, findet sich in jedem
anderen zurecht, und ein neues Theme beginnt mit dieser Seite statt mit der
Kopie eines Geschwisters.

Wie eine Website ein Theme installiert und überschreibt, steht in den
[Kernkonzepten](/de/docs/core-concepts.html); wie eine Website einen Starter
nutzt, in der [CLI-Referenz](/de/docs/cli.html).

## Dateien eines Themes

```text
nera-theme-<name>/
├── views/
│   ├── layouts/layout.pug    # das Gerüst: Blöcke head, header, main, footer, scripts
│   ├── pages/                # eine View pro Seitentyp: default.pug, home.pug, post.pug, …
│   └── partials/
│       ├── helpers.pug       # die Vertragsfunktionen und das Objekt neraTheme
│       ├── tokens.pug        # die Tokens aus config/theme.yaml als --theme-*-Custom-Properties
│       ├── head.pug  header.pug  footer.pug  scripts.pug  lang-switch.pug  …
│       └── <seam>.pug        # leer oder ein Standard ohne Plugin; eine Website überschreibt ihn
├── assets/
│   ├── css/theme.css         # das eine Stylesheet
│   └── fonts/<name>/         # nur mit Webfonts: woff2-Dateien und ihre Lizenztexte
├── config/theme.yaml         # jeder Schlüssel, den das Theme liest, mit seinem Standardwert
├── test/
│   ├── site/                 # die Fixture-Website, die die Tests bauen, zweisprachig
│   ├── helpers/  global-setup.js
│   └── <section>.test.js     # eine Datei pro Abschnitt des Theme-Vertrags
├── README.md  CHANGELOG.md  LICENSE  package.json  package-lock.json
├── eslint.config.js  vitest.config.js  .editorconfig  .gitignore
├── .husky/                   # pre-commit: npm run lint, pre-push: npx vitest run
└── .github/                  # workflows/test.yml, workflows/publish.yml, dependabot.yml, FUNDING.yml
```

- **Ein Stylesheet, `assets/css/theme.css`.** Keine `@import`-Kette und
  kein Build-Schritt: Die Datei, die eine Website einbindet, ist die Datei im
  Repository.
- **Ein Skript, das ein Plugin braucht, kommt von diesem Plugin**, nie aus
  einer Kopie im Theme (siehe „Dateien eines Starters“ unten).
- `package.json` führt `views`, `assets`, `config` und `CHANGELOG.md` in
  `files`, trägt `nera.generator` mit der Core-Untergrenze
  (`{ "generator": ">=4.15.0" }`), führt die Plugins, die es gestaltet, als
  optionale `peerDependencies` und hat die Keywords `nera` und `nera-theme`.

## Design-Tokens

Eine Website ändert Farben, Schriften und Größen eines Themes in ihrer
eigenen `config/theme.yaml`, ohne das CSS anzufassen:

```yaml
# config/theme.yaml
tokens:
    color:
        bg: '#f4f5f7'
        accent: '#d02408'
        accent_text: '#ffffff'
    font:
        body: "'Inter', system-ui, sans-serif"
    size:
        measure: '46rem'
```

`partials/tokens.pug` macht aus jedem Token eine Custom Property namens
`--theme-<gruppe>-<name>`, `_` wird dabei zu `-`: Aus
`tokens.color.accent_text` wird `--theme-color-accent-text`. Es schreibt sie
in ein einziges Inline-`<style>` und verwirft jeden Wert, der aus der Regel
ausbrechen könnte (`<`, `>`, `{`, `}`, `;`). Die `config/theme.yaml` des
Themes enthält jeden Schlüssel mit seinem Standardwert, und `theme.css`
wiederholt diesen Standardwert als Fallback jedes `var()`.

## Custom Properties

Jede Custom Property in einem Theme oder Plugin trägt ein Präfix, das sagt,
wem sie gehört:

| Präfix | gehört | Beispiel |
|---|---|---|
| `--theme-*` | den öffentlichen Tokens aus `config/theme.yaml`; eine Website darf sie setzen | `--theme-color-accent` |
| `--<theme>-*` | den internen Aliassen eines Themes, benannt nach dem Theme | `--stack-bg` |
| `--nera-<plugin>-*` | den Standard-Styles eines Plugins | `--nera-code-bg` |

**Keine Custom Property ohne Präfix** in einem Theme oder Plugin. Ein kurzer
Name wie `--bg`, `--text` oder `--accent` kollidiert mit dem eigenen CSS
einer Website. Ein Theme, das kurze interne Namen will, legt die Tokens
einmal unter seinem eigenen Präfix als Aliasse an und nutzt danach nur noch
die Aliasse:

```css
:root {
    --stack-bg: var(--theme-color-bg, #f4f5f7);
    --stack-accent: var(--theme-color-accent, #d02408);
}

body {
    background: var(--stack-bg);
}
```

Eine Custom Property umzubenennen, die eine Website gesetzt haben kann, ist
eine inkompatible Änderung und braucht ein Major-Release.

## Seams

Ein Seam ist ein Partial, das das Theme leer ausliefert oder mit einem
Standard, der kein Plugin braucht. Eine Website füllt es, indem sie eine
Datei mit demselben Pfad in ihr eigenes `theme/views/` legt. Übliche Seams
sind `head-extra`, `scripts-extra`, `footer-extra` und `nav-main`;
Blog-Themes ergänzen Seams wie `post-media`, `post-tags`, `post-pagination`
und `tag-cloud`.

- **Ein Theme liest keine Plugin-Daten.** Es schaut nicht in `app.tags`,
  `meta.images` oder einen anderen Schlüssel, den ein Plugin schreibt, und
  es parst nicht den `content` einer Seite. Plugin-Ausgaben erreichen eine
  Seite nur über einen Seam, den die Website füllt, deshalb kann eine neue
  Datenform eines Plugins nie ein Theme brechen.
- Ein Seam-Override beginnt mit einem einzeiligen Kommentar, der sagt, was
  er füllt: `//- Seam override: plugin-navigation's list form …`.
- Die README des Themes führt jeden Seam auf, mit dem Ort, an dem er
  erscheint, dem, was im Scope ist, und dem typischen Override, fertig zum
  Kopieren.

## Das Helfer-Objekt: `neraTheme`

`partials/helpers.pug` enthält zwei Dinge:

- **Die Vertragsfunktionen**, die jede View des Themes und das eigene Layout
  einer Website aufrufen dürfen: in den Blog- und Business-Themes
  `pageLang(page)`, `sameLang(page)`, `homeHref(lang)`,
  `formatDate(value, lang)`, `isoDate(value)` und `hrefFor(value, lang)`. Sie
  stehen in der README und gehören zum Vertrag.
- **Ein Objekt für die internen Helfer des Themes, namens `neraTheme`**, in
  jedem Theme, nie nach dem Theme benannt. Die gemeinsamen Partials
  (`tokens.pug`, `lang-switch.pug`, `head.pug`) lesen sich dann in jedem
  Theme gleich, und eine Prüfung kann sie identisch halten.

```pug
//- partials/tokens.pug
if neraTheme.tokenRule()
    style!= neraTheme.tokenRule()
```

`neraTheme` bleibt intern: Eine Website ruft die Vertragsfunktionen auf,
nicht das Objekt. Ein Theme, das sein Helfer-Objekt in `neraTheme`
umbenennt, schreibt das trotzdem in sein CHANGELOG, weil eine Website bricht,
die ein Partial mit dem alten Namen kopiert hat.

## Webfonts

- Ein Theme mit Webfonts **liefert sie selbst aus**: woff2-Dateien unter
  `assets/fonts/<theme>/`, neben dem Lizenztext jeder Familie
  (`OFL-<family>.txt`). Keine Anfrage an ein Font-CDN, also stellt eine
  Website mit dem Theme keine Anfrage an Dritte.
- Die `@font-face`-Regeln stehen am Anfang von `theme.css`, unter einem
  Kommentar, der die Lizenz und das Quellpaket mit seiner Version nennt, zum
  Beispiel `From @fontsource-variable/inter 5.3.0`.
- Jede `font-family` endet mit einem System-Font-Stack, damit Text erscheint,
  bevor die Schrift geladen ist (`font-display: swap`).
- Ein Theme ohne Webfonts nutzt nur System-Font-Stacks.

## Tests eines Themes

Ein Theme wird getestet, indem eine Website damit gebaut wird, nicht durch
Unit-Tests seiner Templates:

- `test/site/` ist eine vollständige, zweisprachige Fixture-Website, die das
  Theme aus dem Repository nutzt (`theme: ../..`) und jedes Plugin, das das
  Theme gestaltet.
- `test/global-setup.js` baut jede Variante der Fixture einmal, über die
  installierte `nera`-CLI, und die Testdateien lesen die Ausgabe.
- Eine Testdatei pro Abschnitt des Theme-Vertrags: `build`, `contract`,
  `contrast`, `override`, `pages`, `package`, `plugin-classes`, `tokens`,
  `validate` und so weiter.
- Die Fixture besteht `nera validate` und `nera build --check` mit jeder
  Regel auf `error`; eine Regel, die das Theme absichtlich bricht (externe
  Links in einem neuen Tab), ist in der `config/validate.yaml` der Fixture
  abgeschaltet, mit einem Kommentar, der sagt warum, und in der README
  genannt.
- Die gemeinsamen Theme-Suiten ziehen in `@nera-static/test-utils` um
  (kommt), sodass ein Theme seine Optionen übergibt, statt die Suiten zu
  kopieren.

## Dateien eines Starters

```text
nera-starter-<name>/
├── pages/                    # die Beispielseiten, fertig zum Bearbeiten
├── config/                   # app.yaml, theme.yaml und die Konfiguration jedes Plugins
├── theme/                    # die eigenen Dateien der Beispiel-Website: Seam-Overrides, Vendor-Views, Bilder
├── assets/  plugins/  .neraignore   # nur wenn die Beispiel-Website sie braucht
├── test/
│   ├── package.test.js       # das Paket: Name, files, nera.starter, Abhängigkeiten
│   └── scaffold.test.js      # nera new --starter auf dieses Repository, dann ein sauberer Build
├── README.md  CHANGELOG.md  LICENSE  package.json  package-lock.json
├── eslint.config.js  .editorconfig  .gitignore  .husky/  .github/
```

- **`nera new` kopiert nur `pages/`, `config/`, `theme/`, `assets/`,
  `plugins/` und `.neraignore`.** Alles andere im Repository, die Tests
  eingeschlossen, bleibt zurück. Die CLI übernimmt die `dependencies` des
  Starters in die `package.json` der neuen Website.
- `package.json` trägt `nera.starter` mit einem `label` und einer
  `description`, die `nera new` zeigt, wenn es die Starter anbietet:

  ```json
  "nera": {
      "starter": {
          "label": "Blog for developers",
          "description": "A ready-to-edit Nera blog for developers on @nera-static/theme-stack: …"
      }
  }
  ```

- Plugins und das Theme sind `dependencies`. `@nera-static/nera` ist nur
  eine devDependency: Die CLI übernimmt sie nie, deshalb behält die neue
  Website die Version, mit der sie angelegt wurde.
- `files` führt die kopierten Ordner und `CHANGELOG.md` und lässt weg, was
  ein Build schreibt, etwa `!theme/assets/search-index*.json`.
- **Ein Starter kopiert kein Plugin-Skript.** Ein Skript wie das der Suche
  oder des Kontaktformulars kommt von seinem Plugin über `getAssets`,
  ausgeliefert unter `public/_nera/<plugin>.js`, und das Layout bindet es
  dort ein. Eine Kopie in `theme/assets/js/` müsste bei jedem Plugin-Release
  von Hand erneuert werden, und nichts würde bemerken, wenn sie abweicht.
- Vendor-Views unter `theme/views/vendor/plugin-<name>/` sind die
  veröffentlichten Templates der installierten Plugin-Version, unverändert.
  Eine bewusste Änderung gehört in einen Seam-Override, nicht in die
  Vendor-Kopie.
- Eine frische Website aus dem Starter besteht `nera validate` und
  `nera build --check` ohne Befund. `scaffold.test.js` beweist es.

## README eines Starters

Die Abschnitte kommen in dieser Reihenfolge:

```markdown
# @nera-static/starter-example
[![Test](…)](…)
[![npm version](…)](…)

A ready-to-edit … for the Nera static site generator, on @nera-static/theme-…

## Usage                     npx @nera-static/nera new my-site --starter example
## What you get              the pages, the plugins, what the sample shows
## <extra sections>          optional, e.g. picture credits or texts for --lang de
## Requirements              the CLI, core and Node floors
## License
## First steps               always last
```

**`## First steps` ist immer der letzte Abschnitt.** `nera new` gibt ihn
aus, nachdem die Website angelegt ist, von seiner Überschrift bis zur nächsten
`#`- oder `##`-Überschrift, seine `###`-Unterabschnitte eingeschlossen; als
letzter Abschnitt ist er auch das Ende der README, mit demselben Text, den
der neue Besitzer eben gesehen hat. Er ist eine kurze
nummerierte Liste dessen, was der neue Besitzer zuerst ändern muss: die
`origin` der Website, die Rechtstexte, der Autor.

## Versionierung

Themes und Starter folgen den Release-Regeln der
[Seite Plugins](/de/docs/style-guide/plugins.html#changelog), mit diesen
Ergänzungen:

- **Major** bei einem Theme: ein umbenannter oder entfernter Seam, eine
  Vertragsfunktion, ein Token oder eine öffentliche Klasse; eine geänderte
  Bedeutung eines Schlüssels in `config/theme.yaml`; eine höhere
  Core-Untergrenze.
- Ein Starter hat keinen Update-Weg: Eine Website, die aus ihm entsteht,
  besitzt ihre Dateien, also ändert ein Starter-Release nur, was neue
  Websites bekommen.
