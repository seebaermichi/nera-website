---
layout: pages/docs.pug
title: Styleguide
slug: style-guide
lang: de
description: Die Nera-Handschrift für Mitwirkende — eine Art, jedes Nera-Paket zu schreiben, Helfer nur aus @nera-static/plugin-utils, keine Kopien.
pagination_order: 1
---

# Styleguide

Nera besteht aus vielen kleinen Paketen: der Engine `@nera-static/core`, der
CLI `@nera-static/nera`, dem Validator, dem MCP-Server, rund zwanzig Plugins,
den Themes und den Startern. Jedes davon soll sich lesen wie die anderen. Wer
eines davon öffnet, erkennt Nera auf den ersten Blick; nur das Feature ist
anders. Dieser Styleguide hält diese **eine Handschrift** fest, für alle, die
an einem Nera-Paket mitarbeiten oder ein eigenes Plugin, Theme oder einen
eigenen Starter schreiben.

Um eine Website zu bauen, brauchst du ihn nicht. Dafür beginnst du mit der
[Dokumentation](/de/docs/index.html).

## Der Grundsatz

- **Ein allgemeiner Helfer existiert einmal, in einem gemeinsamen Paket.**
  Prüfen, ob etwas ein einfaches Objekt ist, die Konfiguration eines Plugins
  lesen, eine Warnung ausgeben, die Core-Version prüfen, eine Seiten-URL
  zusammensetzen, ein Seitendatum lesen: Nichts davon wird in einem Plugin,
  Theme, Starter oder Werkzeug neu geschrieben. Es kommt aus
  `@nera-static/plugin-utils`. **Keine Kopien** — auch nicht in Core, der CLI,
  dem Validator oder dem MCP-Server, und auch nicht als auskommentierte Kopie
  „aus plugin-sitemap“.
- **Dasselbe gilt für die Form eines Pakets.** Ein Plugin, ein Theme und ein
  Starter haben je einen Aufbau: dieselben Dateien an denselben Stellen,
  dieselbe Hook-Form, dieselbe Reihenfolge der Schlüssel in `package.json`,
  dieselbe README-Gliederung, dieselbe Art, Tests zu schreiben.
- **Wo sich eine Regel nicht von Hand halten lässt, setzt ein Werkzeug sie
  durch.** Jedes Nera-Repository führt in `npm run lint` dieselben Prüfungen
  aus, und die CI weist zurück, was sie verletzt.
- **Eine unerklärte Variante ist ein Fehler.** Macht dein Paket etwas anders
  als seine Geschwister, erlaubt es entweder der Styleguide, oder ein
  Kommentar an der Abweichung sagt, warum. Sonst wird sie behoben wie ein Bug.

## Warum das wichtig ist

Jedes Nera-Paket wurde früher begonnen, indem ein Geschwister derselben Art
kopiert wurde. Kopien laufen auseinander: Ein Plugin reparierte seinen
Datums-Parser, das nächste behielt den alten Fehler, ein drittes schrieb ihn
mit anderen Regeln neu. Am Ende gab es Dutzende Kopien derselben Helfer in
mehreren Varianten und Fehler, die eine einzige Korrektur an einer Stelle
überall beseitigt hätte. „Kopiere ein Geschwister“ ist nicht mehr die
Anleitung. Dieser Styleguide und die gemeinsamen Pakete sind es.

## Wo der gemeinsame Code liegt

- **`@nera-static/plugin-utils`** enthält jeden allgemeinen Laufzeit-Helfer,
  einen Subpfad je Familie. Ab Version 1.7.0: `/values` (einfache Objekte,
  Textwerte), `/config` (die Konfigurationsdatei eines Plugins lesen und
  normalisieren), `/log` (ein Warnungsformat), `/guard` (die
  Mindestversion von Core) und `/packages` (ein Paket aus der Website
  auflösen). Weitere Familien folgen, etwa URLs, Datumswerte, HTML-Escaping
  und die Seitensprache.
- **`@nera-static/test-utils`** (kommt noch) wird die gemeinsamen
  Test-Helfer enthalten: eine Website in einem temporären Ordner bauen, die
  Ausgabe lesen, die Theme-Suiten.
- **`@nera-static/stan`** (`nera-stan`, ab Version 1.0.0) ist die eine
  Prüfung, die jedes Repository ausführt: Code, CSS, Pug und der Aufbau des
  Pakets.

Bevor du einen Helfer schreibst, schau in `@nera-static/plugin-utils` nach.
Steht er dort nicht und ist er allgemein, gehört er dorthin, nicht in dein
Paket.

## Was der Styleguide abdeckt

Die Seiten dieses Abschnitts verfolgen den Grundsatz durch jede Art von Paket:

1. **Plugins** — der Aufbau eines Plugins: Dateien, die Hook-Form,
   Konfiguration und Warnungen, `package.json`, README und CHANGELOG.
2. **Themes und Starter** — der Aufbau eines Themes und eines Starters, das
   Helfer-Objekt des Themes, die Präfixe der Custom Properties.
3. **Tests** — wo Tests liegen, wie sie heißen und geschrieben werden, und
   die gemeinsamen Helfer.
4. **Werkzeuge** — was `nera-stan` prüft, wie man es ausführt, seine
   dokumentierten Ausnahmen und die gemeinsame `.editorconfig`.
