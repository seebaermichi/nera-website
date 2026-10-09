---
layout: pages/docs.pug
title: CLI-Referenz
slug: cli
lang: de
description: Die nera-CLI — eine Website erstellen, bauen, in der Vorschau ansehen, aktualisieren und prüfen, auch die gebaute Ausgabe.
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
| `nera build` | `pages/` → `public/` bauen; mit `--check` danach auch das Ergebnis prüfen |
| `nera dev` | Bauen + Live-Reload-Vorschau auf `:3000` |
| `nera serve` | `public/` ausliefern, ohne neu zu bauen |
| `nera update` | Die Nera-Pakete der Website aktualisieren (`npm update`) |
| `nera validate` | Layouts, Includes und YAML vor dem Veröffentlichen prüfen |
| `nera check` | Das gebaute `public/` auf Probleme bei Barrierefreiheit, Datenschutz und Impressum prüfen |

### Die gebaute Website prüfen

`nera validate` liest deine Quellen. `nera check` liest, was der Build erzeugt
hat — die Seite, die Besucher bekommen, mit Layout, Navigation, Footer,
Skripten, Stylesheets und Schriften — und sucht dort nach Problemen, die ein
Parser finden kann:

```bash
nera build --check   # bauen, dann prüfen — der eine Befehl für CI
nera check           # ein vorhandenes public/ prüfen, ohne neu zu bauen
```

Führe zuerst `nera build` aus; ohne `public/` bricht `nera check` mit „run
`nera build` first“ ab. Ein Problem in einem Template wird einmal gemeldet, mit
der Zahl der Seiten, auf denen es auftritt.

Jeder Befund ist standardmäßig eine **Warnung**, der Befehl endet also mit
`0`. Mit `1` endet er nur, wenn eine Regel anschlägt, die du auf `error`
hochgestuft hast — so wird daraus eine Schranke in der CI.

**Das sind Hinweise, keine Rechtsberatung.** Ein sauberer Lauf ist kein
Nachweis von Konformität: Automatische Tests finden nur einen Teil der
Barrierefreiheitsprobleme (etwa ein Drittel der WCAG-Verstöße). Farbkontrast,
sichtbarer Fokus und die Frage, ob ein Gesetz für deine Website überhaupt gilt,
werden nicht geprüft. Jeder Bericht endet mit diesem Hinweis.

| Regel | Standard | Grundlage |
| --- | --- | --- |
| `a11y-html-lang` | Warnung | WCAG 3.1.1 |
| `a11y-title` | Warnung | WCAG 2.4.2 |
| `a11y-h1` | Warnung | WCAG 1.3.1 |
| `a11y-heading-skip` | Warnung | WCAG 1.3.1 |
| `a11y-img-alt` | Warnung | WCAG 1.1.1 |
| `a11y-form-label` | Warnung | WCAG 1.3.1, 4.1.2 |
| `a11y-link-name` | Warnung | WCAG 2.4.4, 4.1.2 |
| `a11y-main` | Warnung | WCAG 1.3.1 |
| `a11y-skip-link` | Warnung | WCAG 2.4.1 |
| `a11y-nav-name` | Warnung | WCAG 1.3.1 |
| `a11y-duplicate-id` | Warnung | WCAG 4.1.2 |
| `a11y-viewport-zoom` | Warnung | WCAG 1.4.4 |
| `a11y-link-lang` | aus (opt-in) | WCAG 3.1.2 |
| `a11y-target-blank` | aus (opt-in) | WCAG 3.2.5 (AAA) |
| `a11y-reduced-motion` | aus (opt-in) | WCAG 2.3.3 (AAA) |
| `privacy-third-party` | Warnung | Art. 6 DSGVO |
| `privacy-insecure` | Warnung | Art. 32 DSGVO |
| `privacy-storage` | aus (opt-in) | § 25 TDDDG |
| `legal-imprint-link` | Warnung | § 5 DDG |
| `legal-privacy-link` | Warnung | Art. 13 DSGVO |
| `legal-outdated-law` | Warnung | DDG, TDDDG, MStV |

Die Prüfungen konfigurierst du in `config/validate.yaml` (optional — ohne die
Datei gelten die Standards oben):

```yaml
rules:
  a11y-img-alt: error         # hochstufen: die Prüfung schlägt fehl
  a11y-target-blank: warning  # eine Opt-in-Regel einschalten
  a11y-skip-link: off         # abschalten
legal:
  imprint:                    # je Sprache die Seite, auf die jede Seite verlinkt
    de: /de/impressum.html
    en: /en/imprint.html
  privacy:
    de: /de/datenschutz.html
    en: /en/privacy.html
privacy:
  allowed_hosts:              # Drittanbieter-Hosts, die du berücksichtigt hast
    - cdn.example.org
```

Um eine Regel auf einer einzelnen Seite stummzuschalten, trage sie im
Frontmatter der Seite ein: `validate_ignore: [a11y-h1]`.

Um eine Regel für ganze Dateien oder Ordner stummzuschalten, liste sie unter
`ignore` auf. Das wirkt auch bei `nera validate` — etwa für `layout-missing`
bei Inhaltsbausteinen, die eine andere Seite einbindet, oder bei Entwürfen, die
absichtlich kein `layout` haben:

```yaml
ignore:
  layout-missing:
    - pages/*/references      # ein Ordner umfasst alles darunter
    - pages/de/blog/drafts    # * steht für einen Ordnernamen
```

Die Pfade sind relativ zum Wurzelordner der Website. Das braucht
`@nera-static/validate` 1.3.0, das `npm update` in eine bestehende Website holt.

**Dein eigener Host.** Um deine Ressourcen von denen Dritter zu unterscheiden,
liest `privacy-third-party` `origin` aus `config/app.yaml`, sonst `app_origin`
aus `config/canonical-links.yaml` (mit und ohne `www.`). Ist beides nicht
gesetzt, gelten nur relative URLs als deine eigenen.

**Links zu Impressum und Datenschutz nur auf Deutsch und Englisch.** Ohne
`legal`-Konfiguration werden die Links an ihrem Text erkannt — *Impressum*,
*Imprint*, *Legal notice*, *Datenschutz*, *Privacy*, *Data protection* — und
nur auf deutschen und englischen Seiten. Für jede andere Sprache nennst du die
Seiten unter `legal.imprint.<lang>` und `legal.privacy.<lang>`.

Die vollständigen Regelbeschreibungen stehen in der
[README von `@nera-static/validate`](https://github.com/seebaermichi/nera-validate#checking-the-built-output).

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
