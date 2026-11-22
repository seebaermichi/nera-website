---
layout: pages/tutorial.pug
title: Responsive Bilder mit plugin-images
slug: responsive-images
lang: de
description: Mach aus den Fotos in deinem Markdown beim Build AVIF und WebP mit srcset, sizes, width und height, ohne Kamera- und GPS-Daten, und speichere die Arbeit zwischen den Builds im Cache.
keywords: nera Bilder, plugin-images, responsive Bilder, avif, webp, srcset, picture-Element, og:image, exif, gps, sharp
tags: plugins, images, privacy
pagination_order: 12
createdAt: 2026-11-22
---
Ein Foto direkt aus der Kamera oder vom Handy ist mehrere Megabyte groß und
Tausende Pixel breit, und es trägt Metadaten: das Kameramodell, die Uhrzeit,
oft die GPS-Position, an der es aufgenommen wurde. Setzt du es so, wie es ist,
in eine Markdown-Seite, lädt jede Besucherin und jeder Besucher all das
herunter, auch auf dem Handy. `@nera-static/plugin-images` behebt das beim
Build. Jedes lokale Bild in deinem Markdown wird zu einem `<picture>` mit AVIF
und WebP in mehreren Breiten, `srcset`/`sizes`, `width`/`height` und Lazy
Loading, und die veröffentlichten Dateien tragen keine Metadaten. Dein
Markdown ändert sich nicht.

Jeder Befehl, jede Konfiguration und jede Ausgabe unten stammt aus einer
frischen `nera new`-Website mit plugin-images 1.0.3, `@nera-static/core`
4.18.3 und `@nera-static/nera` 1.27.2. Das Foto ist ein JPEG mit 4000 × 3000
Pixeln und 4 MB, mit Kamera- und GPS-Daten in seinem EXIF-Block.

## 1. Installieren

```bash
npx nera add images
```

`nera add` installiert das Paket und veröffentlicht die einzige View des
Plugins, das Mixin `picture`, nach `theme/views/vendor/plugin-images/`:

```text
✅ Copied picture.pug to …/theme/views/vendor/plugin-images/picture.pug
✅ Templates copied to: …/theme/views/vendor/plugin-images
✅ Added @nera-static/plugin-images
   Config:    none (the plugin ships no default)
   Templates: published by the plugin
```

Mehr ist nicht einzurichten: Eine `config/images.yaml` ist optional, und
jeder Schlüssel darin auch. Die Starter blog, business und portfolio
(`nera new --starter …`) bringen das Plugin schon mit.

## 2. Vorher und nachher

Leg das Foto in die Assets der Website, nach
`theme/assets/images/photos/pier.jpg`, und verwende es in einer Seite wie
jedes Bild:

```markdown:pages/pier.md
---
layout: pages/default.pug
title: The pier
description: A photo of the pier at dusk
---
# The pier

![The pier at dusk, seen from the beach](/images/photos/pier.jpg)
```

Ohne das Plugin macht `nera build` daraus ein schlichtes `<img>`, das auf das
4 MB große Original zeigt:

```html
<p><img src="/images/photos/pier.jpg" alt="The pier at dusk, seen from the beach"></p>
```

Mit dem Plugin kodiert der erste Build die Varianten:

```text
🖼️  plugin-images: 1 image(s), 12 variant(s) encoded
```

und `public/pier.html` enthält:

```html
<p>
  <picture>
    <source type="image/avif" srcset="/_img/pier-1a5869e3-480.avif 480w, /_img/pier-1a5869e3-800.avif 800w, /_img/pier-1a5869e3-1200.avif 1200w, /_img/pier-1a5869e3-1600.avif 1600w" sizes="100vw">
    <source type="image/webp" srcset="/_img/pier-987422b0-480.webp 480w, /_img/pier-987422b0-800.webp 800w, /_img/pier-987422b0-1200.webp 1200w, /_img/pier-987422b0-1600.webp 1600w" sizes="100vw"><img src="/_img/pier-10e7e41a-1600.jpg" srcset="/_img/pier-10e7e41a-480.jpg 480w, /_img/pier-10e7e41a-800.jpg 800w, /_img/pier-10e7e41a-1200.jpg 1200w, /_img/pier-10e7e41a-1600.jpg 1600w" sizes="100vw" width="1600" height="1200" alt="The pier at dusk, seen from the beach" loading="eager" fetchpriority="high">
  </picture>
</p>
```

- Der Browser nimmt das erste Format, das er kann, AVIF, dann WebP, und das
  `<img>` ist der Fallback. Es behält das Format der Quelle (JPEG bleibt
  JPEG, PNG bleibt PNG) und zeigt immer auf eine bearbeitete Variante, nie
  auf das Original.
- Die Breiten sind die Voreinstellung `480, 800, 1200, 1600`. Eine Quelle
  wird nie hochskaliert: Ein Foto mit 1000 Pixeln Breite bekommt nur 480 und
  800.
- `width` und `height` sind die Maße der größten Variante, damit der Browser
  den Platz reserviert, bevor das Bild lädt, und die Seite nicht springt.
- Das erste Bild einer Seite lädt sofort, mit `fetchpriority="high"`, weil
  es meist das größte Element auf dem Bildschirm ist. Jedes weitere Bild
  bekommt `loading="lazy" decoding="async"`.
- `alt` und alle anderen Attribute deines Bildes bleiben erhalten. Das
  Plugin schreibt nie ein `alt` für dich.

Die Varianten landen in `public/_img/`, mit einem Hash der Quelle und der
Einstellungen im Namen, sodass sich eine URL nur ändert, wenn sich das Bild
ändert. Die Varianten tragen keine EXIF-, GPS- oder ICC-Daten: Das Plugin
wendet die EXIF-Ausrichtung an und entfernt dann alles.

Auf der Testwebsite des Plugins, einem deutsch-englischen Blog, wurden aus
den 4,2 MB Originalen der 32 Inhaltsbilder 0,45 MB AVIF, die ein Handy lädt.

Was das Plugin nicht anfassen soll, lässt es in Ruhe: SVG und GIF, externe
`http(s)://`-URLs, ein `<img>`, das schon ein `srcset` hat oder in einem
`<picture>` steht, und jedes Bild mit `?skip` an seiner URL. Eine Bilddatei,
die es nicht gibt, bleibt ein schlichtes `<img>`, und der Build sagt es:

```text
⚠️ plugin-images: /pier.html: image not found, left as is: /images/photos/missing.jpg
```

Bilder in deinen Pug-**Views** werden nicht bearbeitet. Für sie gibt es
Frontmatter-Bilder und das Mixin (Schritt 5).

## 3. Query-Parameter

Hänge Parameter an die Bild-URL, um ein einzelnes Bild zu ändern. Die
Parameter erreichen die veröffentlichten URLs nie. Dieses Bild ist höchstens
800 Pixel breit, auf 16:9 zugeschnitten um einen Punkt 30 % von links und
60 % von oben:

```markdown:pages/pier.md
![The end of the pier](/images/photos/pier.jpg?w=800&ratio=16:9&focus=30,60)
```

```html
<picture>
  <source type="image/avif" srcset="/_img/pier-7a863ccf-480.avif 480w, /_img/pier-7a863ccf-800.avif 800w, /_img/pier-7a863ccf-1600.avif 1600w" sizes="(min-width: 800px) 800px, 100vw">
  <source type="image/webp" srcset="/_img/pier-f3e554c6-480.webp 480w, /_img/pier-f3e554c6-800.webp 800w, /_img/pier-f3e554c6-1600.webp 1600w" sizes="(min-width: 800px) 800px, 100vw"><img src="/_img/pier-85ac4388-1600.jpg" srcset="/_img/pier-85ac4388-480.jpg 480w, /_img/pier-85ac4388-800.jpg 800w, /_img/pier-85ac4388-1600.jpg 1600w" sizes="(min-width: 800px) 800px, 100vw" width="1600" height="900" alt="The end of the pier" loading="lazy" decoding="async">
</picture>
```

`?w=800` behält die konfigurierten Breiten unter 800, fügt 800 und 1600 hinzu
(für Bildschirme mit doppelter Pixeldichte) und setzt ein passendes `sizes`.
Der Zuschnitt macht das Bild 1600 × 900 groß. Die Parameter:

| Parameter | Was er tut | Beispiel |
|---|---|---|
| `w` | Maximale Anzeigebreite in Pixeln | `?w=800` |
| `h` | Zielhöhe; mit `w` schneidet er zu | `?w=800&h=450` |
| `ratio` | Auf ein Seitenverhältnis zuschneiden | `?ratio=16:9` |
| `fit` | `cover` (Voreinstellung bei einem Zuschnitt), `contain` oder `inside` | `?fit=contain` |
| `focus` | Fokuspunkt eines Zuschnitts in Prozent, oder `attention` / `entropy` | `?focus=30,60` |
| `q` | Qualität für alle Formate, 1–100 | `?q=60` |
| `formats` | Moderne Formate für dieses Bild, oder `none` | `?formats=webp` |
| `sizes` | `sizes` für dieses Bild, URL-kodiert | `?sizes=50vw` |
| `loading` | `eager` oder `lazy`, übergeht die Erstes-Bild-Regel | `?loading=eager` |
| `skip` | Dieses Bild unverändert lassen | `?skip` |

Einen Parameter, den das Plugin nicht kennt, ignoriert es mit einer Warnung,
sodass ein Tippfehler nicht unbemerkt bleibt:

```text
⚠️ plugin-images: /pier.html: unknown parameter "width" ignored: /images/photos/pier.jpg?width=800
```

## 4. Bildunterschriften

Gib einem Bild einen Markdown-Titel und stell es allein in seinen Absatz:

```markdown:pages/pier.md
![The pier at dusk](/images/photos/pier.jpg "Usedom, October 2026")
```

Es wird zu einer `<figure>` mit dem Titel als Bildunterschrift. Die
`<figure>` ersetzt den Absatz, denn eine `<figure>` in einem `<p>` ist
ungültiges HTML:

```html
<figure class="nera-image">
  <picture>
    <source type="image/avif" srcset="/_img/pier-1a5869e3-480.avif 480w, /_img/pier-1a5869e3-800.avif 800w, /_img/pier-1a5869e3-1200.avif 1200w, /_img/pier-1a5869e3-1600.avif 1600w" sizes="100vw">
    <source type="image/webp" srcset="/_img/pier-987422b0-480.webp 480w, /_img/pier-987422b0-800.webp 800w, /_img/pier-987422b0-1200.webp 1200w, /_img/pier-987422b0-1600.webp 1600w" sizes="100vw"><img src="/_img/pier-10e7e41a-1600.jpg" srcset="/_img/pier-10e7e41a-480.jpg 480w, /_img/pier-10e7e41a-800.jpg 800w, /_img/pier-10e7e41a-1200.jpg 1200w, /_img/pier-10e7e41a-1600.jpg 1600w" sizes="100vw" width="1600" height="1200" alt="The pier at dusk" loading="lazy" decoding="async">
  </picture>
  <figcaption class="nera-image__caption">Usedom, October 2026</figcaption>
</figure>
```

Dasselbe Foto wie in Schritt 2 verwendet dieselben Varianten: Nichts wird
zweimal kodiert. Ein Bild mitten im Text, in einem Link oder neben einem
anderen Bild behält sein `title` und bekommt keine Figure. `figure: false`
in `config/images.yaml` schaltet Bildunterschriften ab. Die Klassen
`nera-image` und `nera-image__caption` sind das öffentliche Markup des
Plugins, gestalte sie also in deinem eigenen CSS.

## 5. Frontmatter-Bilder und das Mixin `+picture`

Das Titel- oder Teaserbild eines Blogposts steht meist im Frontmatter und
wird von einer View gerendert, nicht vom Markdown. Nenn es unter `image`:

```markdown:pages/beach.md
---
layout: pages/post.pug
title: A day at the beach
description: A post with a hero image
image: /images/photos/beach.jpg
image_alt: Waves on an empty beach
---
# A day at the beach

The hero image above comes from the frontmatter.
```

Das Plugin kodiert die Varianten dafür und legt die fertigen Daten in
`meta.images.image` ab: `src`, `srcset`, `sizes`, `width`, `height`, die
`sources` je Format und einen `og`-Zuschnitt. `meta.image` selbst bleibt der
String, den du geschrieben hast, sodass Views und Plugins, die ihn lesen,
weiter funktionieren. Query-Parameter gehen auch hier
(`image: /images/photos/beach.jpg?ratio=16:9`). Weitere Schlüssel als
`image` kommen nach `frontmatter_keys` in `config/images.yaml`.

Das Mixin, das `nera add` veröffentlicht hat, rendert den Eintrag:

```pug:theme/views/pages/post.pug
extends ../layouts/layout

block content
  main#main
    include /vendor/plugin-images/picture
    +picture(meta.images && meta.images.image, { alt: meta.image_alt, loading: 'eager' })
    != content
```

```html
<picture>
  <source type="image/avif" srcset="/_img/beach-04a0334d-480.avif 480w, /_img/beach-04a0334d-800.avif 800w, /_img/beach-04a0334d-1200.avif 1200w, /_img/beach-04a0334d-1600.avif 1600w" sizes="100vw" />
  <source type="image/webp" srcset="/_img/beach-2fc7c78b-480.webp 480w, /_img/beach-2fc7c78b-800.webp 800w, /_img/beach-2fc7c78b-1200.webp 1200w, /_img/beach-2fc7c78b-1600.webp 1600w" sizes="100vw" /><img src="/_img/beach-376379b1-1600.jpg" srcset="/_img/beach-376379b1-480.jpg 480w, /_img/beach-376379b1-800.jpg 800w, /_img/beach-376379b1-1200.jpg 1200w, /_img/beach-376379b1-1600.jpg 1600w" sizes="100vw" width="1600" height="1200" alt="Waves on an empty beach" loading="eager" fetchpriority="high" />
</picture>
```

Eine Seite ohne den Frontmatter-Schlüssel rendert dort nichts. Die Optionen
des Mixins sind `alt`, `class`, `sizes` und `loading` (Voreinstellung
`lazy`; `eager` fügt `fetchpriority="high"` hinzu). Ein Titelbild über dem
Inhalt ist das größte Bild der Seite, rendere es also wie oben mit
`loading: 'eager'` und setze `eager_first: false` in `config/images.yaml`,
damit das erste Markdown-Bild darunter nicht um dieselbe Priorität
konkurriert.

### `og:image`

Der `og`-Eintrag ist ein JPEG mit 1200 × 630 Pixeln, die Größe, die
Linkvorschauen in sozialen Netzwerken und Chat-Apps erwarten. `og:image`
muss eine absolute URL sein, setz also deinen Origin in `config/app.yaml`:

```yaml:config/app.yaml
origin: https://example.com
```

und füg die Tags im `head` des Layouts hinzu, nach den anderen `meta`-Tags:

```pug:theme/views/layouts/layout.pug
    if meta.images && meta.images.image && meta.images.image.og
      - const og = meta.images.image.og
      meta(property="og:image" content=`${app.origin}${app.basePath || ''}${og.src}`)
      meta(property="og:image:width" content=og.width)
      meta(property="og:image:height" content=og.height)
```

`public/beach.html` enthält dann:

```html
<meta property="og:image" content="https://example.com/_img/beach-a82641dd-1200.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

`app.basePath` ist für eine Website da, die aus einem Unterordner ausgeliefert
wird: Core schreibt `href` und `src` für `base_path` um, aber nicht den
`content` eines `<meta>`.

## 6. Platzhalter

Solange ein Bild lädt, ist sein Kasten leer. Ein Platzhalter füllt ihn:

```yaml:config/images.yaml
placeholder: color
```

setzt die vorherrschende Farbe des Bildes als Hintergrund:

```html
<img src="/_img/pier-10e7e41a-1600.jpg" srcset="/_img/pier-10e7e41a-480.jpg 480w, /_img/pier-10e7e41a-800.jpg 800w, /_img/pier-10e7e41a-1200.jpg 1200w, /_img/pier-10e7e41a-1600.jpg 1600w" sizes="100vw" width="1600" height="1200" style="background-color:#383898" alt="The pier at dusk, seen from the beach" loading="eager" fetchpriority="high">
```

`placeholder: blur` setzt stattdessen ein winziges, unscharfes WebP, direkt
in der Seite:

```html
<img src="/_img/pier-10e7e41a-1600.jpg" srcset="/_img/pier-10e7e41a-480.jpg 480w, /_img/pier-10e7e41a-800.jpg 800w, /_img/pier-10e7e41a-1200.jpg 1200w, /_img/pier-10e7e41a-1600.jpg 1600w" sizes="100vw" width="1600" height="1200" style="background-image:url(data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAACwAQCdASoQAAwAAsBMJbACdAEOtNWAAP7xfmtUemnWsBu+y/mBlsjTsVhsr/7FRn95mxzwAAA=);background-size:cover" alt="The pier at dusk, seen from the beach" loading="eager" fetchpriority="high">
```

Der Build meldet sie:

```text
🖼️  plugin-images: 4 image(s), 0 variant(s) encoded, 3 placeholder(s) computed
```

Beides funktioniert für Markdown-Bilder und für Frontmatter-Bilder (das
Mixin rendert den `style`). Ein Bild mit Transparenz bekommt keinen, weil
der Hintergrund durch es hindurch sichtbar bliebe. Die Voreinstellung ist
`none`, weil ein Platzhalter ein Inline-`style`-Attribut ist, das eine
Content Security Policy ohne `'unsafe-inline'` in `style-src` blockiert.

Ein Wert, den das Plugin nicht kennt, oder ein Schlüssel, den es nicht
kennt, warnt und fällt auf die Voreinstellung zurück; keins von beiden lässt
den Build scheitern:

```text
⚠️ plugin-images: config/images.yaml: invalid placeholder "smudge", using "none"
⚠️ plugin-images: config/images.yaml: ignoring unknown key "width"
```

## 7. Halte deine Originale vom Server fern

Die Varianten sind sauber, aber standardmäßig wird das Original trotzdem
veröffentlicht: In Schritt 2 ist `public/images/photos/pier.jpg` die 4 MB
große Datei mit ihren Kamera- und GPS-Daten, erreichbar für alle, die die
URL erraten. Das Plugin liest Bilder aus dem Assets-Ordner **unabhängig von
`.neraignore`**, trag den Foto-Ordner dort also ein:

```text:.neraignore
images/photos
```

Die Pfade sind relativ zum Assets-Ordner. Nach dem nächsten Build hat
`public/` gar keinen Ordner `images/` mehr; die Seiten zeigen trotzdem jedes
Foto, aus `public/_img/`. Die Originale bleiben in deinem Repository.

Prüf vorher, was sonst noch in diesem Ordner liegt. `.neraignore` vergleicht
exakte Pfade und Ordner-Präfixe, keine Glob-Muster, und alles in einem
eingetragenen Ordner, das das Plugin nicht bearbeitet, wird nicht mehr
veröffentlicht: SVGs, GIFs, Dateien, die du zum Herunterladen verlinkst, und
Bilder, die deine Views direkt verwenden, etwa ein `img(src=meta.image)` oder
ein `og:image`, das aus `meta.image` gebaut wird. Rendere diese aus
`meta.images` (Schritt 5). Ein Ordner, der nur Fotos für deine Seiten
enthält, ist der sichere Fall.

`nera build --check` prüft das gebaute `public/`, unter anderem auf Anfragen
an Dritte; die [CLI-Referenz](/de/docs/cli.html#die-gebaute-website-prufen)
beschreibt die Prüfungen. Für diese Website meldet es:

```text
✓ No problems found.
```

## 8. Der Cache, lokal und in CI

AVIF zu kodieren ist langsam. Das Plugin hält deshalb jede Variante in
`.nera-cache/images/` und kodiert nur, was fehlt. Mit den vier Bildern der
Testwebsite (drei auf der Pier-Seite, das Titelbild des Strand-Posts) meldet
ein Build mit leerem Cache:

```text
🖼️  plugin-images: 4 image(s), 34 variant(s) encoded
```

und dauerte 5,3 Sekunden; der nächste Build:

```text
🖼️  plugin-images: 4 image(s), 0 variant(s) encoded
```

dauerte 0,9. Auf einer Website mit hundert Fotos dauert ein kalter Build eine
Minute oder länger. Varianten, die keine Seite mehr verwendet, werden aus dem
Cache entfernt (`prune: true`).

`nera new` trägt `.nera-cache` in die `.gitignore` der Website ein (seit
`@nera-static/nera` 1.4.1), sodass der Cache nie in deinem Repository landet.
In CI behältst du ihn stattdessen zwischen den Läufen. Der Deploy-Workflow,
den `nera publish` schreibt, tut das schon (seit `@nera-static/nera` 1.22.0).
In einem eigenen Workflow fügst du diesen Schritt vor `npm run build` ein:

```yaml
- uses: actions/cache@v6
  with:
      path: .nera-cache
      key: nera-cache-${{ hashFiles('assets/**', 'theme/assets/**', 'pages/**', 'config/images.yaml', 'package-lock.json') }}
      restore-keys: nera-cache-
```

Der Schlüssel umfasst `pages/**`, weil Seiten Varianten anfordern
(Query-Parameter, Frontmatter-Bilder), und `package-lock.json`, weil ein
Theme von npm eigene Bilder mitbringt. `actions/cache` speichert nichts, wenn
der Schlüssel exakt passt, ein Schlüssel, dem eins davon fehlt, lässt neue
Varianten also ungespeichert, und jeder Build kodiert sie erneut.

## 9. Voraussetzungen

Das Plugin braucht **`@nera-static/core` 4.13.0 oder neuer**: Es übergibt
seine Varianten über den Hook `getAssets` an Core, der sie nach `public/`
kopiert. Jedes aktuelle `@nera-static/nera` bringt einen neueren Core mit.
Mit einem älteren Core bricht der Build ab, statt Seiten zu veröffentlichen,
die auf Bilder verlinken, die nie kopiert wurden. Mit Core 4.12.0:

```text
❌ plugin-images: @nera-static/core 4.12.0 is too old; this plugin needs >= 4.13.0 (the getAssets hook). Without it, pages would link to image files that are never copied to public/. Update with `npm update @nera-static/nera` (or `@nera-static/core`).
```

Der Build endet mit Exit-Code 1.

Das Kodieren läuft über [sharp](https://sharp.pixelplumbing.com), ein natives
Modul. Es installiert ein vorkompiliertes Binary für deine Plattform (macOS,
Linux und Windows, auf x64 und arm64), und die `package-lock.json` der
Website führt die Binaries aller Plattformen als optionale Abhängigkeiten,
sodass `npm ci` auf einem Linux-CI-Runner sein eigenes wählt, auch wenn das
Lockfile auf einem Mac geschrieben wurde. Installiere nicht mit
`--omit=optional`, das lässt das Binary weg. Das Plugin braucht Node.js
20.18.1 oder neuer.

[README](https://github.com/seebaermichi/nera-plugin-images#readme) und
[npm-Seite](https://www.npmjs.com/package/@nera-static/plugin-images) des
Plugins haben jeden Konfigurationsschlüssel mit seiner Voreinstellung.

## Weiter

[Wie diese Website gebaut ist](/de/tutorials/how-this-site-is-built.html)
zeigt die Plugins dieser Website im Zusammenspiel.
