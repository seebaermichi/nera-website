---
layout: pages/docs.pug
title: Inhalte schreiben
slug: writing-content
lang: de
description: Markdown-Dateien, Frontmatter und die abgeleiteten meta-Werte.
pagination_order: 4
---

# Inhalte schreiben

## Eine Inhaltsdatei

Jede Seite ist eine Markdown-Datei unter `pages/` mit einem YAML-Frontmatter-Block:

```markdown
---
layout: pages/default.pug
title: About
description: What this page is about.
---

# About

Your content goes here.
```

## Wer den Titel schreibt

`title` ist Daten, keine Ausgabe. Ob er auf der Seite landet, entscheidet das
Layout — prüfe das also, bevor du ihn im Text wiederholst:

- Rendert das Layout `meta.title` selbst, **lass die Überschrift im Markdown
  weg** — ein zusätzliches `# Über` setzt den Titel zweimal auf die Seite.
- Tut es das nicht, ist die eigene `#`-Überschrift im Text der einzige Titel der
  Seite, wie im Beispiel oben.

Auf dieser Website rendern `pages/default.pug` und `pages/docs.pug` keinen Titel,
deshalb beginnen diese Seiten mit einer Überschrift. Die Layouts für Tutorials,
Tutorial-Übersicht, Plugins und Tag-Übersicht rendern ihn, deshalb steigt deren
Markdown direkt in den Fließtext ein.

## Frontmatter ist Daten

Alles im Frontmatter landet auf `meta`. Nutze es für Titel, Beschreibungen, Tags,
Reihenfolge — alles, was ein Layout oder Plugin lesen soll.

> YAML-Typen bleiben erhalten: Zahlen bleiben Zahlen, Booleans bleiben Booleans. Prüfe auf
> `meta.x != null`, nicht auf `if (meta.x)`, damit eine legitime `0` oder `false` erhalten bleibt.

## Abgeleitete meta-Werte

Nera fügt diese automatisch hinzu:

| Schlüssel | Bedeutung |
| --- | --- |
| `meta.href` | URL-Pfad der generierten HTML-Datei |
| `meta.dirname` | Verzeichnis, in dem die Seite liegt |
| `meta.filename` | Quelldateiname |
| `meta.createdAt` | `createdAt` oder `date` aus dem Frontmatter, sonst der Erstellungszeitpunkt der Datei |

Setze `createdAt` (oder `date`) im Frontmatter von allem, was nach Datum
sortiert wird, etwa Beiträgen. Ein frischer Checkout in CI gibt jeder Datei
denselben Erstellungszeitpunkt, ohne den Wert geht die Reihenfolge auf dem
Build-Server also verloren.

## Ordner werden zu URLs

`pages/docs/getting-started.md` → `/docs/getting-started.html`. Verschachtelte Ordner
verschachteln URLs — keine Routing-Konfiguration erforderlich.
