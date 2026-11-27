---
layout: pages/docs.pug
title: Temas y starters
slug: style-guide-themes-and-starters
lang: es
description: La anatomía de un tema y de un starter de Nera — un único theme.css, design tokens, seams, el objeto helper neraTheme, los prefijos de las custom properties, las webfonts, el sitio de fixture y lo que copia un starter.
pagination_order: 3
---

# Temas y starters

Un tema es el aspecto de un sitio, publicado como paquete npm cuyos archivos
un sitio sobrescribe uno a uno. Un starter es un sitio de ejemplo completo
que `nera new --starter <name>` copia una sola vez. Ambos siguen una misma
estructura: quien conoce un tema oficial se orienta en todos los demás, y un
tema nuevo empieza con esta página en lugar de con la copia de un hermano.

Cómo instala y sobrescribe un sitio un tema está en los
[conceptos básicos](/es/docs/core-concepts.html); cómo usa un sitio un
starter, en la [referencia de la CLI](/es/docs/cli.html).

## Archivos de un tema

```text
nera-theme-<name>/
├── views/
│   ├── layouts/layout.pug    # el armazón: bloques head, header, main, footer, scripts
│   ├── pages/                # una vista por tipo de página: default.pug, home.pug, post.pug, …
│   └── partials/
│       ├── helpers.pug       # las funciones del contrato y el objeto neraTheme
│       ├── tokens.pug        # los tokens de config/theme.yaml como custom properties --theme-*
│       ├── head.pug  header.pug  footer.pug  scripts.pug  lang-switch.pug  …
│       └── <seam>.pug        # vacío o un valor por defecto sin plugin; un sitio lo sobrescribe
├── assets/
│   ├── css/theme.css         # la única hoja de estilos
│   └── fonts/<name>/         # solo con webfonts: archivos woff2 y sus textos de licencia
├── config/theme.yaml         # cada clave que lee el tema, con su valor por defecto
├── test/
│   ├── site/                 # el sitio de fixture que construyen los tests, en dos idiomas
│   ├── helpers/  global-setup.js
│   └── <section>.test.js     # un archivo por sección del contrato del tema
├── README.md  CHANGELOG.md  LICENSE  package.json  package-lock.json
├── eslint.config.js  vitest.config.js  .editorconfig  .gitignore
├── .husky/                   # pre-commit: npm run lint, pre-push: npm run lint && npx vitest run
└── .github/                  # workflows/test.yml, workflows/publish.yml, dependabot.yml, FUNDING.yml
```

- **Una sola hoja de estilos, `assets/css/theme.css`.** Sin cadena de
  `@import` y sin paso de build: el archivo que enlaza un sitio es el archivo
  del repositorio.
- **Un script que necesita un plugin viene de ese plugin**, nunca de una
  copia en el tema (consulta «Archivos de un starter» más abajo).
- `package.json` lista `views`, `assets`, `config` y `CHANGELOG.md` en
  `files`, lleva `nera.generator` con el mínimo de core
  (`{ "generator": ">=4.15.0" }`), lista los plugins a los que da estilo como
  `peerDependencies` opcionales y tiene las keywords `nera` y `nera-theme`.

## Design tokens

Un sitio cambia los colores, las fuentes y los tamaños de un tema en su
propio `config/theme.yaml`, sin tocar el CSS:

```yaml
# config/theme.yaml
tokens:
    color:
        bg: '#f4f5f7'
        accent: '#d02408'
        accent_text: '#ffffff'
    font:
        body: "'Inter', system-ui, sans-serif"
    size:
        measure: '46rem'
```

`partials/tokens.pug` convierte cada token en una custom property llamada
`--theme-<grupo>-<nombre>`, con `_` escrito como `-`:
`tokens.color.accent_text` pasa a ser `--theme-color-accent-text`. Las
escribe en un único `<style>` en línea y descarta cada valor que podría
salirse de la regla (`<`, `>`, `{`, `}`, `;`). El `config/theme.yaml` del
propio tema contiene cada clave con su valor por defecto, y `theme.css`
repite ese valor como fallback de cada `var()`.

## Custom properties

Cada custom property de un tema o de un plugin lleva un prefijo que dice a
quién pertenece:

| prefijo | pertenece a | ejemplo |
|---|---|---|
| `--theme-*` | los tokens públicos de `config/theme.yaml`; un sitio puede fijarlos | `--theme-color-accent` |
| `--<theme>-*` | los alias internos de un tema, con el nombre del tema | `--stack-bg` |
| `--nera-<plugin>-*` | los estilos por defecto de un plugin | `--nera-code-bg` |

**Ninguna custom property sin prefijo** en un tema o en un plugin. Un nombre
corto como `--bg`, `--text` o `--accent` choca con el CSS propio de un
sitio. Un tema que quiere nombres internos cortos crea los alias de los
tokens una vez, bajo su propio prefijo, y a partir de ahí usa solo los
alias:

```css
:root {
    --stack-bg: var(--theme-color-bg, #f4f5f7);
    --stack-accent: var(--theme-color-accent, #d02408);
}

body {
    background: var(--stack-bg);
}
```

Renombrar una custom property que un sitio puede haber fijado es un cambio
incompatible y necesita una versión mayor.

## Seams

Un seam es un partial que el tema publica vacío, o con un valor por defecto
que no necesita ningún plugin. Un sitio lo rellena poniendo un archivo con la
misma ruta en su propio `theme/views/`. Seams habituales son `head-extra`,
`scripts-extra`, `footer-extra` y `nav-main`; los temas de blog añaden seams
como `post-media`, `post-tags`, `post-pagination` y `tag-cloud`.

- **Un tema no lee datos de plugins.** No mira en `app.tags`, `meta.images`
  ni en ninguna otra clave que escriba un plugin, y no analiza el `content`
  de una página. La salida de un plugin llega a una página solo a través de
  un seam que rellena el sitio, así que una forma nueva de los datos de un
  plugin nunca puede romper un tema.
- Un override de seam empieza con un comentario de una línea que dice qué
  rellena: `//- Seam override: plugin-navigation's list form …`.
- El README del tema lista cada seam con dónde se muestra, qué hay en el
  scope y el override típico, listo para copiar.

## El objeto helper: `neraTheme`

`partials/helpers.pug` contiene dos cosas:

- **Las funciones del contrato**, que cada vista del tema y el layout propio
  de un sitio pueden llamar: en los temas de blog y de negocio
  `pageLang(page)`, `sameLang(page)`, `homeHref(lang)`,
  `formatDate(value, lang)`, `isoDate(value)` y `hrefFor(value, lang)`.
  Están documentadas en el README y forman parte del contrato.
- **Un objeto para los helpers internos del tema, llamado `neraTheme`** en
  cada tema, nunca con el nombre del tema. Los partials compartidos
  (`tokens.pug`, `lang-switch.pug`, `head.pug`) se leen entonces igual en
  cada tema, y una comprobación puede mantenerlos idénticos.

```pug
//- partials/tokens.pug
if neraTheme.tokenRule()
    style!= neraTheme.tokenRule()
```

`neraTheme` sigue siendo interno: un sitio llama a las funciones del
contrato, no al objeto. Un tema que renombra su objeto helper a `neraTheme`
lo indica igualmente en su CHANGELOG, porque se rompe un sitio que copió un
partial que usa el nombre antiguo.

## Webfonts

- Un tema con webfonts **las sirve él mismo**: archivos woff2 en
  `assets/fonts/<theme>/`, junto al texto de licencia de cada familia
  (`OFL-<family>.txt`). Ninguna petición a un CDN de fuentes, así que un
  sitio con el tema no hace ninguna petición a terceros.
- Las reglas `@font-face` van al principio de `theme.css`, bajo un
  comentario que nombra la licencia y el paquete de origen con su versión,
  por ejemplo `From @fontsource-variable/inter 5.3.0`.
- Cada `font-family` termina en una pila de fuentes del sistema, para que el
  texto aparezca antes de que cargue la fuente (`font-display: swap`).
- Un tema sin webfonts usa solo pilas de fuentes del sistema.

## Tests de un tema

Un tema se prueba construyendo un sitio con él, no con tests unitarios de
sus plantillas:

- `test/site/` es un sitio de fixture completo en dos idiomas que usa el
  tema del repositorio (`theme: ../..`) y cada plugin al que el tema da
  estilo.
- `test/global-setup.js` construye cada variante del fixture una vez, con la
  CLI `nera` instalada, y los archivos de test leen la salida.
- Un archivo de test por sección del contrato del tema: `build`,
  `contract`, `contrast`, `override`, `pages`, `package`, `plugin-classes`,
  `tokens`, `validate`, etc.
- El fixture pasa `nera validate` y `nera build --check` con cada regla en
  `error`; una regla que el tema incumple a propósito (enlaces externos en
  una pestaña nueva) está desactivada en el `config/validate.yaml` del
  fixture, con un comentario que dice por qué, y se nombra en el README.
- Las suites compartidas de los temas pasan a `@nera-static/test-utils`
  (próximamente), de modo que un tema pasa sus opciones en lugar de copiar
  las suites.

## Archivos de un starter

```text
nera-starter-<name>/
├── pages/                    # las páginas de ejemplo, listas para editar
├── config/                   # app.yaml, theme.yaml y la configuración de cada plugin
├── theme/                    # los archivos propios del sitio de ejemplo: overrides de seams, vistas vendor, imágenes
├── assets/  plugins/  .neraignore   # solo cuando el sitio de ejemplo los necesita
├── test/
│   ├── package.test.js       # el paquete: nombre, files, nera.starter, dependencias
│   └── scaffold.test.js      # nera new --starter sobre este repositorio, luego un build limpio
├── README.md  CHANGELOG.md  LICENSE  package.json  package-lock.json
├── eslint.config.js  .editorconfig  .gitignore  .husky/  .github/
```

- **`nera new` copia solo `pages/`, `config/`, `theme/`, `assets/`,
  `plugins/` y `.neraignore`.** Todo lo demás del repositorio, los tests
  incluidos, se queda atrás. La CLI fusiona las `dependencies` del starter
  en el `package.json` del sitio nuevo.
- `package.json` lleva `nera.starter` con un `label` y una `description`,
  que `nera new` muestra cuando ofrece los starters:

  ```json
  "nera": {
      "starter": {
          "label": "Blog for developers",
          "description": "A ready-to-edit Nera blog for developers on @nera-static/theme-stack: …"
      }
  }
  ```

- Los plugins y el tema son `dependencies`. `@nera-static/nera` es solo una
  devDependency: la CLI nunca la fusiona, así que el sitio nuevo conserva la
  versión con la que se creó.
- `files` lista las carpetas copiadas y `CHANGELOG.md`, y deja fuera lo que
  escribe un build, como `!theme/assets/search-index*.json`.
- **Un starter no copia ningún script de plugin.** Un script como el de la
  búsqueda o el del formulario de contacto viene de su plugin mediante
  `getAssets`, servido en `public/_nera/<plugin>.js`, y el layout lo enlaza
  ahí. Una copia en `theme/assets/js/` habría que renovarla a mano en cada
  versión del plugin, y nada notaría cuándo se desvía.
- Las vistas vendor en `theme/views/vendor/plugin-<name>/` son las
  plantillas publicadas de la versión instalada del plugin, sin cambios. Un
  cambio deliberado va en un override de seam, no en la copia vendor.
- Un sitio recién creado con el starter pasa `nera validate` y
  `nera build --check` sin ningún hallazgo. `scaffold.test.js` lo demuestra.

## README de un starter

Las secciones van en este orden:

```markdown
# @nera-static/starter-example
[![Test](…)](…)
[![npm version](…)](…)

A ready-to-edit … for the Nera static site generator, on @nera-static/theme-…

## Usage                     npx @nera-static/nera new my-site --starter example
## What you get              the pages, the plugins, what the sample shows
## <extra sections>          optional, e.g. picture credits or texts for --lang de
## Requirements              the CLI, core and Node floors
## License
## First steps               always last
```

**`## First steps` es siempre la última sección.** `nera new` la muestra
después de crear el sitio, desde su encabezado hasta el siguiente
encabezado `#` o `##`, con sus subsecciones `###`; como última sección es
también donde termina el README, con el mismo texto que el nuevo
propietario acaba de ver. Es una lista
numerada corta de lo que el nuevo propietario debe cambiar primero: el
`origin` del sitio, los textos legales, el autor.

## Versiones

Los temas y los starters siguen las reglas de versiones de la
[página de plugins](/es/docs/style-guide/plugins.html#changelog), con estos
añadidos:

- **Mayor** en un tema: un seam, una función del contrato, un token o una
  clase pública renombrados o eliminados; un cambio de significado de una
  clave de `config/theme.yaml`; un mínimo de core más alto.
- Un starter no tiene vía de actualización: un sitio creado a partir de él
  es dueño de sus archivos, así que una versión del starter solo cambia lo
  que reciben los sitios nuevos.
