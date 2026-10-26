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

`nera new .` erstellt die Website stattdessen im aktuellen, leeren Ordner, und
`--theme <name>` startet sie mit einem Theme. `--starter <name>` startet sie
stattdessen mit einem fertigen Starter-Kit zum Anpassen (`blank`, `blog`,
`business` oder `portfolio`; nicht zusammen mit `--theme`), und
`--name "<site name>"` und `--lang <code>` setzen `name` und `lang` in
`config/app.yaml`:

```bash
npx @nera-static/nera new my-blog --starter blog --name "Mein Blog" --lang de
```

`--no-install` lässt das `npm install` am Ende weg; führe es später selbst aus.

In einem Terminal, ohne `--starter` oder `--yes`, fragt `nera new`, was du
baust, wie die Website heißt und in welcher Sprache sie ist; mit `--yes` oder ohne
Terminal fragt es nie. Die Details stehen unten unter
[Starter-Kits](#starter-kits).

Eine erstellte Website hängt von `@nera-static/nera` ab, führe diese Befehle also
in ihr mit `npx` aus, z. B. `npx nera validate`. Der Scaffold verknüpft
außerdem `build`, `dev` und `serve` mit npm-Skripten, z. B. `npm run dev`:

| Befehl | Was er macht |
| --- | --- |
| `nera build` | `pages/` → `public/` bauen; mit `--check` danach auch das Ergebnis prüfen |
| `nera dev` | Bauen + Live-Reload-Vorschau auf `:3000` |
| `nera serve` | `public/` ausliefern, ohne neu zu bauen |
| `nera update` | Die Nera-Pakete der Website aktualisieren (`npm update`) und ihre `^`-Versionsbereiche in `package.json` auf die installierten Versionen anheben, dann `AGENTS.md` und `CLAUDE.md` anlegen oder auffrischen |
| `nera validate` | Layouts, Includes und YAML vor dem Veröffentlichen prüfen |
| `nera check` | Das gebaute `public/` auf Probleme bei Barrierefreiheit, Datenschutz und Impressum prüfen |

**Demnächst: `nera publish`.** Ein folgendes Release von `@nera-static/nera`
bringt `nera publish`, das eine Website aus ihrem Ordner über GitHub zu einer
erreichbaren URL bringt: Es meldet dich über die GitHub-App „Nera Static“ an,
legt das Repository an (oder verwendet das aus `config/publish.yaml` weiter),
erzeugt `.github/workflows/deploy.yml`, pusht und verfolgt den Actions-Lauf.
Seine Optionen sind `--target <id>`, `--repo <name>`, `--private`, `--yes`,
`--json` und `--sign-out`. Die Hosting-Ziele, GitHub Pages und Netlify, kommen
mit diesem Release; keine Version, die du heute installieren kannst,
veröffentlicht eine Website. Bis dahin baust du die Website und lädst den Inhalt
von `public/` zu einem beliebigen statischen Hoster hoch, wie
[Deployment](/de/docs/deployment.html) beschreibt.

### Starter-Kits

Ein Starter-Kit ist eine ganze Website zum Anpassen: Beispielseiten, Config,
optionale `theme/`-Overrides auf Website-Ebene, Assets und das Theme und die
Plugins, von denen es abhängt. `nera new --starter` kopiert seine `pages/`,
`config/`, `theme/`, `assets/`, `plugins/` und `.neraignore` über das
Basis-Template, ergänzt seine `dependencies` in der `package.json` der Website,
wendet `--name` und `--lang` an, installiert und gibt den Abschnitt
`## First steps` aus der README des Starters aus (nichts, wenn er keinen hat).
Danach gehören die Dateien der Website: Ein Starter hat keinen Update-Weg, das
Theme, von dem er abhängt, wird aber weiter über npm aktualisiert.

`--name "<site name>"` und `--lang <code>` setzen `name:` und `lang:` in
`config/app.yaml`, mit oder ohne Starter. Eine neue Sprache bekommt eine Kopie
des `translations:`-Eintrags der bisherigen Sprache, bereit zum Übersetzen,
sodass keine Seite einen rohen Übersetzungsschlüssel zeigt.

`--starter` nimmt:

- einen Starter-Namen: `blank`, `blog`, `business` oder `portfolio`, kurz für
  `@nera-static/starter-blank` usw.;
- einen Paketnamen: `@acme/starter-shop` oder ohne Scope `nera-starter-shop`;
- eine GitHub-URL: `https://github.com/owner/repo` (optional mit `.git`,
  `#ref`) oder `github:owner/repo#ref`;
- einen lokalen Pfad: `./my-starter`, `../my-starter` oder einen absoluten Pfad.

Pakete und GitHub-Repositories werden mit `npm pack --ignore-scripts`
heruntergeladen, es läuft also kein Skript des Starters. Ein Starter ist ein
Paket, dessen `package.json` ein Feld `nera.starter` hat
(`{ "label": "…", "description": "…" }`); alles andere wird abgelehnt, bevor
irgendetwas geschrieben wird. Ein Starter, der in seiner `config/app.yaml`
`theme:` setzt, lässt die Starter-Templates des Scaffolds weg, wie `--theme`.

Führst du `nera new my-site` in einem Terminal aus, fragt es stattdessen:

```text
What are you building?
  1) Empty — the base template, no starter
  2) …
Choose 1–2 [1]:
Site name [My Nera Site]:
Language [en]:
```

Die Liste kommt aus der npm-Registry (Pakete mit dem Keyword `nera-starter`,
offizielle `@nera-static/`-Pakete zuerst) oder aus einer kurzen Liste, die
die CLI mitbringt, wenn die Registry nicht erreichbar ist. Enter übernimmt den
Standardwert. Jede Frage hat ein Flag (`--starter`, `--name`, `--lang`); mit
`--yes` oder ohne Terminal (Skripte, CI, KI-Agenten) wird nichts gefragt, und
`nera new` erstellt das Basis-Template.

Die offiziellen Starter:

| Starter | Was du bekommst |
| --- | --- |
| `blank` | Ein barrierefreies Layout, kein Theme |
| `blog` | Ein Blog auf `@nera-static/theme-blog` mit Tags, einem Archiv, einem Atom-Feed und einer Sitemap |
| `business` | Eine Website für ein kleines Unternehmen auf `@nera-static/theme-business` mit Leistungen, Öffnungszeiten und einem Kontaktformular |
| `portfolio` | Ein Designer-Portfolio auf `@nera-static/theme-business` mit Projekten in Bildergalerien, einer Über-mich-Seite und einem Kontaktformular |

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
| `privacy-consent-leak` | Warnung | § 25 TDDDG |
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

**Ressourcen hinter einer Einwilligung.** Ein Skript oder eine Einbettung im
Markup von `@nera-static/plugin-consent` (`type="text/plain"` mit `data-src`,
oder `data-consent-src` statt `src`) lädt beim Seitenaufruf nichts, also meldet
`privacy-third-party` es nicht. Ein Element mit `data-consent`, das trotzdem
lädt, meldet `privacy-consent-leak`. Das Tutorial
[Einen Consent-Banner einbauen — oder keinen](/de/tutorials/consent-banner.html)
zeigt beides.

**Links zu Impressum und Datenschutz nur auf Deutsch und Englisch.** Ohne
`legal`-Konfiguration werden die Links an ihrem Text erkannt — *Impressum*,
*Imprint*, *Legal notice*, *Datenschutz*, *Privacy*, *Data protection* — und
nur auf deutschen und englischen Seiten. Für jede andere Sprache nennst du die
Seiten unter `legal.imprint.<lang>` und `legal.privacy.<lang>`.

Die vollständigen Regelbeschreibungen stehen in der
[README von `@nera-static/validate`](https://github.com/seebaermichi/nera-validate#checking-the-built-output).

### Anweisungen für KI-Assistenten

Jede neu angelegte Website enthält eine `AGENTS.md` – die Datei, die Codex,
Cursor, Copilot und andere Assistenten zuerst lesen – und eine `CLAUDE.md` mit
der einzigen Zeile `@AGENTS.md`, damit Claude Code denselben Text lädt.
`AGENTS.md` endet mit einem Abschnitt **Notes for this site** für deine eigenen
Anweisungen, unterhalb der Markierungszeile `<!-- nera:site-notes … -->`. Lass
diese Zeile stehen: Der Teil darüber gehört Nera, der Teil darunter dir.

Ab `@nera-static/nera` 1.7.0 hält `nera update` beide Dateien aktuell, ohne
zusätzliche Option. Nach dem Aktualisieren der Pakete (und nach
`nera update --migrate`)

- legt es `AGENTS.md` und `CLAUDE.md` an, wenn sie fehlen, sodass auch eine
  ältere Website sie bekommt;
- ersetzt es nur den Teil von `AGENTS.md` oberhalb der Markierungszeile durch
  den Text aus dem installierten `@nera-static/nera`; die Markierungszeile und
  deine Notizen darunter bleiben genau, wie sie sind;
- lässt es eine `AGENTS.md` ohne Markierungszeile unverändert und gibt einen
  Hinweis aus – kopiere die Markierungszeile aus der Vorlage direkt über deine
  eigenen Notizen, um mitzumachen;
- fasst es eine vorhandene `CLAUDE.md` nie an.

Eine Datei wird nur geschrieben, wenn sich ihr Inhalt ändert; ein erneutes
`nera update` ändert also nichts.

### Eine ältere (geklonte) Website migrieren

Vor der CLI erstellte Websites waren Git-Klone, die die Engine unter `src/`
mitführten. Führe in einer solchen Website `nera update --migrate` aus — das fügt
die Abhängigkeit `@nera-static/nera` hinzu, schreibt die Skripte um, entfernt die
mitgeführte `src/`-Engine und installiert, während deine `pages/`, `config/` und
`theme/` unangetastet bleiben.

## Plugin-Publish-Befehle

Jedes Template-ausliefernde Plugin stellt ein Bin bereit, um sein Pug nach
`theme/views/vendor/` zu kopieren, z. B.:

```bash
npx nera-navigation
npx nera-tags
npx nera-search --force   # overwrite existing published templates
```
