---
layout: pages/docs.pug
title: Plugins
slug: style-guide-plugins
lang: de
description: Der Aufbau eines Nera-Plugins — Dateien, Hook-Form, Konfiguration und Warnungen über @nera-static/plugin-utils, package.json, README und CHANGELOG.
pagination_order: 2
---

# Plugins

Jedes Nera-Plugin ist gleich aufgebaut. Öffnest du `index.js`, siehst du die
Hooks; öffnest du `src/config.js`, siehst du die Konfigurationsschlüssel und
ihre Standardwerte; öffnest du die README, kommen die Abschnitte in derselben
Reihenfolge wie in jedem anderen Plugin. Diese Seite beschreibt diesen
Aufbau, für die offiziellen `@nera-static/plugin-*`-Pakete und für deine
eigenen.

Wie eine Website Plugins nutzt und wie der Hook-Vertrag selbst aussieht,
steht in der [Plugin-Dokumentation](/de/docs/plugins.html).

## Dateien

```text
nera-plugin-<name>/
├── index.js                  # nur die Hooks: Kopfkommentar, Imports, exportierte Hooks
├── src/
│   ├── config.js             # der Config-Reader: Standardwerte, ein Reader je Schlüssel, loadConfig()
│   ├── log.js                # der Logger des Pakets: createLogger('plugin-<name>')
│   └── <feature>.js          # reine Funktionen, ein Anliegen pro Datei
├── config/<name>.yaml        # jeder Schlüssel mit seinem Standardwert; `nera add` kopiert sie
├── views/                    # nur mit Templates: flach <template>.pug, dazu partials/ und helper/
├── assets/                   # nur wenn getAssets statische Dateien liefert (unter public/_nera/)
├── bin/publish-template.js   # nur mit views/
├── test/                     # siehe die Seite Tests dieses Styleguides
├── README.md  CHANGELOG.md  LICENSE  package.json  package-lock.json
├── eslint.config.js  .editorconfig  .gitignore
├── .husky/                   # pre-commit: npm run lint, pre-push: npm run lint && npx vitest run
└── .github/                  # workflows/test.yml, workflows/publish.yml, dependabot.yml, FUNDING.yml
```

- Ein Plugin hat **kein `src/warn.js` und kein `src/guard.js`**. Das
  Format der Warnungen und die Prüfung der Core-Version kommen aus
  `@nera-static/plugin-utils` (`/log` und `/guard`, ab Version 1.7.0), damit
  sie nicht auseinanderlaufen.
- `config/<name>.yaml` führt jeden Schlüssel auf, gesetzt oder
  auskommentiert, mit seinem Standardwert. `nera add <name>` kopiert genau
  diese Datei in eine Website, deshalb hat ein Plugin kein
  `bin/publish-config.js`.
- `bin/publish-template.js` gibt es nur, wenn das Plugin `views/` hat. Es
  ruft `publishAllTemplates` aus `@nera-static/plugin-utils` auf.

## Die Hooks

`index.js` enthält die Hooks und sonst nichts. Alles, was ein Hook über das
Lesen seiner Eingabe und das Zurückgeben seines Ergebnisses hinaus tut, liegt
in `src/`.

```js
// @nera-static/plugin-example — adds a list of related pages to every page.
//
// getAppData checks the core version and adds app.example, getMetaData adds
// meta.related to every page, getAssets ships the default styles.
import { fileURLToPath } from 'node:url'
import { assertCoreVersion } from '@nera-static/plugin-utils/guard'
import { loadConfig } from './src/config.js'
import { log } from './src/log.js'
import { relatedPages } from './src/related.js'

export function getAppData({ app = {}, pagesData = [] } = {}) {
    assertCoreVersion({ plugin: 'plugin-example', from: import.meta.url })
    return { ...app, example: { count: pagesData.length } }
}

export function getMetaData({ app = {}, pagesData = [] } = {}) {
    const config = loadConfig({ app })
    return pagesData.map((page) => ({
        ...page,
        meta: { ...page.meta, related: relatedPages(page, pagesData, config, { onWarning: log.warn }) },
    }))
}

export function getAssets({ app = {}, pagesData = [] } = {}) {
    return [{ from: fileURLToPath(new URL('./assets/example.css', import.meta.url)), to: '_nera/example.css' }]
}
```

Die Regeln:

- **Mit Standardwerten destrukturieren**: `({ app = {}, pagesData = [] } = {})`.
  Nie `(data)` mit `data.app`.
- **Jeden Hook mit `export function` exportieren**, nie über
  `export { … }`.
- **Synchron**, außer der Hook muss wirklich warten. Core wartet auf jeden
  Hook, aber ein synchroner lässt sich leichter testen und verstehen.
- **Die Konfiguration im Hook lesen**, über `loadConfig({ app })`, nie auf
  Modulebene. Dann kann ein Test den Hook gegen eine Website in einem
  temporären Ordner laufen lassen.
- **Einen neuen Wert zurückgeben.** `getAppData` gibt ein neues einfaches
  Objekt zurück, `getMetaData` ein neues Array neuer Seitenobjekte. Die
  Eingabe wird nie verändert.
- **Die Prüfung läuft in `getAppData`**, dem ersten Hook, den Core aufruft,
  und nur in einem Plugin mit `getAssets`. Ein Core älter als 4.13.0 ruft
  `getAssets` nie auf, und der Build endet trotzdem mit 0;
  `assertCoreVersion` macht daraus einen Fehler. Ein solches Plugin erklärt
  außerdem `"peerDependencies": { "@nera-static/core": ">=4.13.0" }`.
- **Dateien laufen über `getAssets`.** Core löscht `public/`, nachdem die
  Plugins gelaufen sind; was ein Plugin direkt dorthin schreibt, geht
  verloren. Die Dateien eines Plugins liegen unter `_nera/<name>.*`.

## Konfiguration

`src/config.js` beschreibt die Konfigurationsdatei einmal: ihre
Standardwerte und einen Reader je Schlüssel der obersten Ebene.
`createConfigReader` aus `@nera-static/plugin-utils/config` erledigt den
Rest: Es kopiert die Standardwerte, überspringt leere Schlüssel, ignoriert
unbekannte und gibt die Warnungen aus.

```js
import { createConfigReader, loadPluginConfig } from '@nera-static/plugin-utils/config'
import { isText } from '@nera-static/plugin-utils/values'
import { log } from './log.js'

const reader = createConfigReader({
    file: 'config/example.yaml',
    defaults: { heading: 'Related pages', limit: 3 },
    readers: {
        heading: (value, current, r) => (isText(value) ? value.trim() : r.bad('heading', value, current)),
        limit: (value, current, r) => (Number.isInteger(value) && value > 0 ? value : r.bad('limit', value, current)),
    },
    warn: log.warn,
})

export function loadConfig({ cwd = process.cwd(), app } = {}) {
    return reader.normalize(loadPluginConfig('example', { cwd, app }))
}
```

- **`loadPluginConfig(name, { cwd, app })`** liest die `config/<name>.yaml`
  der Website, oder die aus dem Ordner, den `app.folders.config` nennt. Gib
  das `app` mit, das dein Hook bekommt.
- **`reader.normalize(raw)`** gibt eine frische Kopie der Standardwerte
  zurück, in der jeder gültige Schlüssel ersetzt ist. Fehlt die Datei, gibt
  es kommentarlos die Standardwerte; ein in YAML leer gelassener Schlüssel
  behält seinen Standardwert.
- **Jeder Schlüssel hat einen Reader**, und ein Reader gibt entweder den
  geprüften Wert zurück oder ruft `r.bad(key, value, fallback)`,
  `r.ignore(where, what)` oder `r.unknown(where, key)` auf. Ein Schlüssel ohne
  Reader wird als unbekannt gemeldet.
- **Die mitgelieferte `config/<name>.yaml` entspricht den Standardwerten.**
  Ein Test liest sie ein und vergleicht sie mit `reader.defaults()`.

## Warnungen und Fehler

`src/log.js` legt den Logger des Pakets einmal an:

```js
import { createLogger } from '@nera-static/plugin-utils/log'

export const log = createLogger('plugin-example')
```

Jede Meldung, die ein Plugin ausgibt, läuft darüber. So sieht man im
Build-Log, woher eine Meldung kommt:

```text
⚠️ plugin-example: config/example.yaml: expected a mapping at the top level, using defaults
⚠️ plugin-example: config/example.yaml: ignoring unknown key "limits"
⚠️ plugin-example: config/example.yaml: invalid limit 0, using 3
⚠️ plugin-example: /blog/first.html: no date — add `date:` to its frontmatter
```

- `log.warn(message)` gibt `⚠️ plugin-<name>: <message>` aus. Die
  Konfigurationsmeldungen oben kommen vom Config-Reader; schreib keine
  eigenen.
- `log.page(page, what, todo)` warnt zu einer Seite:
  `<page>: <what> — <todo>`. Sag, was falsch ist und was zu tun ist.
- `log.info(message)` gibt `ℹ️ plugin-<name>: <message>` aus, für eine
  seltene Zusammenfassung.
- **Kein nacktes `console.*`** im Laufzeitcode eines Plugins. `nera-stan`
  lehnt es ab (Regel `nera/shared-logger`, ab Version 1.0.0).
- **Ein Fehler, der den Build stoppen soll, wird geworfen**, nicht
  geloggt: `throw new Error('plugin-<name>: …')`, mit demselben Präfix und
  ohne Emoji, wie es `assertCoreVersion` tut:

```text
plugin-example: @nera-static/core 4.12.0 is too old; it needs >= 4.13.0 (the getAssets hook). Update with `npm update @nera-static/nera` (or `@nera-static/core`).
```

Die Feature-Module in `src/` importieren den Logger nicht. Sie bekommen
einen `onWarning`-Callback, wie `relatedPages` oben, damit sie reine
Funktionen bleiben und ein Test ihre Warnungen einsammeln kann.

## Templates

- Views sind flach: `views/<template>.pug`, Unterordner nur für
  `partials/` und `helper/`.
- Eine Website bekommt sie über `npm run publish-template` (und
  `nera add`), das sie nach `views/vendor/plugin-<name>/` kopiert.
- **Das Markup und die BEM-Klassennamen sind ein öffentlicher Vertrag.**
  Websites haben Kopien der Templates und gestalten die Klassen mit ihrem
  eigenen CSS; wer `.tag-cloud__item` umbenennt, bricht sie: Das ist ein
  Major-Release.
- Standard-Styles nutzen Custom Properties namens `--nera-<name>-*`, wie
  `--nera-code-*` in `plugin-code-blocks`. Die vollständige Präfix-Regel
  steht auf der Seite
  [Themes und Starter](/de/docs/style-guide/themes-and-starters.html#custom-properties).

## package.json

Die Schlüssel kommen in dieser Reihenfolge. Lass weg, was nicht zutrifft.

```json
{
    "name": "@nera-static/plugin-example",
    "version": "1.0.0",
    "description": "A plugin for the Nera static site generator that adds related pages.",
    "main": "index.js",
    "type": "module",
    "exports": { ".": "./index.js" },
    "bin": { "nera-example": "bin/publish-template.js" },
    "scripts": {
        "publish-template": "node ./bin/publish-template.js",
        "lint": "nera-stan",
        "test": "vitest run",
        "test:watch": "vitest",
        "prepare": "husky"
    },
    "files": ["bin", "config", "index.js", "src", "views", "assets", "CHANGELOG.md"],
    "keywords": ["nera", "nera-plugin", "static-site-generator", "related-pages"],
    "author": "Michael Becker",
    "license": "MIT",
    "repository": { "type": "git", "url": "git+https://github.com/seebaermichi/nera-plugin-example.git" },
    "bugs": { "url": "https://github.com/seebaermichi/nera-plugin-example/issues" },
    "homepage": "https://github.com/seebaermichi/nera-plugin-example#readme",
    "publishConfig": { "access": "public" },
    "sideEffects": false,
    "engines": { "node": ">=22.12.0" },
    "peerDependencies": { "@nera-static/core": ">=4.13.0" },
    "dependencies": { "@nera-static/plugin-utils": "^1.7.0" },
    "devDependencies": { "@nera-static/core": "^4.15.1", "@nera-static/stan": "^1.0.0", "husky": "^9.1.7", "vitest": "^5.0.0" }
}
```

- `bin` und das Skript `publish-template` nur mit `views/`; `views` und
  `assets` in `files` nur, wenn es die Ordner gibt. `CHANGELOG.md` steht
  immer in `files`.
- `peerDependencies` auf Core nur bei einem Plugin mit `getAssets` (und
  damit mit der Prüfung).
- `engines.node` ist die Untergrenze von Core.
- `keywords` enthalten immer `nera`, `nera-plugin` und
  `static-site-generator`, nie das allgemeine `plugin`.
- Schreib die `package.json` so, wie `npm pkg fix` sie hinterlässt:
  `bin`-Pfade ohne führendes `./`, `repository.url` mit dem Präfix `git+`.

## README

Die Abschnitte kommen in dieser Reihenfolge. Lass die optionalen weg, die
nicht zutreffen, und füge keine anderen dazwischen ein.

```markdown
# @nera-static/plugin-example
[![Test](…/actions/workflows/test.yml/badge.svg)](…/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/@nera-static/plugin-example)](https://www.npmjs.com/package/@nera-static/plugin-example)

A plugin for the [Nera](https://nera.js.org) static site generator that …

## ✨ Features
## 🚀 Installation          nera add example, then npm install … as the manual path
## 🧩 Usage                 a minimal working example
## ⚙️ Configuration         a key | default | meaning table, then the full shipped YAML
## <feature sections>       plain headings without emoji, e.g. "Multilingual sites"
## 🛠️ Template Publishing   only with views/
## 🎨 Styling               only with views/: the BEM classes are the public contract
## 📊 Generated Output      the exact app.<key> / meta.<key> shape
## ⚠️ Warnings              optional: the messages and what to do about them
## Known limitations        optional
## 🧩 Compatibility         core floor, Node floor, plugin order (start: / end:)
## 🧪 Development
## 🤝 Contributing          one line linking the shared contributing guide
## 📦 License
```

- Ein Plugin mit der Core-Prüfung sagt das direkt unter dem ersten Absatz:
  `Requires @nera-static/core 4.13.0 or later`, verlinkt auf Compatibility.
- **Die README ist die öffentliche Spezifikation.** Alles, was ein Nutzer
  braucht, etwa ein Markup-Vertrag, steht dort. Verlinke nie eine
  `ROADMAP`-Datei: Sie ist nur lokal, der Link endet in einem 404.
- Kein Abschnitt `Author` und kein Abschnitt `Links`: Beides steht schon in
  der `package.json`.

## CHANGELOG

Jedes Plugin führt eine `CHANGELOG.md` im Format
[Keep a Changelog](https://keepachangelog.com/de/1.0.0/):

```markdown
## [2.0.0] - 2026-11-27

### Changed

-   **BREAKING**: `app.example` is now `app.related`.

### Migration from v1.x

-   Replace `app.example` with `app.related` in your templates.
```

- Eine Überschrift pro Release, `## [x.y.z] - YYYY-MM-DD`, das neueste
  zuerst.
- Nur die Gruppen `### Added`, `### Changed`, `### Fixed` und
  `### Removed`.
- Aufzählungspunkte schreibst du `-   …`, Bindestrich und drei
  Leerzeichen, damit der Text in Spalte 4 beginnt.
- Ein brechender Eintrag beginnt mit `**BREAKING**:`, und ein
  Major-Release hat einen Abschnitt `### Migration from vX.x` mit dem Vorher
  und Nachher.
- **Versionssprung und CHANGELOG-Eintrag gehören in denselben Commit wie
  die Änderung**, nicht erst zum Release.

Was als was zählt:

- **Major** — die Rückgabeform eines Hooks, ein umbenannter oder entfernter
  Konfigurationsschlüssel oder ein Standardwert mit neuer Bedeutung, ein
  umbenanntes `app.<key>` oder `meta.<key>`, geändertes Template-Markup oder
  geänderte BEM-Klassen, eine höhere Core-Untergrenze.
- **Minor** — ein neuer Konfigurationsschlüssel mit sinnvollem
  Standardwert, ein neues Template, ein neues `app.<key>` neben den
  bisherigen, eine höhere Node-Untergrenze, dokumentiert als die
  tatsächliche.
- **Patch** — ein Bugfix mit gleicher Ausgabeform, README und interne
  Änderungen.
- **Kein Release** — eine aufgefrischte `package-lock.json`,
  devDependency-Updates, CI-, husky- oder Lint-Konfiguration.
