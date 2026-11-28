---
layout: pages/docs.pug
title: Herramientas
slug: style-guide-tooling
lang: es
description: Las herramientas que mantienen la caligrafía de Nera — nera-stan en cada repositorio, sus reglas, correcciones y excepciones, el .editorconfig compartido y la revisión semanal entre repositorios. Sin Prettier.
pagination_order: 5
---

# Herramientas

Una regla que solo vive en una página se desdibuja. Cada regla de esta guía
que una máquina puede comprobar la comprueba una sola herramienta,
`nera-stan`, que cada repositorio de Nera ejecuta en `npm run lint`. Lo que
un repositorio por sí solo no puede ver, como un helper escrito dos veces
en dos paquetes, lo encuentra una revisión semanal de todos los
repositorios. Todo lo demás está en el `.editorconfig` compartido.

## nera-stan

`@nera-static/stan` (comando `nera-stan`, desde la versión 1.0.0) es la
revisión de la caligrafía de un único repositorio de Nera. Es una
devDependency de cada paquete y se ejecuta como su script de lint:

```json
"scripts": {
    "lint": "nera-stan"
}
```

Así la misma revisión se ejecuta en todos los sitios donde importa:

- **en tu máquina**, con `npm run lint`, y a través de los hooks de husky:
  `pre-commit: npm run lint` antes de cada commit,
  `pre-push: npm run lint && npx vitest run` antes de cada push;
- **en la CI**, donde `test.yml` ejecuta `npm run lint` en cada push y pull
  request, y `publish.yml` se niega a publicar una versión que no lo pasa.

`nera-stan` trae su propia configuración de ESLint y nunca lee el
`eslint.config.js` del repositorio, así que ningún repositorio puede
relajar una regla. El `eslint.config.js` solo sirve a tu editor, y tiene
dos líneas:

```js
import nera from '@nera-static/stan'

export default [...nera]
```

### Ejecución

```text
nera-stan [dir] [--fix]
```

- **`dir`** es el repositorio que se revisa, por defecto el directorio
  actual.
- **`--fix`** aplica las correcciones que tienen un único resultado
  claramente correcto y te deja el resto a ti.
- **`--help`** y **`--version`** muestran la ayuda y la versión.

`nera-stan` imprime en stdout un hallazgo por línea, ordenados por archivo
y línea, con el archivo relativo al repositorio, y una línea de resumen en
stderr:

```text
index.js:14 nera/shared-logger `console.warn` in plugin runtime code: `import { createLogger } from '@nera-static/plugin-utils/log'`, create one logger with `createLogger('plugin-example')` and call its `warn`/`info` instead
src/related.js:3 @stylistic/comma-dangle Missing trailing comma.
nera-stan: 2 problems (1 fixable with --fix)
```

El código de salida dice cómo fue:

| Código de salida | Significado                                        |
| ---------------- | -------------------------------------------------- |
| `0`              | limpio                                             |
| `1`              | hallazgos                                          |
| `2`              | un error de uso, un `package.json` ausente o no válido, o un error interno |

Cada regla es un error. No hay nivel de aviso: lo que `nera-stan` informa se
corrige, o es una excepción documentada.

### Tipos de repositorio

Algunas reglas solo se aplican a algunos tipos de repositorio. `nera-stan`
lee el tipo del `package.json`, de nada más:

| Tipo      | Se reconoce por                                                             |
| --------- | --------------------------------------------------------------------------- |
| `core`    | el nombre `@nera-static/core`                                               |
| `starter` | un campo `nera.starter`                                                     |
| `theme`   | un nombre `@nera-static/theme-*` o un campo `nera.generator`                |
| `plugin`  | un nombre `@nera-static/plugin-*`, salvo `@nera-static/plugin-utils`        |
| `site`    | ningún nombre `@nera-static/` y una dependencia de `@nera-static/nera`      |
| `tool`    | todo lo demás: la CLI, el validador, plugin-utils, el servidor MCP, …      |

### Qué comprueba

En todos los tipos, en cada archivo `.js`, `.mjs` y `.cjs`:

- **Las reglas recomendadas de ESLint**, con los globals de Node (los del
  navegador para los scripts bajo `assets/`, los de vitest en los archivos
  de test).
- **El formato**: 4 espacios, sin punto y coma, comillas simples (dobles
  donde evitan escapes), comas finales en literales de varias líneas,
  paréntesis alrededor de cada parámetro de una función flecha, espacios
  dentro de las llaves, un salto de línea final, sin espacios al final de
  línea, como máximo 120 caracteres por línea (salvo cadenas largas, URLs y
  comentarios).
- **`prefer-const`, `no-var` y `no-unused-vars`.**
- **Módulos integrados con el prefijo `node:`** (`n/prefer-node-protocol`).

Y las reglas de Nera:

| Regla                   | Tipos          | Archivos                      | Qué rechaza | `--fix` |
| ----------------------- | -------------- | ----------------------------- | ----------- | ------- |
| `nera/no-local-helper`  | todos salvo plugin-utils y test-utils | todos salvo los scripts de navegador en `assets/` y `views/` | una función local con el nombre o la forma de un helper de `@nera-static/plugin-utils`; el mensaje nombra el export que hay que importar | no |
| `nera/shared-logger`    | plugin         | código de ejecución (no `test/`, `bin/`, `scripts/`, `views/`, `assets/`) | un `console.*` suelto; usa `createLogger` | no |
| `nera/no-copied-from`   | todos          | comentarios en todas partes; `ROADMAP` en los archivos publicados | una nota «copied from …» y una referencia a un archivo `ROADMAP` solo local | no |
| `nera/hook-shape`       | plugin         | código de ejecución           | un hook exportado con `export { … }`, un hook que no desestructura su argumento con valores por defecto, una configuración leída a nivel de módulo | añade los valores por defecto que faltan |
| `nera/test-no-chdir`    | todos          | archivos de test              | `process.chdir` | no |
| `nera/test-no-cwd-path` | todos          | archivos de test              | una ruta resuelta respecto al directorio actual, como `path.resolve('views/x.pug')` | no |
| `nera/test-name`        | todos          | archivos de test              | un nombre de test que empieza por «should» | no |
| `nera/test-helpers`     | todos          | archivos de test              | una copia local de un helper de `@nera-static/test-utils` | no |

Los archivos de test son todo lo que está bajo `test/` y cada `*.test.js`.
Las reglas de escritura detrás de las reglas de test están en la página
[Tests](/es/docs/style-guide/tests.html).

`--fix` cambia solo lo que tiene un único resultado correcto: las reglas de
formato, el prefijo `node:` y los valores por defecto que le faltan a un
hook (`({ app, pagesData })` pasa a ser
`({ app = {}, pagesData = [] } = {})`). Nunca reescribe `(data)` como un
argumento desestructurado, y no renombra tests, porque quitar «should»
cambia la forma del verbo.

Desde la 1.1.0 hay tres familias de reglas más junto a las reglas de código:

- `css/*`: cada archivo CSS pasa por stylelint, con el patrón de clases BEM
  y los [prefijos de las custom properties](/es/docs/style-guide/themes-and-starters.html#custom-properties).
- `pug/*`: cada plantilla Pug se puede analizar, se sangra en múltiplos de 4
  espacios sin tabuladores, pone los valores de atributo entre comillas
  simples y escribe clases BEM.
- `structure/*`: `package.json`, README, CHANGELOG, LICENSE, los archivos
  canónicos y los archivos que debe tener cada tipo de repositorio.

### Excepciones

- **Siempre ignorados**: `node_modules/`, `public/`, `dist/`, `coverage/`,
  `.nera-cache/` y `test/site/public/`, además de todo lo que lista el
  `.gitignore` del repositorio.
- **Las excepciones propias de un repositorio** van en `package.json`, bajo
  una sola clave, y en ningún otro sitio:

  ```json
  "nera-stan": {
      "ignores": ["test/markup/", "demo/demo.js"],
      "variants": { ".github/workflows/test.yml": "image-cache" },
      "skip": { "structure/test-scripts": "a theme without tests: it compiles its templates instead" }
  }
  ```

  `ignores` es para archivos que no son código de Nera, como fixtures
  generadas o una demo incluida. `variants` elige una variante con nombre
  de un archivo canónico, y `skip` desactiva una regla con su motivo. El
  [README](https://github.com/seebaermichi/nera-stan#readme) nombra los
  valores permitidos.
- **Una sola línea** puede exceptuarse con un comentario de ESLint que
  nombre la regla y diga por qué:

  ```js
  // eslint-disable-next-line nera/shared-logger -- the CLI prints its own report
  console.log(report)
  ```

  Un comentario de desactivación que ya no suprime nada es a su vez un
  error, para que ninguna excepción sobreviva a su motivo. Un comentario de
  desactivación sin un motivo tras ` -- ` también es un error.

## .editorconfig

Cada repositorio lleva el mismo `.editorconfig`. Fija la indentación de los
tipos de archivo que ningún linter toca, como Pug, CSS, YAML y JSON, en
cualquier editor que lo lea:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 4
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

Markdown conserva sus espacios al final de línea, porque allí dos de ellos
son un salto de línea.

## La revisión semanal entre repositorios

`nera-stan` ve un repositorio cada vez. `style-check`, un script en el
repositorio del motor (`generator/scripts/style-check.js`), los lee todos a
la vez y señala lo que solo se ve entre repositorios:

- helpers definidos en dos o más repositorios, que corresponden a
  `@nera-static/plugin-utils`;
- plantillas y scripts de plugins que un tema, un starter o el sitio web han
  copiado, comparados con la versión del plugin de la que proceden;
- archivos que deben ser idénticos en todos los repositorios de un tipo.

Se ejecuta cada lunes sobre un clon reciente de todos los repositorios
públicos de Nera y escribe su informe en el resumen del workflow. Una
diferencia deliberada figura en su lista de permitidos con un motivo, y
sigue visible en el informe como permitida.

## Sin Prettier

Nera no usa Prettier. Las reglas de formato de ESLint ya imponen la
caligrafía en JavaScript, un segundo formateador lucharía contra ellas, y
el plugin de Pug para Prettier reescribiría cada plantilla. En un paquete
de Nera no hay paso de build ni de formato: lo que escribes es lo que
comprueba `nera-stan`.
