---
layout: pages/docs.pug
title: Usar Nera con IA
slug: using-ai
lang: es
description: Trabajar en un sitio Nera con un asistente de IA — AGENTS.md, documentación para IA, el ciclo de comprobación y prompts de ejemplo.
pagination_order: 8
---

# Usar Nera con IA

Los asistentes de IA conocen bien Eleventy, Hugo y Astro, y Nera casi nada.
Solos, adivinan — y se equivocan: URLs «bonitas», un `layout` que falta,
cambios en `public/`. Nera les da los datos de dos maneras: un archivo de
instrucciones en cada sitio y su documentación en Markdown plano.

## Lo que trae cada sitio

Un sitio creado con `npx @nera-static/nera new` (desde `@nera-static/nera`
1.6.0) contiene dos archivos para asistentes de IA:

- **`AGENTS.md`** — el archivo de instrucciones que leen Codex, Cursor, GitHub
  Copilot, Gemini CLI y otros asistentes. Explica qué es Nera (y que no es
  Eleventy, Hugo, Astro ni Jekyll), describe las carpetas, enumera los
  comandos, señala las trampas habituales — una página necesita `layout`, las
  URLs terminan en `.html`, `public/` se borra en cada compilación — y pide
  buscar en el catálogo de plugins antes de escribir una función. Desde la
  1.8.0 también enlaza la documentación de Nera para IA (ver más abajo).
- **`CLAUDE.md`** — una línea, `@AGENTS.md`, para que Claude Code cargue el
  mismo texto.

`AGENTS.md` termina con una sección **Notes for this site** debajo de la línea
marcadora `<!-- nera:site-notes … -->`. Esa parte es tuya: anota el público,
el tono, los idiomas, las páginas que no deben cambiar y dónde se aloja el
sitio. La parte de arriba del marcador es de Nera.

**¿Un sitio existente?** Desde `@nera-static/nera` 1.7.0, `npx nera update`
crea `AGENTS.md` y `CLAUDE.md` cuando faltan y renueva solo la parte de Nera
de `AGENTS.md`, así que tus notas se mantienen. Los detalles están en la
[referencia de la CLI](/es/docs/cli.html), en «Instrucciones para asistentes
de IA».

## La skill de Nera

Desde `@nera-static/nera` 1.10.0, cada sitio nuevo incluye también la **skill
de Nera**, una Agent Skill: un `SKILL.md` con el flujo de trabajo y las
comprobaciones, y recetas cortas para un sitio de empresa, un blog, un
portafolio, un formulario de contacto, la búsqueda, imágenes, un segundo idioma
y un dominio propio. Los asistentes que admiten skills la cargan cuando la
tarea trata de Nera. Está en dos carpetas:

- `.agents/skills/nera/` — la leen Codex, Cursor, GitHub Copilot y Gemini CLI;
- `.claude/skills/nera/` — la lee Claude Code.

Las dos carpetas son de Nera: `npx nera update` las añade a un sitio existente
y las mantiene al día con la versión instalada. Haz commit de ellas, pero no
las edites; tus propias notas van en `AGENTS.md`.

**claude.ai y Claude Desktop** instalan skills subiéndolas. Descarga
[`nera-skill.zip`](/downloads/nera-skill.zip) — la misma skill que recibe un
sitio nuevo — y súbela en la sección de skills de la configuración.

## Según el asistente

Abre en el asistente la carpeta del sitio — la que tiene `package.json` y
`AGENTS.md` — para que encuentre las instrucciones.

- **Claude Code** lee `CLAUDE.md`, que incluye `AGENTS.md`.
- **OpenAI Codex** lee `AGENTS.md`.
- **Cursor**, **GitHub Copilot** y otros asistentes de programación que
  admiten la convención `AGENTS.md` también lo leen.
- **Los asistentes de chat sin acceso a tus archivos** (claude.ai, ChatGPT y
  similares) nunca ven `AGENTS.md`. Dales la documentación de Nera en el
  prompt — mira la sección siguiente.

## Documentación para IA

nera.js.org publica su documentación para asistentes, en inglés:

- [`https://nera.js.org/llms.txt`](https://nera.js.org/llms.txt) — un índice
  de la documentación según la convención llms.txt;
- [`https://nera.js.org/llms-full.txt`](https://nera.js.org/llms-full.txt) —
  toda la documentación y los tutoriales en inglés en un solo archivo Markdown;
- un archivo Markdown plano junto a cada página de documentación y de
  tutoriales en inglés, p. ej. [`/docs/cli.md`](/docs/cli.md) junto a
  `/docs/cli.html`.

Pega una de estas URLs en el prompt de un asistente de chat o adjunta el
archivo. Esta documentación está solo en inglés a propósito: los modelos leen
bien la documentación en inglés y te responden en español.

## El flujo de trabajo

1. Pide un cambio cada vez.
2. Deja que el asistente edite los archivos.
3. El asistente ejecuta `npx nera validate` y luego `npx nera build --check`,
   y corrige lo que informen. `AGENTS.md` se lo pide; si no lo hace, dilo en
   el prompt. Con `--json` (desde la 1.9.0) ambos dan sus resultados en un
   formato legible por máquinas.
4. Revisa el resultado con `npm run dev` en `http://localhost:3000`.
5. Revisa el diff (`git diff`) antes de publicar.

## Prompts de ejemplo

Crear un sitio nuevo — todavía no hay `AGENTS.md`, así que nombra el comando
y la documentación:

```text
Crea un sitio Nera nuevo en la carpeta "panaderia" con
npx @nera-static/nera new panaderia y lee su AGENTS.md antes de cambiar nada.
La documentación de Nera está en https://nera.js.org/llms.txt.
```

Añadir una página:

```text
Añade una página "Sobre nosotros" en pages/about.md con el mismo layout que
pages/index.md y enlázala desde el menú (instala
@nera-static/plugin-navigation si el sitio aún no tiene menú). Luego ejecuta
npx nera validate y npx nera build --check y corrige lo que informen.
```

Añadir un formulario de contacto con el plugin:

```text
Añade un formulario de contacto a la página de contacto con
@nera-static/plugin-contact-form. Instálalo, copia su plantilla con su
comando, inclúyela en la plantilla de la página y pon mi dirección en
config/contact-form.yaml. No escribas un formulario a mano.
```

Añadir un segundo idioma:

```text
Añade el inglés como segundo idioma. Pon las páginas en inglés en pages/en/,
define lang: en en su frontmatter, mueve los textos de la interfaz a
translations en config/app.yaml y usa t('key') en las plantillas.
```

Corregir lo que informa `nera validate`:

```text
Ejecuta npx nera validate y corrige cada error y cada advertencia que
informe. Explica cada corrección en una línea. Después ejecuta
npx nera build --check.
```

En un asistente de chat sin acceso a archivos:

```text
Lee https://nera.js.org/llms-full.txt — la documentación del generador de
sitios estáticos Nera. Después explícame cómo añado un blog con etiquetas a
mi sitio Nera, con los archivos que tengo que crear y su contenido.
```

## Lo que está previsto

Previsto, todavía no disponible:

- **`nera publish`** — publicar un sitio desde la CLI;
- un **servidor MCP** para Nera: uno local para Claude Desktop, Claude Code y
  Cursor, y un conector alojado para claude.ai y ChatGPT que trabaja sobre tu
  repositorio de GitHub.
