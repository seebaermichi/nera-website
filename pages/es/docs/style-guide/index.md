---
layout: pages/docs.pug
title: Guía de estilo
slug: style-guide
lang: es
description: La caligrafía de Nera para colaboradores — una sola forma de escribir cada paquete de Nera, helpers solo de @nera-static/plugin-utils, sin copias.
pagination_order: 1
---

# Guía de estilo

Nera son muchos paquetes pequeños: el motor `@nera-static/core`, la CLI
`@nera-static/nera`, el validador, el servidor MCP, una veintena de plugins,
los temas y los starters. Cada uno debe leerse como los demás. Abre cualquiera
y reconoces Nera a primera vista; solo cambia la funcionalidad. Esta guía de
estilo recoge esa **única caligrafía**, para todas las personas que colaboran
en un paquete de Nera o escriben su propio plugin, tema o starter.

No la necesitas para construir un sitio. Para eso, empieza por la
[documentación](/es/docs/index.html).

## El principio

- **Un helper genérico existe una sola vez, en un paquete compartido.**
  Comprobar si algo es un objeto plano, leer la configuración de un plugin,
  mostrar un aviso, comprobar la versión de core, componer la URL de una
  página, leer la fecha de una página: nada de esto se vuelve a escribir
  dentro de un plugin, tema, starter o herramienta. Viene de
  `@nera-static/plugin-utils`. **Sin copias** — tampoco en core, la CLI, el
  validador o el servidor MCP, y tampoco como copia comentada «de
  plugin-sitemap».
- **Lo mismo vale para la forma de un paquete.** Un plugin, un tema y un
  starter tienen cada uno una sola estructura: los mismos archivos en los
  mismos sitios, la misma forma de los hooks, el mismo orden de claves en
  `package.json`, el mismo esquema de README, la misma manera de escribir
  tests.
- **Donde una regla no se puede mantener a mano, una herramienta la impone.**
  Cada repositorio de Nera ejecuta las mismas comprobaciones en
  `npm run lint`, así que la CI rechaza lo que las incumple.
- **Una variante sin explicar es un defecto.** Si tu paquete hace algo
  distinto que sus hermanos, o bien la guía lo permite, o bien la diferencia
  lleva un comentario que explica por qué. Si no, se corrige como un bug.

## Por qué importa

Antes, cada paquete de Nera empezaba copiando un hermano del mismo tipo. Las
copias divergen: un plugin arreglaba su parser de fechas, el siguiente
conservaba el fallo antiguo y un tercero lo reescribía con otras reglas. El
resultado fueron docenas de copias de los mismos helpers en varias variantes,
y fallos que un solo arreglo en un solo sitio habría eliminado en todas
partes. «Copia un hermano» ya no es la instrucción. Lo son esta guía y los
paquetes compartidos.

## Dónde vive el código compartido

- **`@nera-static/plugin-utils`** contiene todos los helpers genéricos de
  ejecución, un subpath por familia. A partir de la versión 1.7.0: `/values`
  (objetos planos, valores de texto), `/config` (leer y normalizar el archivo
  de configuración de un plugin), `/log` (un único formato de avisos),
  `/guard` (la versión mínima de core) y `/packages` (resolver un paquete
  desde el sitio). Seguirán más familias, como URLs, fechas, escapado de HTML
  y el idioma de la página.
- **`@nera-static/test-utils`** (próximamente) contendrá los helpers de test
  compartidos: construir un sitio en una carpeta temporal, leer la salida,
  las suites de los temas.
- **`@nera-static/stan`** (`nera-stan`, a partir de la versión 1.0.0) es la
  única comprobación que ejecuta cada repositorio: código, CSS, Pug y la
  estructura del paquete.

Antes de escribir un helper, busca en `@nera-static/plugin-utils`. Si no está
y es genérico, su sitio es ese paquete, no el tuyo.

## Qué cubre la guía

Las páginas de esta sección siguen el principio a través de cada tipo de
paquete:

1. **Plugins** — la anatomía de un plugin: archivos, la forma de los hooks,
   configuración y avisos, `package.json`, README y CHANGELOG.
2. **Temas y starters** — la estructura de un tema y de un starter, el
   objeto helper del tema, los prefijos de las custom properties.
3. **Tests** — dónde viven los tests, cómo se nombran y se escriben, y los
   helpers compartidos.
4. **Herramientas** — qué comprueba `nera-stan`, cómo se ejecuta, sus
   excepciones documentadas y el `.editorconfig` compartido.
