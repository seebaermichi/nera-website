---
layout: pages/docs.pug
title: CLI-Referenz
slug: cli
lang: de
description: Die nera-CLI — eine Website erstellen, bauen, in der Vorschau ansehen, aktualisieren und prüfen.
pagination_order: 7
---

# CLI-Referenz

## Die `nera`-CLI (`@nera-static/nera`)

Ein Befehl erstellt, baut, zeigt in der Vorschau, aktualisiert und prüft eine
Website. Eine neue Website erstellst du mit:

```bash
npx @nera-static/nera new <project-name>
```

Eine erstellte Website hängt von `@nera-static/nera` ab, führe diese Befehle also
aus ihrem Inneren aus (der Scaffold verknüpft jeden zusätzlich mit einem
npm-Skript, z. B. `npm run dev`):

| Befehl | Was er macht |
| --- | --- |
| `nera build` | `pages/` → `public/` bauen |
| `nera dev` | Bauen + Live-Reload-Vorschau auf `:3000` |
| `nera serve` | `public/` ausliefern, ohne neu zu bauen |
| `nera update` | Die Nera-Pakete der Website aktualisieren (`npm update`) |
| `nera validate` | Layouts, Includes und YAML vor dem Veröffentlichen prüfen |

### Eine ältere (geklonte) Website migrieren

Vor der CLI erstellte Websites waren Git-Klone, die die Engine unter `src/`
mitführten. Führe in einer solchen Website `nera update --migrate` aus — das fügt
die Abhängigkeit `@nera-static/nera` hinzu, schreibt die Skripte um, entfernt die
mitgeführte `src/`-Engine und installiert, während deine `pages/`, `config/` und
`theme/` unangetastet bleiben.

## Plugin-Publish-Befehle

Jedes Template-ausliefernde Plugin stellt ein Bin bereit, um sein Pug nach
`views/vendor/` zu kopieren, z. B.:

```bash
npx nera-navigation
npx nera-tags
npx nera-search --force   # overwrite existing published templates
```
