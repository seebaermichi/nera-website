---
layout: pages/docs.pug
title: Tests
slug: style-guide-tests
lang: es
description: Cómo escribe sus tests cada paquete de Nera — estructura y nombres, un único vitest.config.js, los scripts de test, las reglas de escritura y los patrones de integración según el tipo de paquete.
pagination_order: 4
---

# Tests

Cada paquete de Nera se prueba con [vitest](https://vitest.dev), y cada
paquete escribe sus tests de la misma manera: las mismas carpetas, los
mismos nombres de archivo, la misma configuración, el mismo estilo dentro de
un test. Abre los tests de cualquier paquete de Nera y encontrarás el test
de extremo a extremo en el mismo archivo, las fixtures en la misma carpeta y
la misma forma de redactar cada `it`.

## Estructura y nombres

```text
test/
├── <module>.test.js          # un archivo por módulo fuente
├── integration.test.js       # el test de extremo a extremo a través de core o la CLI
├── helpers.js                # los helpers propios del paquete, si los necesita
├── helpers/<topic>.js        # en lugar de helpers.js, cuando aparece un segundo tema
├── fixtures/<name>/          # datos que lee un test
├── site/                     # un sitio de fixture completo (temas, starters)
└── global-setup.js           # solo para builds compartidos entre archivos
```

- **Los tests viven en `test/`**, en la raíz del repositorio, nunca en
  `src/`.
- **Un archivo por módulo fuente**: `src/config.js` se prueba en
  `test/config.test.js`.
- **El test de extremo a extremo es siempre `test/integration.test.js`**:
  construye un sitio a través de core o ejecuta la CLI. Los temas tienen en
  su lugar un archivo por sección de su contrato y leen los builds de
  `test/global-setup.js`
  (ver [Temas y starters](/es/docs/style-guide/themes-and-starters.html#tests-de-un-tema)).
- **Sin infijos**: nada de `.unit.`, `.integration.` o `.template.` en el
  nombre de un archivo. La carpeta y el nombre del módulo ya lo dicen.
- **Fixtures**: datos en `test/fixtures/<name>`, un sitio de fixture
  completo en `test/site/`.
- **Helpers**: los helpers propios del paquete en `test/helpers.js`,
  divididos en `test/helpers/<topic>.js` cuando aparece un segundo tema (por
  ejemplo `test/helpers/fake-github.js`). Un helper que necesita más de un
  paquete va a `@nera-static/test-utils`, no a una copia.
- **`test/global-setup.js` solo para builds compartidos entre archivos**,
  como en los temas y los starters, donde construir la fixture una vez por
  archivo sería demasiado lento.

## vitest.config.js

Cada repositorio tiene un `vitest.config.js`, y parte del mismo contenido:

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['test/**/*.test.js'],
        environment: 'node',
        restoreMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,
    },
})
```

- **`restoreMocks`, `unstubEnvs` y `unstubGlobals`** deshacen después de
  cada test cada spy, cada variable de entorno y cada global sustituidos, así
  que ningún test tiene que limpiar lo que deja y ninguno afecta al
  siguiente.
- **Sin `globals: true`.** Los tests importan lo que usan desde `'vitest'`.
- **Todo lo demás se añade solo cuando el paquete lo necesita, con un
  comentario que diga por qué**: `testTimeout` y `hookTimeout` cuando cada
  test construye un sitio, `globalSetup: ['test/global-setup.js']` para
  builds compartidos, `isolate: false` donde los archivos de test no tocan
  estado compartido.
- **Un timeout que solo necesitan unos pocos tests se queda en esos tests**,
  como tercer argumento de `it`, no en la configuración.

## Scripts

```json
"scripts": {
    "lint": "nera-stan",
    "test": "vitest run",
    "test:watch": "vitest",
    "prepare": "husky"
}
```

- **`npm test` ejecuta la suite una vez y termina**, la misma pasada única
  que ejecutan la CI (`npx vitest run` en `test.yml`) y el hook `pre-push`
  de husky. El modo watch es `npm run test:watch`.
- **Sin script de cobertura** hasta que alguien necesite cobertura.
- **`npm run lint` ejecuta `nera-stan`**, que también revisa los archivos de
  test (ver [Herramientas](/es/docs/style-guide/tooling.html)).

## Escribir tests

```js
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { loadConfig } from '../src/config.js'

const ROOT = path.resolve(import.meta.dirname, '..')

describe('loadConfig', () => {
    it('returns the defaults when the config file is missing', () => {
        expect(loadConfig({ cwd: path.join(ROOT, 'test/fixtures/empty') })).toEqual({ heading: 'Related pages', limit: 3 })
    })

    it('warns about an unknown key and ignores it', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const config = loadConfig({ cwd: path.join(ROOT, 'test/fixtures/unknown-key') })

        expect(config).not.toHaveProperty('limits')
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('ignoring unknown key "limits"'))
    })
})
```

- **Importa todo explícitamente desde `'vitest'`**, y usa `it`, nunca
  `test`.
- **`describe` nombra la unidad** (una función, un módulo, un comando) o el
  escenario, en minúsculas: `describe('a site deployed under base_path')`.
- **`it` describe el comportamiento en presente, sin «should»**:
  `it('copies the stylesheet')`, no `it('should copy the stylesheet')`.
- **En inglés**, en nombres y comentarios.
- **Solo `expect`**, ninguna otra biblioteca de aserciones.
- **Sin snapshots en archivo.** Escribe los valores esperados. Un snapshot
  inline vale para marcado generado largo, como el elemento `<picture>` del
  plugin de imágenes.
- **Ancla las rutas en el archivo de test**:
  `path.resolve(import.meta.dirname, '..')`. Nunca resuelvas una ruta
  respecto al directorio actual, como en `path.resolve('views/tags.pug')`:
  entonces el test solo pasa cuando vitest se ejecuta desde la raíz del
  paquete.
- **Carpetas temporales solo bajo `os.tmpdir()`**, nunca dentro del
  repositorio, y eliminadas después de los tests.
- **Nunca `process.chdir`.** Un hook que lee `process.cwd()` se prueba
  espiándolo (`vi.spyOn(process, 'cwd')`) o pasándole `cwd`, como permite
  `loadConfig({ cwd })`.
- **Mocks con `vi.spyOn` y con `vi.fn()` pasado** como dependencia.
  `vi.mock` solo cuando el código no ofrece ningún punto de inyección.
  Restaurar queda en manos de `restoreMocks`.
- **Módulos integrados con el prefijo `node:`**: `'node:fs'`,
  `'node:path'`, `'node:os'`. `fs` síncrono está bien para escribir
  fixtures.

`nera-stan` comprueba cuatro de estas reglas en cada archivo de test, desde
la versión 1.0.0: `nera/test-no-chdir`, `nera/test-no-cwd-path`,
`nera/test-name` y `nera/test-helpers`.

## Tests de integración

Cómo construye su sitio el test de extremo a extremo depende del tipo de
paquete:

- **Plugins**: `test/integration.test.js` crea en una carpeta temporal un
  sitio con el plugin bajo prueba, lo construye a través de
  `@nera-static/core` y comprueba los archivos de `public/`. Para ello, cada
  plugin tiene `@nera-static/core` como devDependency. Los tests unitarios
  de un hook lo ejecutan contra un sitio temporal haciendo que
  `process.cwd()` apunte a él, no cambiando de directorio.
- **Temas y starters**: `test/global-setup.js` construye cada variante del
  sitio de fixture una vez, y los archivos de test leen los builds con
  `inject('builds')` de vitest.
- **La CLI, el validador y el servidor MCP**: una carpeta temporal con los
  archivos que necesita el test, y el directorio de trabajo pasado como
  argumento o espiado.

## Helpers de test compartidos

`@nera-static/test-utils` (próximamente) reunirá los helpers que hoy cada
paquete de Nera escribe en su propio `test/helpers.js`: crear una carpeta
temporal y escribir archivos en ella, construir un sitio dentro, leer su
`public/`, capturar la salida de la consola, ejecutar la CLI, y las suites
compartidas para temas y para la publicación de plantillas.

- **Un helper de test genérico viene de `@nera-static/test-utils`**, no de
  una copia local. `nera/test-helpers` rechaza una función en un archivo de
  test que lleve el nombre de uno de sus helpers; la lista de nombres viene
  con `nera-stan` 1.0.0.
- **Lo que solo necesita tu paquete se queda en `test/helpers.js`**, como un
  simulador de un servicio externo.
