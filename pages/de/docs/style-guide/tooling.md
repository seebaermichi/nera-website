---
layout: pages/docs.pug
title: Werkzeuge
slug: style-guide-tooling
lang: de
description: Die Werkzeuge, die die Nera-Handschrift halten — nera-stan in jedem Repository, seine Regeln, Korrekturen und Ausnahmen, die gemeinsame .editorconfig und die wöchentliche Prüfung über alle Repositorys. Kein Prettier.
pagination_order: 5
---

# Werkzeuge

Eine Regel, die nur auf einer Seite steht, verwischt. Jede Regel dieses
Styleguides, die eine Maschine prüfen kann, prüft ein Werkzeug: `nera-stan`,
das jedes Nera-Repository in `npm run lint` ausführt. Was ein einzelnes
Repository nicht sehen kann, etwa einen Helfer, der in zwei Paketen
geschrieben wurde, findet eine wöchentliche Prüfung über alle Repositorys.
Alles Weitere regelt die gemeinsame `.editorconfig`.

## nera-stan

`@nera-static/stan` (Befehl `nera-stan`, ab Version 1.0.0) ist die
Handschrift-Prüfung eines einzelnen Nera-Repositorys. Es ist eine
devDependency jedes Pakets und läuft als dessen Lint-Skript:

```json
"scripts": {
    "lint": "nera-stan"
}
```

So läuft dieselbe Prüfung überall, wo es darauf ankommt:

- **auf deinem Rechner**, mit `npm run lint`, und über die husky-Hooks:
  `pre-commit: npm run lint` vor jedem Commit,
  `pre-push: npm run lint && npx vitest run` vor jedem Push;
- **in der CI**, wo `test.yml` bei jedem Push und Pull Request
  `npm run lint` ausführt und `publish.yml` sich weigert, ein Release zu
  veröffentlichen, das daran scheitert.

`nera-stan` bringt seine eigene ESLint-Konfiguration mit und liest nie die
`eslint.config.js` des Repositorys, also kann kein Repository eine Regel
lockern. Die `eslint.config.js` dient nur deinem Editor und hat zwei
Zeilen:

```js
import nera from '@nera-static/stan'

export default [...nera]
```

### Aufruf

```text
nera-stan [dir] [--fix]
```

- **`dir`** ist das zu prüfende Repository, standardmäßig das aktuelle
  Verzeichnis.
- **`--fix`** wendet die Korrekturen an, die ein eindeutig richtiges
  Ergebnis haben, und überlässt alles andere dir.
- **`--help`** und **`--version`** geben die Hilfe und die Version aus.

`nera-stan` gibt auf stdout einen Befund pro Zeile aus, sortiert nach Datei
und Zeile, mit dem Dateipfad relativ zum Repository, und auf stderr eine
Zusammenfassung:

```text
index.js:14 nera/shared-logger `console.warn` in plugin runtime code: `import { createLogger } from '@nera-static/plugin-utils/log'`, create one logger with `createLogger('plugin-example')` and call its `warn`/`info` instead
src/related.js:3 @stylistic/comma-dangle Missing trailing comma.
nera-stan: 2 problems (1 fixable with --fix)
```

Der Exit-Code sagt, wie es ausging:

| Exit-Code | Bedeutung                                                 |
| --------- | --------------------------------------------------------- |
| `0`       | sauber                                                    |
| `1`       | Befunde                                                   |
| `2`       | ein Aufruffehler, eine fehlende oder ungültige `package.json` oder ein interner Fehler |

Jede Regel ist ein Fehler. Es gibt keine Warnstufe: Was `nera-stan` meldet,
wird behoben, oder es ist eine dokumentierte Ausnahme.

### Arten von Repositorys

Manche Regeln gelten nur für manche Arten von Repository. `nera-stan` liest
die Art aus der `package.json`, aus nichts anderem:

| Art       | Erkannt an                                                                  |
| --------- | --------------------------------------------------------------------------- |
| `core`    | dem Namen `@nera-static/core`                                               |
| `starter` | einem Feld `nera.starter`                                                   |
| `theme`   | einem Namen `@nera-static/theme-*` oder einem Feld `nera.generator`         |
| `plugin`  | einem Namen `@nera-static/plugin-*`, außer `@nera-static/plugin-utils`      |
| `site`    | keinem `@nera-static/`-Namen und einer Abhängigkeit von `@nera-static/nera` |
| `tool`    | allem anderen: die CLI, der Validator, plugin-utils, der MCP-Server, …     |

### Was es prüft

In jeder Art, für jede `.js`-, `.mjs`- und `.cjs`-Datei:

- **Die empfohlenen Regeln von ESLint**, mit den Node-Globals (den
  Browser-Globals für Skripte unter `assets/`, denen von vitest in
  Testdateien).
- **Die Formatierung**: 4 Leerzeichen, keine Semikolons, einfache
  Anführungszeichen (doppelte, wo sie Escapes vermeiden), abschließende
  Kommas in mehrzeiligen Literalen, Klammern um jeden Parameter einer
  Pfeilfunktion, Leerzeichen innerhalb geschweifter Klammern, ein
  abschließender Zeilenumbruch, keine Leerzeichen am Zeilenende, höchstens
  120 Zeichen pro Zeile (lange Strings, URLs und Kommentare ausgenommen).
- **`prefer-const`, `no-var` und `no-unused-vars`.**
- **Eingebaute Module mit dem Präfix `node:`** (`n/prefer-node-protocol`).

Und die Nera-Regeln:

| Regel                   | Arten          | Dateien                       | Was sie ablehnt | `--fix` |
| ----------------------- | -------------- | ----------------------------- | --------------- | ------- |
| `nera/no-local-helper`  | alle außer plugin-utils und test-utils | alle außer den Browser-Skripten in `assets/` und `views/` | eine lokale Funktion mit dem Namen oder der Form eines Helfers aus `@nera-static/plugin-utils`; die Meldung nennt den Export, den du importieren sollst | nein |
| `nera/shared-logger`    | plugin         | Laufzeitcode (nicht `test/`, `bin/`, `scripts/`, `views/`, `assets/`) | ein bloßes `console.*`; nimm `createLogger` | nein |
| `nera/no-copied-from`   | alle           | Kommentare überall; `ROADMAP` in veröffentlichten Dateien | einen Vermerk „copied from …“ und einen Verweis auf eine nur lokale `ROADMAP`-Datei | nein |
| `nera/hook-shape`       | plugin         | Laufzeitcode                  | einen Hook, der über `export { … }` exportiert wird, einen Hook, der sein Argument nicht mit Standardwerten destrukturiert, eine Konfiguration, die auf Modulebene gelesen wird | ergänzt die fehlenden Standardwerte |
| `nera/test-no-chdir`    | alle           | Testdateien                   | `process.chdir` | nein |
| `nera/test-no-cwd-path` | alle           | Testdateien                   | einen Pfad, der gegen das aktuelle Verzeichnis aufgelöst wird, wie `path.resolve('views/x.pug')` | nein |
| `nera/test-name`        | alle           | Testdateien                   | einen Testnamen, der mit „should“ beginnt | nein |
| `nera/test-helpers`     | alle           | Testdateien                   | eine lokale Kopie eines Helfers aus `@nera-static/test-utils` | nein |

Testdateien sind alles unter `test/` und jede `*.test.js`. Die Schreibregeln
hinter den Testregeln stehen auf der Seite
[Tests](/de/docs/style-guide/tests.html).

`--fix` ändert nur, was genau ein richtiges Ergebnis hat: die
Formatierungsregeln, das Präfix `node:` und die fehlenden Standardwerte
eines Hooks (aus `({ app, pagesData })` wird
`({ app = {}, pagesData = [] } = {})`). Es schreibt nie `(data)` in ein
destrukturiertes Argument um, und es benennt keine Tests um, denn ohne
„should“ ändert sich die Verbform.

Seit 1.1.0 stehen drei weitere Regelfamilien neben den Code-Regeln:

- `css/*`: jede CSS-Datei durch stylelint, mit dem BEM-Klassenmuster und den
  [Präfixen der Custom Properties](/de/docs/style-guide/themes-and-starters.html#custom-properties).
- `pug/*`: jedes Pug-Template lässt sich parsen, ist in Vielfachen von 4
  Leerzeichen ohne Tabs eingerückt, setzt Attributwerte in einfache
  Anführungszeichen und schreibt BEM-Klassen.
- `structure/*`: `package.json`, README, CHANGELOG, LICENSE, die kanonischen
  Dateien und die Dateien, die jede Art von Repository haben muss.

### Ausnahmen

- **Immer ignoriert**: `node_modules/`, `public/`, `dist/`, `coverage/`,
  `.nera-cache/` und `test/site/public/`, dazu alles, was die `.gitignore`
  des Repositorys aufführt.
- **Die eigenen Ausnahmen eines Repositorys** stehen in der `package.json`,
  unter einem einzigen Schlüssel, und nirgends sonst:

  ```json
  "nera-stan": {
      "ignores": ["test/markup/", "demo/demo.js"],
      "variants": { ".github/workflows/test.yml": "image-cache" },
      "skip": { "structure/test-scripts": "a theme without tests: it compiles its templates instead" }
  }
  ```

  `ignores` ist für Dateien, die kein Nera-Code sind, etwa generierte
  Fixtures oder eine mitgelieferte Demo. `variants` wählt eine benannte
  Variante einer kanonischen Datei, und `skip` schaltet eine Regel mit
  Begründung ab. Die erlaubten Werte nennt die
  [README](https://github.com/seebaermichi/nera-stan#readme).
- **Eine einzelne Zeile** lässt sich mit einem ESLint-Kommentar ausnehmen,
  der die Regel nennt und sagt warum:

  ```js
  // eslint-disable-next-line nera/shared-logger -- the CLI prints its own report
  console.log(report)
  ```

  Ein Disable-Kommentar, der nichts mehr unterdrückt, ist selbst ein
  Fehler, damit keine Ausnahme ihren Grund überlebt. Ein Disable-Kommentar
  ohne Begründung nach ` -- ` ist ebenfalls ein Fehler.

## .editorconfig

Jedes Repository hat dieselbe `.editorconfig`. Sie legt die Einrückung für
die Dateitypen fest, die kein Linter anfasst, etwa Pug, CSS, YAML und JSON,
in jedem Editor, der sie liest:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 4
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

Markdown behält seine Leerzeichen am Zeilenende, denn zwei davon sind dort
ein Zeilenumbruch.

## Die wöchentliche Prüfung über alle Repositorys

`nera-stan` sieht ein Repository auf einmal. `style-check`, ein Skript im
Repository der Engine (`generator/scripts/style-check.js`), liest alle
nebeneinander und meldet, was erst über Repositorys hinweg sichtbar wird:

- Helfer, die in zwei oder mehr Repositorys definiert sind und in
  `@nera-static/plugin-utils` gehören;
- Plugin-Templates und -Skripte, die ein Theme, ein Starter oder die
  Website kopiert hat, verglichen mit der Plugin-Version, aus der sie
  stammen;
- Dateien, die in jedem Repository einer Art gleich sein müssen.

Sie läuft jeden Montag auf einem frischen Klon aller öffentlichen
Nera-Repositorys und schreibt ihren Bericht in die Zusammenfassung des
Workflows. Eine bewusste Abweichung steht mit Begründung in ihrer
Allow-Liste und bleibt im Bericht als erlaubt sichtbar.

## Kein Prettier

Nera verwendet kein Prettier. Die Formatierungsregeln von ESLint setzen die
Handschrift für JavaScript schon durch, ein zweiter Formatierer würde
gegen sie arbeiten, und das Pug-Plugin für Prettier würde jedes Template
umschreiben. Es gibt in einem Nera-Paket keinen Build- oder
Formatierungsschritt: Was du schreibst, prüft `nera-stan`.
