---
layout: pages/tutorial.pug
title: Responsive images with plugin-images
slug: responsive-images
lang: en
description: Turn the photos in your Markdown into AVIF and WebP with srcset, sizes, width and height at build time, with camera and GPS data stripped, and cache the work between builds.
keywords: nera images, plugin-images, responsive images, avif, webp, srcset, picture element, og:image, exif, gps, sharp
tags: plugins, images, privacy
pagination_order: 12
createdAt: 2026-11-22
verified_on: 2026-11-22
verified_with:
    plugin-images: 1.0.3
    core: 4.18.3
    nera: 1.27.2
---
A photo straight from a camera or a phone is several megabytes and thousands
of pixels wide, and it carries metadata: the camera model, the time, often
the GPS position where it was taken. Put it into a Markdown page as it is,
and every visitor downloads all of that, on a phone too.
`@nera-static/plugin-images` fixes this at build time. Every local image in
your Markdown becomes a `<picture>` with AVIF and WebP in several widths,
`srcset`/`sizes`, `width`/`height` and lazy loading, and the published files
carry no metadata. Your Markdown does not change.

Every command, config and output below was run in a fresh `nera new` site
with plugin-images 1.0.3, `@nera-static/core` 4.18.3 and
`@nera-static/nera` 1.27.2. The photo is a 4000 × 3000 JPEG of 4 MB with
camera and GPS data in its EXIF block.

## 1. Install

```bash
npx nera add images
```

`nera add` installs the package and publishes the plugin's one view, the
`picture` mixin, into `theme/views/vendor/plugin-images/`:

```text
✅ Copied picture.pug to …/theme/views/vendor/plugin-images/picture.pug
✅ Templates copied to: …/theme/views/vendor/plugin-images
✅ Added @nera-static/plugin-images
   Config:    none (the plugin ships no default)
   Templates: published by the plugin
```

There is nothing else to set up: a `config/images.yaml` is optional, and so
is every key in it. The blog, business and portfolio starters
(`nera new --starter …`) already ship the plugin.

## 2. Before and after

Put the photo into the site's assets, at
`theme/assets/images/photos/pier.jpg`, and use it in a page like any image:

```markdown:pages/pier.md
---
layout: pages/default.pug
title: The pier
description: A photo of the pier at dusk
---
# The pier

![The pier at dusk, seen from the beach](/images/photos/pier.jpg)
```

Without the plugin, `nera build` turns this into a plain `<img>` that points
at the 4 MB original:

```html
<p><img src="/images/photos/pier.jpg" alt="The pier at dusk, seen from the beach"></p>
```

With the plugin, the first build encodes the variants:

```text
🖼️  plugin-images: 1 image(s), 12 variant(s) encoded
```

and `public/pier.html` holds:

```html
<p>
  <picture>
    <source type="image/avif" srcset="/_img/pier-1a5869e3-480.avif 480w, /_img/pier-1a5869e3-800.avif 800w, /_img/pier-1a5869e3-1200.avif 1200w, /_img/pier-1a5869e3-1600.avif 1600w" sizes="100vw">
    <source type="image/webp" srcset="/_img/pier-987422b0-480.webp 480w, /_img/pier-987422b0-800.webp 800w, /_img/pier-987422b0-1200.webp 1200w, /_img/pier-987422b0-1600.webp 1600w" sizes="100vw"><img src="/_img/pier-10e7e41a-1600.jpg" srcset="/_img/pier-10e7e41a-480.jpg 480w, /_img/pier-10e7e41a-800.jpg 800w, /_img/pier-10e7e41a-1200.jpg 1200w, /_img/pier-10e7e41a-1600.jpg 1600w" sizes="100vw" width="1600" height="1200" alt="The pier at dusk, seen from the beach" loading="eager" fetchpriority="high">
  </picture>
</p>
```

- The browser picks the first format it supports, AVIF, then WebP, and the
  `<img>` is the fallback. It keeps the source's format (JPEG stays JPEG, PNG
  stays PNG) and always points at a processed variant, never the original.
- The widths are the default `480, 800, 1200, 1600`. A source is never
  upscaled: a photo 1000 pixels wide gets 480 and 800 only.
- `width` and `height` are the largest variant's size, so the browser
  reserves the space before the image loads and the page does not jump.
- The first image on a page loads eagerly with `fetchpriority="high"`, since
  it is usually the largest thing on the screen. Every later image gets
  `loading="lazy" decoding="async"`.
- `alt` and every other attribute of your image are kept. The plugin never
  writes an `alt` for you.

The variants land in `public/_img/`, with a hash of the source and the
settings in each name, so a URL changes only when the image does. The
variants carry no EXIF, GPS or ICC data: the plugin applies the EXIF
orientation and then strips all of it.

On the plugin's field-test site, a German/English blog, the 32 content images
went from 4.2 MB of originals to 0.45 MB of AVIF a phone downloads.

The plugin leaves alone what it should not touch: SVG and GIF, external
`http(s)://` URLs, an `<img>` that already has a `srcset` or sits inside a
`<picture>`, and any image with `?skip` on its URL. An image file that does
not exist stays a plain `<img>`, and the build says so:

```text
⚠️ plugin-images: /pier.html: image not found, left as is: /images/photos/missing.jpg
```

Images in your Pug **views** are not processed. For those, use frontmatter
images and the mixin (step 5).

## 3. Query parameters

Add parameters to the image URL to change one image. The parameters never
reach the published URLs. This one is at most 800 pixels wide, cropped to
16:9 around a point 30 % from the left and 60 % from the top:

```markdown:pages/pier.md
![The end of the pier](/images/photos/pier.jpg?w=800&ratio=16:9&focus=30,60)
```

```html
<picture>
  <source type="image/avif" srcset="/_img/pier-7a863ccf-480.avif 480w, /_img/pier-7a863ccf-800.avif 800w, /_img/pier-7a863ccf-1600.avif 1600w" sizes="(min-width: 800px) 800px, 100vw">
  <source type="image/webp" srcset="/_img/pier-f3e554c6-480.webp 480w, /_img/pier-f3e554c6-800.webp 800w, /_img/pier-f3e554c6-1600.webp 1600w" sizes="(min-width: 800px) 800px, 100vw"><img src="/_img/pier-85ac4388-1600.jpg" srcset="/_img/pier-85ac4388-480.jpg 480w, /_img/pier-85ac4388-800.jpg 800w, /_img/pier-85ac4388-1600.jpg 1600w" sizes="(min-width: 800px) 800px, 100vw" width="1600" height="900" alt="The end of the pier" loading="lazy" decoding="async">
</picture>
```

`?w=800` keeps the configured widths below 800, adds 800 and 1600 (for
screens with twice the pixel density) and sets a matching `sizes`. The crop
makes the image 1600 × 900. The parameters:

| Parameter | What it does | Example |
|---|---|---|
| `w` | Maximum display width in pixels | `?w=800` |
| `h` | Target height; with `w` it crops | `?w=800&h=450` |
| `ratio` | Crop to an aspect ratio | `?ratio=16:9` |
| `fit` | `cover` (the default for a crop), `contain` or `inside` | `?fit=contain` |
| `focus` | Focal point of a crop in percent, or `attention` / `entropy` | `?focus=30,60` |
| `q` | Quality for all formats, 1–100 | `?q=60` |
| `formats` | Modern formats for this image, or `none` | `?formats=webp` |
| `sizes` | `sizes` for this image, URL-encoded | `?sizes=50vw` |
| `loading` | `eager` or `lazy`, overriding the first-image rule | `?loading=eager` |
| `skip` | Leave this image untouched | `?skip` |

A parameter the plugin does not know is ignored with a warning, so a typo
does not go unnoticed:

```text
⚠️ plugin-images: /pier.html: unknown parameter "width" ignored: /images/photos/pier.jpg?width=800
```

## 4. Captions

Give an image a Markdown title, and put it alone in its paragraph:

```markdown:pages/pier.md
![The pier at dusk](/images/photos/pier.jpg "Usedom, October 2026")
```

It becomes a `<figure>` with the title as its caption. The `<figure>`
replaces the paragraph, since a `<figure>` inside a `<p>` is invalid HTML:

```html
<figure class="nera-image">
  <picture>
    <source type="image/avif" srcset="/_img/pier-1a5869e3-480.avif 480w, /_img/pier-1a5869e3-800.avif 800w, /_img/pier-1a5869e3-1200.avif 1200w, /_img/pier-1a5869e3-1600.avif 1600w" sizes="100vw">
    <source type="image/webp" srcset="/_img/pier-987422b0-480.webp 480w, /_img/pier-987422b0-800.webp 800w, /_img/pier-987422b0-1200.webp 1200w, /_img/pier-987422b0-1600.webp 1600w" sizes="100vw"><img src="/_img/pier-10e7e41a-1600.jpg" srcset="/_img/pier-10e7e41a-480.jpg 480w, /_img/pier-10e7e41a-800.jpg 800w, /_img/pier-10e7e41a-1200.jpg 1200w, /_img/pier-10e7e41a-1600.jpg 1600w" sizes="100vw" width="1600" height="1200" alt="The pier at dusk" loading="lazy" decoding="async">
  </picture>
  <figcaption class="nera-image__caption">Usedom, October 2026</figcaption>
</figure>
```

The same photo as in step 2 reuses the same variants: nothing is encoded
twice. An image inline with text, inside a link or next to another image
keeps its `title` and gets no figure. `figure: false` in
`config/images.yaml` turns captions off. The classes `nera-image` and
`nera-image__caption` are the plugin's public markup, so style them in your
own CSS.

## 5. Frontmatter images and the `+picture` mixin

A blog post's hero or teaser image usually sits in the frontmatter and is
rendered by a view, not by the Markdown. Name it under `image`:

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

The plugin encodes the variants for it and puts the finished data into
`meta.images.image`: `src`, `srcset`, `sizes`, `width`, `height`, the
`sources` per format, and an `og` crop. `meta.image` itself stays the string
you wrote, so views and plugins that read it keep working. Query parameters
work here too (`image: /images/photos/beach.jpg?ratio=16:9`). More keys
than `image` go into `frontmatter_keys` in `config/images.yaml`.

The mixin `nera add` published renders the entry:

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

A page without the frontmatter key renders nothing there. The mixin's options
are `alt`, `class`, `sizes` and `loading` (`lazy` by default; `eager` adds
`fetchpriority="high"`). A hero above the content is the page's largest
image, so render it with `loading: 'eager'` as above, and set
`eager_first: false` in `config/images.yaml`, so the first Markdown image
below it does not compete for the same priority.

### `og:image`

The `og` entry is a 1200 × 630 JPEG, the size link previews in social
networks and chat apps expect. `og:image` must be an absolute URL, so set
your origin in `config/app.yaml`:

```yaml:config/app.yaml
origin: https://example.com
```

and add the tags inside the layout's `head`, after the other `meta` tags:

```pug:theme/views/layouts/layout.pug
    if meta.images && meta.images.image && meta.images.image.og
      - const og = meta.images.image.og
      meta(property="og:image" content=`${app.origin}${app.basePath || ''}${og.src}`)
      meta(property="og:image:width" content=og.width)
      meta(property="og:image:height" content=og.height)
```

`public/beach.html` then has:

```html
<meta property="og:image" content="https://example.com/_img/beach-a82641dd-1200.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

`app.basePath` is there for a site served from a subfolder: core rewrites
`href` and `src` for `base_path`, but not the `content` of a `<meta>`.

## 6. Placeholders

While an image loads, its box is empty. A placeholder fills it:

```yaml:config/images.yaml
placeholder: color
```

sets the image's dominant colour as its background:

```html
<img src="/_img/pier-10e7e41a-1600.jpg" srcset="/_img/pier-10e7e41a-480.jpg 480w, /_img/pier-10e7e41a-800.jpg 800w, /_img/pier-10e7e41a-1200.jpg 1200w, /_img/pier-10e7e41a-1600.jpg 1600w" sizes="100vw" width="1600" height="1200" style="background-color:#383898" alt="The pier at dusk, seen from the beach" loading="eager" fetchpriority="high">
```

`placeholder: blur` sets a tiny blurred WebP instead, inline in the page:

```html
<img src="/_img/pier-10e7e41a-1600.jpg" srcset="/_img/pier-10e7e41a-480.jpg 480w, /_img/pier-10e7e41a-800.jpg 800w, /_img/pier-10e7e41a-1200.jpg 1200w, /_img/pier-10e7e41a-1600.jpg 1600w" sizes="100vw" width="1600" height="1200" style="background-image:url(data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAACwAQCdASoQAAwAAsBMJbACdAEOtNWAAP7xfmtUemnWsBu+y/mBlsjTsVhsr/7FRn95mxzwAAA=);background-size:cover" alt="The pier at dusk, seen from the beach" loading="eager" fetchpriority="high">
```

The build reports them:

```text
🖼️  plugin-images: 4 image(s), 0 variant(s) encoded, 3 placeholder(s) computed
```

Both work for Markdown images and for frontmatter images (the mixin renders
the `style`). An image with transparency gets none, because the background
would stay visible through it. The default is `none`, because a placeholder
is an inline `style` attribute, which a Content Security Policy without
`'unsafe-inline'` in `style-src` blocks.

A value the plugin does not know, or a key it does not know, warns and falls
back to the default; neither fails the build:

```text
⚠️ plugin-images: config/images.yaml: invalid placeholder "smudge", using "none"
⚠️ plugin-images: config/images.yaml: ignoring unknown key "width"
```

## 7. Keep your originals off the server

The variants are clean, but by default the original is still published: in
step 2, `public/images/photos/pier.jpg` is the 4 MB file with its camera and
GPS data, reachable by anyone who guesses the URL. The plugin reads images
from the assets folder **regardless of `.neraignore`**, so list the photo
folder there:

```text:.neraignore
images/photos
```

The paths are relative to the assets folder. After the next build,
`public/` has no `images/` folder at all; the pages still show every photo,
from `public/_img/`. The originals stay in your repository.

Check first what else lives in that folder. `.neraignore` matches exact
paths and folder prefixes, no glob patterns, and everything in a listed
folder the plugin does not process is no longer published: SVGs, GIFs,
files you link for download, and images your views use directly, such as an
`img(src=meta.image)` or an `og:image` built from `meta.image`. Render those
from `meta.images` (step 5). A folder that holds only photos for your pages is
the safe case.

`nera build --check` looks at the built `public/`, for third-party requests
among other things; the [CLI reference](/docs/cli.html#checking-the-built-site)
describes the checks. For this site it reports:

```text
✓ No problems found.
```

## 8. The cache, locally and in CI

Encoding AVIF is slow. The plugin therefore keeps every variant in
`.nera-cache/images/` and encodes only what is missing. With the test site's
four images (three on the pier page, the hero of the beach post), a build
with an empty cache reports:

```text
🖼️  plugin-images: 4 image(s), 34 variant(s) encoded
```

and took 5.3 seconds; the next build:

```text
🖼️  plugin-images: 4 image(s), 0 variant(s) encoded
```

took 0.9. On a site with a hundred photos, a cold build takes a minute or
more. Variants no page uses any more are removed from the cache
(`prune: true`).

`nera new` lists `.nera-cache` in the site's `.gitignore` (since
`@nera-static/nera` 1.4.1), so the cache never lands in your repository. In
CI, keep it between runs instead. The deploy workflow `nera publish` writes
already does that (since `@nera-static/nera` 1.22.0). In a workflow of your
own, add this step before `npm run build`:

```yaml
- uses: actions/cache@v6
  with:
      path: .nera-cache
      key: nera-cache-${{ hashFiles('assets/**', 'theme/assets/**', 'pages/**', 'config/images.yaml', 'package-lock.json') }}
      restore-keys: nera-cache-
```

The key covers `pages/**` because pages ask for variants (query parameters,
frontmatter images), and `package-lock.json` because a theme from npm brings
its own images. `actions/cache` saves nothing when the key matches exactly,
so a key that misses one of them leaves new variants unsaved, and every build
encodes them again.

## 9. Requirements

The plugin needs **`@nera-static/core` 4.13.0 or later**: it hands its
variants to core through the `getAssets` hook, which copies them into
`public/`. Every current `@nera-static/nera` brings a newer core. On an older
core the build stops, rather than publish pages that link to images which
were never copied. With core 4.12.0:

```text
❌ plugin-images: @nera-static/core 4.12.0 is too old; this plugin needs >= 4.13.0 (the getAssets hook). Without it, pages would link to image files that are never copied to public/. Update with `npm update @nera-static/nera` (or `@nera-static/core`).
```

The build exits with code 1.

The encoding runs on [sharp](https://sharp.pixelplumbing.com), a native
module. It installs a prebuilt binary for your platform (macOS, Linux and
Windows, on x64 and arm64), and the site's `package-lock.json` lists the
binaries of every platform as optional dependencies, so `npm ci` on a Linux
CI runner picks its own even when the lockfile was written on a Mac. Do not
install with `--omit=optional`, which leaves the binary out. The plugin needs
Node.js 20.18.1 or later.

The plugin's [README](https://github.com/seebaermichi/nera-plugin-images#readme)
and [npm page](https://www.npmjs.com/package/@nera-static/plugin-images) have
every config key with its default.

## Next

[How this website is built](/tutorials/how-this-site-is-built.html) shows the
plugins of this site working together.
