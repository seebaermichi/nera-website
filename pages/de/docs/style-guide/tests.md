---
layout: pages/docs.pug
title: Tests
slug: style-guide-tests
lang: de
description: Wie jedes Nera-Paket seine Tests schreibt — Aufbau und Namen, eine vitest.config.js, die Test-Skripte, die Schreibregeln und die Integrationsmuster je Art von Paket.
pagination_order: 4
---

# Tests

Jedes Nera-Paket wird mit [vitest](https://vitest.dev) getestet, und jedes
Paket schreibt seine Tests auf dieselbe Weise: dieselben Ordner, dieselben
Dateinamen, dieselbe Konfiguration, derselbe Stil innerhalb eines Tests.
Öffnest du die Tests irgendeines Nera-Pakets, findest du den
End-to-End-Test in derselben Datei, die Fixtures im selben Ordner und
dieselbe Formulierung in jedem `it`.

## Aufbau und Namen

```text
test/
├── <module>.test.js          # eine Datei pro Quellmodul
├── integration.test.js       # der End-to-End-Test über Core oder die CLI
├── helpers.js                # die eigenen Helfer des Pakets, wenn es welche braucht
├── helpers/<topic>.js        # statt helpers.js, sobald ein zweites Thema dazukommt
├── fixtures/<name>/          # Daten, die ein Test liest
├── site/                     # eine ganze Fixture-Website (Themes, Starter)
└── global-setup.js           # nur für Builds, die mehrere Dateien teilen
```

- **Tests liegen in `test/`** im Wurzelverzeichnis des Repositorys, nie in
  `src/`.
- **Eine Datei pro Quellmodul**: `src/config.js` wird in
  `test/config.test.js` getestet.
- **Der End-to-End-Test ist immer `test/integration.test.js`**: Er baut eine
  Website über Core oder ruft die CLI auf. Themes haben stattdessen eine
  Datei pro Abschnitt ihres Vertrags und lesen die Builds aus
  `test/global-setup.js`
  (siehe [Themes und Starter](/de/docs/style-guide/themes-and-starters.html#tests-eines-themes)).
- **Keine Infixe**: kein `.unit.`, `.integration.` oder `.template.` im
  Dateinamen. Ordner und Modulname sagen genug.
- **Fixtures**: Daten in `test/fixtures/<name>`, eine ganze Fixture-Website
  in `test/site/`.
- **Helfer**: die eigenen Helfer des Pakets in `test/helpers.js`, aufgeteilt
  in `test/helpers/<topic>.js`, sobald ein zweites Thema dazukommt (zum
  Beispiel `test/helpers/fake-github.js`). Ein Helfer, den mehr als ein
  Paket braucht, gehört in `@nera-static/test-utils`, nicht in eine Kopie.
- **`test/global-setup.js` nur für Builds, die mehrere Dateien teilen**, wie
  bei Themes und Startern, wo ein Build der Fixture pro Datei zu langsam
  wäre.

## vitest.config.js

Jedes Repository hat eine `vitest.config.js`, und sie beginnt mit demselben
Inhalt:

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['test/**/*.test.js'],
        environment: 'node',
        restoreMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,
    },
})
```

- **`restoreMocks`, `unstubEnvs` und `unstubGlobals`** machen nach jedem Test
  jeden Spy, jede gestubbte Umgebungsvariable und jedes gestubbte Global
  rückgängig. So muss kein Test hinter sich aufräumen, und keiner wirkt in
  den nächsten hinein.
- **Kein `globals: true`.** Tests importieren, was sie brauchen, aus
  `'vitest'`.
- **Alles Weitere kommt nur hinzu, wenn das Paket es braucht, mit einem
  Kommentar, der sagt warum**: `testTimeout` und `hookTimeout`, wenn jeder
  Test eine Website baut, `globalSetup: ['test/global-setup.js']` für
  gemeinsame Builds, `isolate: false`, wo die Testdateien keinen gemeinsamen
  Zustand berühren.
- **Ein Timeout, den nur wenige Tests brauchen, bleibt an diesen Tests**,
  als drittes Argument von `it`, nicht in der Konfiguration.

## Skripte

```json
"scripts": {
    "lint": "nera-stan",
    "test": "vitest run",
    "test:watch": "vitest",
    "prepare": "husky"
}
```

- **`npm test` führt die Suite einmal aus und endet**, derselbe einzelne
  Durchlauf, den die CI (`npx vitest run` in `test.yml`) und der
  husky-Hook `pre-push` ausführen. Der Watch-Modus ist
  `npm run test:watch`.
- **Kein Coverage-Skript**, bis jemand Coverage braucht.
- **`npm run lint` führt `nera-stan` aus**, das auch die Testdateien prüft
  (siehe [Werkzeuge](/de/docs/style-guide/tooling.html)).

## Tests schreiben

```js
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { loadConfig } from '../src/config.js'

const ROOT = path.resolve(import.meta.dirname, '..')

describe('loadConfig', () => {
    it('returns the defaults when the config file is missing', () => {
        expect(loadConfig({ cwd: path.join(ROOT, 'test/fixtures/empty') })).toEqual({ heading: 'Related pages', limit: 3 })
    })

    it('warns about an unknown key and ignores it', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const config = loadConfig({ cwd: path.join(ROOT, 'test/fixtures/unknown-key') })

        expect(config).not.toHaveProperty('limits')
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('ignoring unknown key "limits"'))
    })
})
```

- **Alles ausdrücklich aus `'vitest'` importieren**, und `it` verwenden,
  nie `test`.
- **`describe` nennt die Einheit** (eine Funktion, ein Modul, einen Befehl)
  oder das Szenario, kleingeschrieben:
  `describe('a site deployed under base_path')`.
- **`it` beschreibt das Verhalten im Präsens, ohne „should“**:
  `it('copies the stylesheet')`, nicht `it('should copy the stylesheet')`.
- **Englisch**, in Namen und Kommentaren.
- **Nur `expect`**, keine andere Assertion-Bibliothek.
- **Keine Datei-Snapshots.** Schreib die erwarteten Werte aus. Ein
  Inline-Snapshot ist in Ordnung für langes generiertes Markup, etwa das
  `<picture>`-Element des Bilder-Plugins.
- **Pfade an der Testdatei verankern**:
  `path.resolve(import.meta.dirname, '..')`. Löse nie einen Pfad gegen das
  aktuelle Verzeichnis auf, wie in `path.resolve('views/tags.pug')`: Dann
  besteht der Test nur, wenn vitest im Wurzelverzeichnis des Pakets läuft.
- **Temporäre Ordner nur unter `os.tmpdir()`**, nie im Repository, und nach
  den Tests wieder entfernt.
- **Nie `process.chdir`.** Ein Hook, der `process.cwd()` liest, wird
  getestet, indem man es ausspioniert (`vi.spyOn(process, 'cwd')`) oder
  `cwd` hineinreicht, wie `loadConfig({ cwd })` es erlaubt.
- **Mocken mit `vi.spyOn` und mit hineingereichtem `vi.fn()`** als
  Abhängigkeit. `vi.mock` nur, wenn der Code keine Nahtstelle bietet. Das
  Zurücksetzen übernimmt `restoreMocks`.
- **Eingebaute Module mit dem Präfix `node:`**: `'node:fs'`, `'node:path'`,
  `'node:os'`. Synchrones `fs` ist fürs Schreiben von Fixtures in Ordnung.

`nera-stan` prüft vier dieser Regeln in jeder Testdatei, ab Version 1.0.0:
`nera/test-no-chdir`, `nera/test-no-cwd-path`, `nera/test-name` und
`nera/test-helpers`.

## Integrationstests

Wie der End-to-End-Test seine Website baut, hängt von der Art des Pakets ab:

- **Plugins**: `test/integration.test.js` legt in einem temporären Ordner
  eine Website mit dem getesteten Plugin an, baut sie über
  `@nera-static/core` und prüft die Dateien in `public/`. Dafür hat jedes
  Plugin `@nera-static/core` als devDependency. Die Unit-Tests eines Hooks
  führen ihn gegen eine temporäre Website aus, indem sie `process.cwd()`
  darauf zeigen lassen, nicht indem sie das Verzeichnis wechseln.
- **Themes und Starter**: `test/global-setup.js` baut jede Variante der
  Fixture-Website einmal, und die Testdateien lesen die Builds über
  `inject('builds')` von vitest.
- **Die CLI, der Validator und der MCP-Server**: ein temporärer Ordner mit
  den Dateien, die der Test braucht, und das Arbeitsverzeichnis
  hineingereicht oder ausspioniert.

## Gemeinsame Test-Helfer

`@nera-static/test-utils` (kommt) wird die Helfer enthalten, die
Nera-Pakete heute jeweils in ihrer eigenen `test/helpers.js` schreiben:
einen temporären Ordner anlegen und Dateien hineinschreiben, darin eine
Website bauen, ihr `public/` lesen, Konsolenausgaben mitschneiden, die CLI
aufrufen, und die gemeinsamen Suiten für Themes und für das Veröffentlichen
von Templates.

- **Ein allgemeiner Test-Helfer kommt aus `@nera-static/test-utils`**, nicht
  aus einer lokalen Kopie. `nera/test-helpers` lehnt eine Funktion in einer
  Testdatei ab, die den Namen eines seiner Helfer trägt; die Liste der Namen
  kommt mit `nera-stan` 1.0.0.
- **Was nur dein Paket braucht, bleibt in `test/helpers.js`**, etwa eine
  Attrappe eines externen Dienstes.
