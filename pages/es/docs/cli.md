---
layout: pages/docs.pug
title: Referencia de la CLI
slug: cli
lang: es
description: La CLI de nera — crea, compila, previsualiza, actualiza, valida y revisa un sitio.
pagination_order: 7
---

# Referencia de la CLI

## La CLI `nera` (`@nera-static/nera`)

Un solo comando crea, compila, previsualiza, actualiza y valida un sitio. Crea
uno nuevo con:

```bash
npx @nera-static/nera new <project-name>
```

`nera new .` crea el sitio en la carpeta actual, que debe estar vacía, y
`--theme <name>` lo arranca a partir de un tema. `--starter <name>` lo arranca,
en cambio, a partir de un starter kit listo para editar (`blank`, `blog`,
`business` o `portfolio`; no junto con `--theme`), y `--name "<site name>"` y
`--lang <code>` fijan `name` y `lang` en `config/app.yaml`:

```bash
npx @nera-static/nera new my-blog --starter blog --name "Mi blog" --lang es
```

En una terminal, sin `--starter` ni `--yes`, `nera new` pregunta qué estás
construyendo, el nombre del sitio y el idioma; con `--yes`, o sin terminal,
nunca pregunta. Los detalles están más abajo, en
[Starter kits](#starter-kits).

Un sitio creado depende de `@nera-static/nera`, así que ejecuta estos desde
dentro de él con `npx`, p. ej. `npx nera validate`. El andamiaje también enlaza
`build`, `dev` y `serve` a scripts npm, p. ej. `npm run dev`:

| Comando | Qué hace |
| --- | --- |
| `nera build` | Compila `pages/` → `public/`; con `--check`, revisa también el resultado |
| `nera dev` | Compila + vista previa con recarga en vivo en `:3000` |
| `nera serve` | Sirve `public/` sin recompilar |
| `nera update` | Actualiza los paquetes Nera del sitio (`npm update`), eleva sus rangos `^` en `package.json` a las versiones instaladas y luego crea o renueva `AGENTS.md` y `CLAUDE.md` |
| `nera validate` | Comprueba layouts, includes y YAML antes de publicar |
| `nera check` | Revisa el `public/` compilado en busca de problemas de accesibilidad, privacidad y aviso legal |

### Starter kits

Un starter kit es un sitio completo listo para editar: páginas de ejemplo,
configuración, overrides de `theme/` opcionales a nivel de sitio, assets y el
tema y los plugins de los que depende. `nera new --starter` copia sus
`pages/`, `config/`, `theme/`, `assets/`, `plugins/` y `.neraignore` sobre la
plantilla base, añade sus `dependencies` al `package.json` del sitio, aplica
`--name` y `--lang`, instala e imprime la sección `## First steps` del README
del starter (nada, si no la tiene). Después, los archivos son del sitio: un
starter no tiene vía de actualización, aunque el tema del que depende sigue
actualizándose con npm.

`--name "<site name>"` y `--lang <code>` fijan `name:` y `lang:` en
`config/app.yaml`, con o sin starter. Un idioma nuevo recibe una copia de la
entrada `translations:` del idioma actual, lista para traducir, de modo que
ninguna página muestra una clave de traducción sin traducir.

`--starter` acepta:

- un nombre de starter: `blank`, `blog`, `business` o `portfolio`, abreviatura
  de `@nera-static/starter-blank`, etc.;
- un nombre de paquete: `@acme/starter-shop`, o sin scope `nera-starter-shop`;
- una URL de GitHub: `https://github.com/owner/repo` (opcionalmente con `.git`,
  `#ref`), o `github:owner/repo#ref`;
- una ruta local: `./my-starter`, `../my-starter` o una ruta absoluta.

Los paquetes y repositorios de GitHub se descargan con
`npm pack --ignore-scripts`, así que no se ejecuta ningún script del starter.
Un starter es un paquete cuyo `package.json` tiene un campo `nera.starter`
(`{ "label": "…", "description": "…" }`); cualquier otra cosa se rechaza antes
de escribir nada. Un starter que fija `theme:` en su `config/app.yaml` omite
las plantillas de inicio del andamiaje, igual que `--theme`.

Ejecuta `nera new my-site` en una terminal y, en cambio, pregunta:

```text
What are you building?
  1) Empty — the base template, no starter
  2) …
Choose 1–2 [1]:
Site name [My Nera Site]:
Language [en]:
```

La lista viene del registro de npm (paquetes con la palabra clave
`nera-starter`, primero los oficiales de `@nera-static/`), o de una lista corta
incluida en la CLI cuando no se puede acceder al registro. Enter acepta el
valor por defecto. Cada pregunta tiene un flag (`--starter`, `--name`,
`--lang`); con `--yes`, o sin terminal (scripts, CI, agentes de IA), no se
pregunta nada y `nera new` crea la plantilla base.

Los starters oficiales:

| Starter | Qué obtienes |
| --- | --- |
| `blank` | Un layout accesible, sin tema |
| `blog` | Un blog sobre `@nera-static/theme-blog` con etiquetas, un archivo, un feed Atom y un sitemap |
| `business` | Un sitio para una pequeña empresa sobre `@nera-static/theme-business` con servicios, horario de apertura y un formulario de contacto |
| `portfolio` | El portfolio de un diseñador sobre `@nera-static/theme-business` con proyectos en galerías de imágenes, una página «sobre mí» y un formulario de contacto |

### Revisar el sitio compilado

`nera validate` lee tus fuentes. `nera check` lee lo que produjo la
compilación — la página que recibe el visitante, con su layout, navegación,
pie, scripts, hojas de estilo y fuentes — y busca los problemas que un parser
puede encontrar ahí:

```bash
nera build --check   # compila y luego revisa — el único comando para CI
nera check           # revisa un public/ existente sin recompilar
```

Ejecuta primero `nera build`; sin `public/`, `nera check` se detiene con «run
`nera build` first». Un problema en una plantilla se informa una sola vez, con
el número de páginas en que aparece.

Cada hallazgo es un **aviso** por defecto, así que el comando termina con `0`.
Termina con `1` solo cuando salta una regla que elevaste a `error` — así lo
conviertes en una barrera de CI.

**Son indicaciones, no asesoramiento jurídico.** Una ejecución limpia no
demuestra el cumplimiento: las pruebas automáticas encuentran solo una parte de
los problemas de accesibilidad (alrededor de un tercio de los fallos WCAG). No
se comprueban el contraste de color, el foco visible ni si una ley se aplica a
tu sitio. Cada informe termina con ese recordatorio.

| regla | por defecto | base |
| --- | --- | --- |
| `a11y-html-lang` | aviso | WCAG 3.1.1 |
| `a11y-title` | aviso | WCAG 2.4.2 |
| `a11y-h1` | aviso | WCAG 1.3.1 |
| `a11y-heading-skip` | aviso | WCAG 1.3.1 |
| `a11y-img-alt` | aviso | WCAG 1.1.1 |
| `a11y-form-label` | aviso | WCAG 1.3.1, 4.1.2 |
| `a11y-link-name` | aviso | WCAG 2.4.4, 4.1.2 |
| `a11y-main` | aviso | WCAG 1.3.1 |
| `a11y-skip-link` | aviso | WCAG 2.4.1 |
| `a11y-nav-name` | aviso | WCAG 1.3.1 |
| `a11y-duplicate-id` | aviso | WCAG 4.1.2 |
| `a11y-viewport-zoom` | aviso | WCAG 1.4.4 |
| `a11y-link-lang` | desactivada (opt-in) | WCAG 3.1.2 |
| `a11y-target-blank` | desactivada (opt-in) | WCAG 3.2.5 (AAA) |
| `a11y-reduced-motion` | desactivada (opt-in) | WCAG 2.3.3 (AAA) |
| `privacy-third-party` | aviso | Art. 6 DSGVO |
| `privacy-consent-leak` | aviso | § 25 TDDDG |
| `privacy-insecure` | aviso | Art. 32 DSGVO |
| `privacy-storage` | desactivada (opt-in) | § 25 TDDDG |
| `legal-imprint-link` | aviso | § 5 DDG |
| `legal-privacy-link` | aviso | Art. 13 DSGVO |
| `legal-outdated-law` | aviso | DDG, TDDDG, MStV |

Configura las comprobaciones en `config/validate.yaml` (opcional — sin él se
aplican los valores por defecto de arriba):

```yaml
rules:
  a11y-img-alt: error         # elevar: la revisión falla
  a11y-target-blank: warning  # activar una regla opt-in
  a11y-skip-link: off         # desactivar
legal:
  imprint:                    # por idioma, la página a la que enlaza cada página
    de: /de/impressum.html
    es: /es/aviso-legal.html
  privacy:
    de: /de/datenschutz.html
    es: /es/privacidad.html
privacy:
  allowed_hosts:              # hosts de terceros que ya has tenido en cuenta
    - cdn.example.org
```

Para silenciar una regla en una sola página, añádela al frontmatter de la
página: `validate_ignore: [a11y-h1]`.

Para silenciar una regla en archivos o carpetas enteros, enuméralos bajo
`ignore`. También funciona con `nera validate` — por ejemplo para
`layout-missing` en fragmentos de contenido que otra página incluye, o en
borradores, que no tienen `layout` a propósito:

```yaml
ignore:
  layout-missing:
    - pages/*/references      # una carpeta abarca todo lo que contiene
    - pages/de/blog/drafts    # * representa un nombre de carpeta
```

Las rutas son relativas a la raíz del sitio. Requiere `@nera-static/validate`
1.3.0, que `npm update` trae a un sitio existente.

**Tu propio host.** Para distinguir tus recursos de los de terceros,
`privacy-third-party` lee `origin` de `config/app.yaml`, o si no `app_origin`
de `config/canonical-links.yaml` (con y sin `www.`). Si no hay ninguno, solo
las URL relativas cuentan como tuyas.

**Recursos tras el consentimiento.** Un script o una inserción con el marcado
de `@nera-static/plugin-consent` (`type="text/plain"` con `data-src`, o
`data-consent-src` en lugar de `src`) no carga nada al ver la página, así que
`privacy-third-party` no informa de él. Un elemento marcado con `data-consent`
que aun así carga es lo que informa `privacy-consent-leak`. El tutorial
[Añade un banner de consentimiento — o ninguno](/es/tutorials/consent-banner.html)
muestra ambos casos.

**Enlaces al aviso legal y a la privacidad solo en alemán e inglés.** Sin
configuración `legal`, los enlaces se reconocen por su texto — *Impressum*,
*Imprint*, *Legal notice*, *Datenschutz*, *Privacy*, *Data protection* — y solo
en páginas en alemán e inglés. Para un sitio en español, indica las páginas en
`legal.imprint.es` y `legal.privacy.es`.

Las descripciones completas de las reglas están en el
[README de `@nera-static/validate`](https://github.com/seebaermichi/nera-validate#checking-the-built-output).

### Instrucciones para asistentes de IA

Cada sitio creado con el andamiaje incluye un `AGENTS.md` —el archivo que
Codex, Cursor, Copilot y otros asistentes leen primero— y un `CLAUDE.md` con la
única línea `@AGENTS.md`, para que Claude Code cargue el mismo texto.
`AGENTS.md` termina con una sección **Notes for this site** para tus propias
instrucciones, debajo de la línea marcadora `<!-- nera:site-notes … -->`. No
borres esa línea: la parte de arriba es de Nera, la de abajo es tuya.

Desde `@nera-static/nera` 1.7.0, `nera update` mantiene ambos archivos al día,
sin ninguna opción extra. Después de actualizar los paquetes (y después de
`nera update --migrate`):

- crea `AGENTS.md` y `CLAUDE.md` si faltan, así que un sitio antiguo también
  los recibe;
- sustituye solo la parte de `AGENTS.md` por encima de la línea marcadora por el
  texto del `@nera-static/nera` instalado; la línea marcadora y tus notas debajo
  quedan exactamente como están;
- deja intacto un `AGENTS.md` sin línea marcadora y muestra una pista: copia la
  línea marcadora de la plantilla justo encima de tus propias notas para
  activarlo;
- nunca toca un `CLAUDE.md` existente.

Un archivo solo se escribe cuando su contenido cambia, así que volver a ejecutar
`nera update` no cambia nada.

### Migrar un sitio antiguo (clonado)

Los sitios creados antes de la CLI eran clones de git que incluían el motor bajo
`src/`. Dentro de un sitio así, ejecuta `nera update --migrate` — añade la
dependencia `@nera-static/nera`, reescribe los scripts, elimina el motor `src/`
incluido e instala, dejando intactos tus `pages/`, `config/` y `theme/`.

## Comandos de publicación de plugins

Cada plugin que incluye plantillas expone un bin para copiar su Pug a
`theme/views/vendor/`, p. ej.:

```bash
npx nera-navigation
npx nera-tags
npx nera-search --force   # overwrite existing published templates
```
