---
layout: pages/docs.pug
title: Nera mit KI nutzen
slug: using-ai
lang: de
description: Mit einem KI-Assistenten an einer Nera-Website arbeiten — AGENTS.md, Doku für KI, die Prüfschleife und Beispiel-Prompts.
pagination_order: 8
---

# Nera mit KI nutzen

KI-Assistenten kennen Eleventy, Hugo und Astro gut, Nera dagegen kaum. Auf sich
allein gestellt raten sie — und raten falsch: hübsche URLs, ein fehlendes
`layout`, Änderungen in `public/`. Nera gibt ihnen die Fakten auf zwei Wegen:
eine Anweisungsdatei in jeder Website und die Doku als reines Markdown.

## Was jede Website mitbringt

Eine Website, die mit `npx @nera-static/nera new` erstellt wurde (ab
`@nera-static/nera` 1.6.0), enthält zwei Dateien für KI-Assistenten:

- **`AGENTS.md`** — die Anweisungsdatei, die Codex, Cursor, GitHub Copilot,
  Gemini CLI und andere Assistenten lesen. Sie sagt, was Nera ist (und dass es
  nicht Eleventy, Hugo, Astro oder Jekyll ist), beschreibt die Ordner, listet
  die Befehle, nennt die üblichen Stolperfallen — eine Seite braucht `layout`,
  URLs enden auf `.html`, `public/` wird bei jedem Build gelöscht — und sagt,
  dass vor einer eigenen Funktion erst der Plugin-Katalog dran ist.
- **`CLAUDE.md`** — eine Zeile, `@AGENTS.md`, damit Claude Code denselben Text
  lädt.

`AGENTS.md` endet mit einem Abschnitt **Notes for this site** unter der
Markierungszeile `<!-- nera:site-notes … -->`. Dieser Teil gehört dir: Schreib
dort Zielgruppe, Tonfall, Sprachen, Seiten, die sich nicht ändern dürfen, und
das Hosting hinein. Der Teil über der Markierung gehört Nera.

**Eine bestehende Website?** Ab `@nera-static/nera` 1.7.0 legt
`npx nera update` `AGENTS.md` und `CLAUDE.md` an, wenn sie fehlen, und frischt
nur Neras Teil der `AGENTS.md` auf — deine Notizen bleiben. Die Details stehen
in der [CLI-Referenz](/de/docs/cli.html) unter „Anweisungen für
KI-Assistenten“.

## Je nach Assistent

Öffne im Assistenten den Ordner der Website — den mit `package.json` und
`AGENTS.md` —, damit er die Anweisungen findet.

- **Claude Code** liest `CLAUDE.md`, die `AGENTS.md` einbindet.
- **OpenAI Codex** liest `AGENTS.md`.
- **Cursor**, **GitHub Copilot** und andere Coding-Assistenten, die die
  `AGENTS.md`-Konvention unterstützen, lesen sie ebenfalls.
- **Chat-Assistenten ohne Zugriff auf deine Dateien** (claude.ai, ChatGPT und
  ähnliche) sehen `AGENTS.md` nie. Gib ihnen stattdessen Neras Doku im Prompt
  mit — siehe nächster Abschnitt.

## Doku für KI

nera.js.org veröffentlicht die Doku für Assistenten, auf Englisch:

- [`https://nera.js.org/llms.txt`](https://nera.js.org/llms.txt) — ein
  Verzeichnis der Doku nach der llms.txt-Konvention;
- [`https://nera.js.org/llms-full.txt`](https://nera.js.org/llms-full.txt) —
  die gesamte englische Doku und alle Tutorials in einer Markdown-Datei;
- eine reine Markdown-Datei neben jeder englischen Doku- und Tutorial-Seite,
  z. B. [`/docs/cli.md`](/docs/cli.md) neben `/docs/cli.html`.

Füg eine dieser URLs in den Prompt eines Chat-Assistenten ein oder häng die
Datei an. Diese Doku gibt es absichtlich nur auf Englisch: Modelle lesen
englische Doku gut und antworten trotzdem auf Deutsch.

## Der Ablauf

1. Bitte um eine Änderung nach der anderen.
2. Lass den Assistenten die Dateien bearbeiten.
3. Er führt `npx nera validate` und dann `npx nera build --check` aus und
   behebt, was sie melden. `AGENTS.md` verlangt das; tut er es nicht, schreib
   es in den Prompt.
4. Sieh dir das Ergebnis mit `npm run dev` unter `http://localhost:3000` an.
5. Prüfe den Diff (`git diff`), bevor du veröffentlichst.

## Beispiel-Prompts

Eine neue Website erstellen — noch gibt es keine `AGENTS.md`, also nenn den
Befehl und die Doku:

```text
Erstelle eine neue Nera-Website im Ordner "baeckerei" mit
npx @nera-static/nera new baeckerei und lies danach ihre AGENTS.md, bevor du
etwas änderst. Neras Doku steht unter https://nera.js.org/llms.txt.
```

Eine Seite hinzufügen:

```text
Füge eine Seite "Über uns" unter pages/about.md hinzu, mit demselben Layout
wie pages/index.md, und verlinke sie in der Navigation. Führe dann
npx nera validate und npx nera build --check aus und behebe, was sie melden.
```

Ein Kontaktformular mit dem Plugin einbauen:

```text
Baue auf der Kontaktseite ein Kontaktformular mit
@nera-static/plugin-contact-form ein. Installiere es, kopiere sein Template
mit seinem Befehl, binde es im Seiten-Template ein und trage meine Adresse in
config/contact-form.yaml ein. Schreib kein Formular von Hand.
```

Eine zweite Sprache hinzufügen:

```text
Füge Englisch als zweite Sprache hinzu. Leg die englischen Seiten unter
pages/en/ an, setze lang: en in ihrem Frontmatter, verschiebe die Texte der
Oberfläche in die translations in config/app.yaml und nutze t('key') in den
Templates.
```

Beheben, was `nera validate` meldet:

```text
Führe npx nera validate aus und behebe jeden Fehler und jede Warnung, die es
meldet. Erkläre jede Korrektur in einer Zeile. Führe danach
npx nera build --check aus.
```

In einem Chat-Assistenten ohne Dateizugriff:

```text
Lies https://nera.js.org/llms-full.txt — die Doku des Static-Site-Generators
Nera. Erkläre mir dann, wie ich meiner Nera-Website einen Blog mit Tags
hinzufüge, mit den Dateien, die ich anlegen muss, und ihrem Inhalt.
```

## Was geplant ist

Geplant, noch nicht verfügbar:

- ein **Nera-Skill** (ein Agent Skill), der in jede Website kopiert wird, für
  Assistenten, die Skills laden, plus ein Download für claude.ai und Claude
  Desktop;
- **`--json`-Ausgabe** für `nera validate` und `nera check`, damit Assistenten
  die Befunde direkt lesen können;
- **`nera publish`** — eine Website direkt aus der CLI online bringen;
- ein **MCP-Server** für Nera: ein lokaler für Claude Desktop, Claude Code und
  Cursor sowie ein gehosteter Connector für claude.ai und ChatGPT, der mit
  deinem GitHub-Repository arbeitet.
