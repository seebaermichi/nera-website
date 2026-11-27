---
layout: pages/docs.pug
title: Plugins
slug: style-guide-plugins
lang: es
description: La anatomía de un plugin de Nera — archivos, forma de los hooks, configuración y avisos con @nera-static/plugin-utils, package.json, README y CHANGELOG.
pagination_order: 2
---

# Plugins

Todos los plugins de Nera tienen la misma anatomía. Abres `index.js` y ves
los hooks; abres `src/config.js` y ves las claves de configuración y sus
valores por defecto; abres el README y las secciones aparecen en el mismo
orden que en cualquier otro plugin. Esta página describe esa anatomía, para
los paquetes oficiales `@nera-static/plugin-*` y para los tuyos.

Cómo usa un sitio los plugins, y el contrato de los hooks en sí, está en la
[documentación de plugins](/es/docs/plugins.html).

## Archivos

```text
nera-plugin-<name>/
├── index.js                  # solo los hooks: comentario de cabecera, imports, hooks exportados
├── src/
│   ├── config.js             # el lector de configuración: valores por defecto, un lector por clave, loadConfig()
│   ├── log.js                # el logger del paquete: createLogger('plugin-<name>')
│   └── <feature>.js          # funciones puras, una responsabilidad por archivo
├── config/<name>.yaml        # cada clave con su valor por defecto; `nera add` la copia
├── views/                    # solo con plantillas: <template>.pug en plano, más partials/ y helper/
├── assets/                   # solo si getAssets entrega archivos estáticos (servidos en public/_nera/)
├── bin/publish-template.js   # solo con views/
├── test/                     # ver la página Tests de esta guía
├── README.md  CHANGELOG.md  LICENSE  package.json  package-lock.json
├── eslint.config.js  .editorconfig  .gitignore
├── .husky/                   # pre-commit: npm run lint, pre-push: npx vitest run
└── .github/                  # workflows/test.yml, workflows/publish.yml, dependabot.yml, FUNDING.yml
```

- Un plugin **no tiene `src/warn.js` ni `src/guard.js`**. El formato de los
  avisos y la comprobación de la versión de core vienen de
  `@nera-static/plugin-utils` (`/log` y `/guard`, a partir de la versión
  1.7.0), así no pueden divergir.
- `config/<name>.yaml` lista cada clave, activa o comentada, con su valor
  por defecto. Es el archivo que `nera add <name>` copia en un sitio, por eso
  un plugin no tiene `bin/publish-config.js`.
- `bin/publish-template.js` existe solo cuando el plugin tiene `views/`.
  Llama a `publishAllTemplates` de `@nera-static/plugin-utils`.

## Los hooks

`index.js` contiene los hooks y nada más. Todo lo que un hook hace aparte de
leer su entrada y devolver su resultado vive en `src/`.

```js
// @nera-static/plugin-example — adds a list of related pages to every page.
//
// getAppData checks the core version and adds app.example, getMetaData adds
// meta.related to every page, getAssets ships the default styles.
import { fileURLToPath } from 'node:url'
import { assertCoreVersion } from '@nera-static/plugin-utils/guard'
import { loadConfig } from './src/config.js'
import { log } from './src/log.js'
import { relatedPages } from './src/related.js'

export function getAppData({ app = {}, pagesData = [] } = {}) {
    assertCoreVersion({ plugin: 'plugin-example', from: import.meta.url })
    return { ...app, example: { count: pagesData.length } }
}

export function getMetaData({ app = {}, pagesData = [] } = {}) {
    const config = loadConfig({ app })
    return pagesData.map((page) => ({
        ...page,
        meta: { ...page.meta, related: relatedPages(page, pagesData, config, { onWarning: log.warn }) },
    }))
}

export function getAssets({ app = {}, pagesData = [] } = {}) {
    return [{ from: fileURLToPath(new URL('./assets/example.css', import.meta.url)), to: '_nera/example.css' }]
}
```

Las reglas:

- **Desestructura con valores por defecto**:
  `({ app = {}, pagesData = [] } = {})`. Nunca `(data)` con `data.app`.
- **Exporta cada hook con `export function`**, nunca mediante
  `export { … }`.
- **Síncrono**, salvo que el hook de verdad tenga que esperar. Core espera
  a cada hook, pero uno síncrono es más fácil de probar y de entender.
- **Lee la configuración dentro del hook** con `loadConfig({ app })`,
  nunca a nivel de módulo. Así un test puede ejecutar el hook contra un sitio
  en una carpeta temporal.
- **Devuelve un valor nuevo.** `getAppData` devuelve un objeto plano nuevo,
  `getMetaData` un array nuevo de objetos de página nuevos. Nunca modifiques
  la entrada.
- **La comprobación se ejecuta en `getAppData`**, el primer hook que llama
  core, y solo en un plugin con `getAssets`. Un core anterior a 4.13.0 nunca
  llama a `getAssets`, y el build terminaría igualmente con 0;
  `assertCoreVersion` lo convierte en un error. Un plugin así declara además
  `"peerDependencies": { "@nera-static/core": ">=4.13.0" }`.
- **Los archivos pasan por `getAssets`.** Core borra `public/` después de
  ejecutar los plugins, así que lo que un plugin escriba ahí directamente se
  pierde. Los archivos de un plugin se sirven en `_nera/<name>.*`.

## Configuración

`src/config.js` describe el archivo de configuración una sola vez: sus
valores por defecto y un lector por cada clave de primer nivel.
`createConfigReader` de `@nera-static/plugin-utils/config` hace el resto:
copia los valores por defecto, omite las claves vacías, ignora las
desconocidas y muestra los avisos.

```js
import { createConfigReader, loadPluginConfig } from '@nera-static/plugin-utils/config'
import { isText } from '@nera-static/plugin-utils/values'
import { log } from './log.js'

const reader = createConfigReader({
    file: 'config/example.yaml',
    defaults: { heading: 'Related pages', limit: 3 },
    readers: {
        heading: (value, current, r) => (isText(value) ? value.trim() : r.bad('heading', value, current)),
        limit: (value, current, r) => (Number.isInteger(value) && value > 0 ? value : r.bad('limit', value, current)),
    },
    warn: log.warn,
})

export function loadConfig({ cwd = process.cwd(), app } = {}) {
    return reader.normalize(loadPluginConfig('example', { cwd, app }))
}
```

- **`loadPluginConfig(name, { cwd, app })`** lee el `config/<name>.yaml`
  del sitio, o el de la carpeta que indique `app.folders.config`. Pásale el
  `app` que recibe tu hook.
- **`reader.normalize(raw)`** devuelve una copia nueva de los valores por
  defecto con cada clave válida reemplazada. Si falta el archivo, devuelve
  los valores por defecto sin decir nada; una clave vacía en YAML conserva su
  valor por defecto.
- **Cada clave tiene un lector**, y un lector devuelve el valor comprobado
  o llama a `r.bad(key, value, fallback)`, `r.ignore(where, what)` o
  `r.unknown(where, key)`. Una clave sin lector se avisa como desconocida.
- **El `config/<name>.yaml` incluido es igual a los valores por defecto.**
  Un test lo lee y lo compara con `reader.defaults()`.

## Avisos y errores

`src/log.js` crea el logger del paquete una sola vez:

```js
import { createLogger } from '@nera-static/plugin-utils/log'

export const log = createLogger('plugin-example')
```

Cada mensaje que muestra un plugin pasa por él, así el dueño del sitio sabe
por el log del build de dónde viene:

```text
⚠️ plugin-example: config/example.yaml: expected a mapping at the top level, using defaults
⚠️ plugin-example: config/example.yaml: ignoring unknown key "limits"
⚠️ plugin-example: config/example.yaml: invalid limit 0, using 3
⚠️ plugin-example: /blog/first.html: no date — add `date:` to its frontmatter
```

- `log.warn(message)` muestra `⚠️ plugin-<name>: <message>`. Los mensajes
  de configuración de arriba los genera el lector de configuración; no
  escribas los tuyos.
- `log.page(page, what, todo)` avisa sobre una página:
  `<page>: <what> — <todo>`. Di qué está mal y qué hacer.
- `log.info(message)` muestra `ℹ️ plugin-<name>: <message>`, para una línea
  de resumen ocasional.
- **Nada de `console.*` directo** en el código de ejecución de un plugin.
  `nera-stan` lo rechaza (regla `nera/shared-logger`, a partir de la versión
  1.0.0).
- **Un error que debe detener el build se lanza**, no se registra:
  `throw new Error('plugin-<name>: …')`, con el mismo prefijo y sin emoji,
  como hace `assertCoreVersion`:

```text
plugin-example: @nera-static/core 4.12.0 is too old; it needs >= 4.13.0 (the getAssets hook). Update with `npm update @nera-static/nera` (or `@nera-static/core`).
```

Los módulos de `src/` no importan el logger. Reciben un callback
`onWarning`, como `relatedPages` arriba, para seguir siendo funciones puras y
que un test pueda recoger sus avisos.

## Plantillas

- Las vistas son planas: `views/<template>.pug`, con subcarpetas solo para
  `partials/` y `helper/`.
- Un sitio las obtiene con `npm run publish-template` (y `nera add`), que
  las copia en `views/vendor/plugin-<name>/`.
- **El marcado y los nombres de clase BEM son un contrato público.** Los
  sitios tienen copias de las plantillas y dan estilo a las clases desde su
  propio CSS, así que renombrar `.tag-cloud__item` los rompe: eso es una
  versión mayor.
- Los estilos por defecto usan custom properties llamadas
  `--nera-<name>-*`, como `--nera-code-*` en `plugin-code-blocks`. La regla
  completa de prefijos está en la página Temas y starters de esta guía.

## package.json

Las claves van en este orden. Omite lo que no aplique.

```json
{
    "name": "@nera-static/plugin-example",
    "version": "1.0.0",
    "description": "A plugin for the Nera static site generator that adds related pages.",
    "main": "index.js",
    "type": "module",
    "exports": { ".": "./index.js" },
    "bin": { "nera-example": "bin/publish-template.js" },
    "scripts": {
        "publish-template": "node ./bin/publish-template.js",
        "lint": "nera-stan",
        "test": "vitest run",
        "test:watch": "vitest",
        "prepare": "husky"
    },
    "files": ["bin", "config", "index.js", "src", "views", "assets", "CHANGELOG.md"],
    "keywords": ["nera", "nera-plugin", "static-site-generator", "related-pages"],
    "author": "Michael Becker",
    "license": "MIT",
    "repository": { "type": "git", "url": "git+https://github.com/seebaermichi/nera-plugin-example.git" },
    "bugs": { "url": "https://github.com/seebaermichi/nera-plugin-example/issues" },
    "homepage": "https://github.com/seebaermichi/nera-plugin-example#readme",
    "publishConfig": { "access": "public" },
    "sideEffects": false,
    "engines": { "node": ">=22.12.0" },
    "peerDependencies": { "@nera-static/core": ">=4.13.0" },
    "dependencies": { "@nera-static/plugin-utils": "^1.7.0" },
    "devDependencies": { "@nera-static/core": "^4.15.1", "@nera-static/stan": "^1.0.0", "husky": "^9.1.7", "vitest": "^5.0.0" }
}
```

- `bin` y el script `publish-template` solo con `views/`; `views` y
  `assets` en `files` solo si existen las carpetas. `CHANGELOG.md` siempre
  está en `files`.
- `peerDependencies` sobre core solo en un plugin con `getAssets` (y por
  tanto con la comprobación).
- `engines.node` es el mínimo de core.
- `keywords` incluyen siempre `nera`, `nera-plugin` y
  `static-site-generator`, nunca el genérico `plugin`.
- Escribe el `package.json` como lo deja `npm pkg fix`: rutas de `bin` sin
  `./` delante, `repository.url` con el prefijo `git+`.

## README

Las secciones van en este orden. Omite las opcionales que no apliquen y no
añadas otras entre ellas.

```markdown
# @nera-static/plugin-example
[![Test](…/actions/workflows/test.yml/badge.svg)](…/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/@nera-static/plugin-example)](https://www.npmjs.com/package/@nera-static/plugin-example)

A plugin for the [Nera](https://nera.js.org) static site generator that …

## ✨ Features
## 🚀 Installation          nera add example, then npm install … as the manual path
## 🧩 Usage                 a minimal working example
## ⚙️ Configuration         a key | default | meaning table, then the full shipped YAML
## <feature sections>       plain headings without emoji, e.g. "Multilingual sites"
## 🛠️ Template Publishing   only with views/
## 🎨 Styling               only with views/: the BEM classes are the public contract
## 📊 Generated Output      the exact app.<key> / meta.<key> shape
## ⚠️ Warnings              optional: the messages and what to do about them
## Known limitations        optional
## 🧩 Compatibility         core floor, Node floor, plugin order (start: / end:)
## 🧪 Development
## 🤝 Contributing          one line linking the shared contributing guide
## 📦 License
```

- Un plugin con la comprobación de core lo dice justo debajo del primer
  párrafo: `Requires @nera-static/core 4.13.0 or later`, con enlace a
  Compatibility.
- **El README es la especificación pública.** Todo lo que necesita un
  usuario, como un contrato de marcado, está ahí. Nunca enlaces un archivo
  `ROADMAP`: es solo local y el enlace acabaría en un 404.
- Sin sección `Author` ni `Links`: el `package.json` ya contiene ambos.

## CHANGELOG

Cada plugin mantiene un `CHANGELOG.md` en el formato
[Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/):

```markdown
## [2.0.0] - 2026-11-27

### Changed

-   **BREAKING**: `app.example` is now `app.related`.

### Migration from v1.x

-   Replace `app.example` with `app.related` in your templates.
```

- Un encabezado por versión, `## [x.y.z] - YYYY-MM-DD`, la más reciente
  primero.
- Solo los grupos `### Added`, `### Changed`, `### Fixed` y `### Removed`.
- Las viñetas se escriben `-   …`, un guion y tres espacios, para que el
  texto empiece en la columna 4.
- Una entrada que rompe compatibilidad empieza con `**BREAKING**:`, y una
  versión mayor tiene una sección `### Migration from vX.x` con el antes y el
  después.
- **El cambio de versión y la entrada del CHANGELOG van en el mismo commit
  que el cambio**, no en el momento del release.

Qué cuenta como qué:

- **Mayor** — la forma de lo que devuelve un hook, una clave de
  configuración renombrada o eliminada o un valor por defecto con un
  significado nuevo, un `app.<key>` o `meta.<key>` renombrado, marcado de
  plantilla o clases BEM cambiados, un mínimo de core más alto.
- **Menor** — una clave de configuración nueva con un valor por defecto
  razonable, una plantilla nueva, un `app.<key>` nuevo junto a los
  existentes, un mínimo de Node más alto documentado como el real.
- **Parche** — una corrección con la misma forma de salida, cambios en el
  README e internos.
- **Sin release** — un `package-lock.json` actualizado, subidas de
  devDependencies, configuración de CI, husky o lint.
