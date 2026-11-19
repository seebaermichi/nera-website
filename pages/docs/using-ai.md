---
layout: pages/docs.pug
title: Using Nera with AI
slug: using-ai
lang: en
description: Work on a Nera site with an AI assistant — AGENTS.md, the Nera MCP server, docs for AI, the check loop and example prompts.
pagination_order: 8
---

# Using Nera with AI

AI assistants know Eleventy, Hugo and Astro well, and Nera hardly at all. Left
alone, they guess — and guess wrong: pretty URLs, a missing `layout`, edits in
`public/`. Nera gives them the facts in two ways: an instruction file in every
site, and its docs as plain Markdown.

## What every site ships

A site created with `npx @nera-static/nera new` (from `@nera-static/nera`
1.6.0 on) contains two files for AI assistants:

- **`AGENTS.md`** — the instruction file read by Codex, Cursor, GitHub Copilot,
  Gemini CLI and other assistants. It says what Nera is (and that it is not
  Eleventy, Hugo, Astro or Jekyll), maps the folders, lists the commands, names
  the usual traps — a page needs `layout`, URLs end in `.html`, `public/` is
  wiped on every build — and says to look in the plugin catalog before writing
  a feature. From 1.8.0 on it also links Nera's docs for AI (see below).
- **`CLAUDE.md`** — one line, `@AGENTS.md`, so Claude Code loads the same text.

`AGENTS.md` ends with a **Notes for this site** section below the marker line
`<!-- nera:site-notes … -->`. That part is yours: write down the audience, the
tone, the languages, pages that must not change and where the site is hosted.
The part above the marker is Nera's.

**An existing site?** From `@nera-static/nera` 1.7.0 on, `npx nera update`
creates `AGENTS.md` and `CLAUDE.md` when they are missing and refreshes only
Nera's part of `AGENTS.md`, so your notes stay. The details are in the
[CLI reference](/docs/cli.html), under "Instructions for AI assistants".

## The Nera skill

From `@nera-static/nera` 1.10.0 on, every new site also contains the **Nera
skill**, an Agent Skill: a `SKILL.md` with the workflow and the checks to run,
plus short recipes for a business site, a blog, a portfolio, a contact form,
search, images, a second language and a custom domain. Assistants that support
skills load it when a task is about Nera. It sits in two folders:

- `.agents/skills/nera/` — read by Codex, Cursor, GitHub Copilot and Gemini CLI;
- `.claude/skills/nera/` — read by Claude Code.

Both folders are Nera's: `npx nera update` adds them to an existing site and
keeps them in step with the installed version, so commit them but do not edit
them. Write your own notes in `AGENTS.md` instead.

**claude.ai and Claude Desktop** install skills by upload. Download
[`nera-skill.zip`](/downloads/nera-skill.zip) — the same skill a new site
gets — and upload it in the skills section of the settings.

## Per assistant

Open the site's folder in the assistant — the folder with `package.json` and
`AGENTS.md` — so it finds the instructions.

- **Claude Code** reads `CLAUDE.md`, which pulls in `AGENTS.md`.
- **OpenAI Codex** reads `AGENTS.md`.
- **Cursor**, **GitHub Copilot** and other coding assistants that support the
  `AGENTS.md` convention read it too.
- **Chat assistants without access to your files** (claude.ai, ChatGPT and the
  like) never see `AGENTS.md`. Give them Nera's docs in the prompt instead —
  see [Docs for AI](#docs-for-ai).

Claude Desktop, Claude Code, Cursor and Codex can also work through the Nera
MCP server, which creates, builds, checks and publishes sites for them — see
the next section.

## The Nera MCP server

[`@nera-static/mcp`](https://github.com/seebaermichi/nera-mcp) is a local
[MCP](https://modelcontextprotocol.io) server. It lets an assistant create,
edit, build, validate, preview and publish Nera sites in one folder on your
computer — your **Sites folder** — and nowhere else.

### Claude Desktop extension

The easiest way, and no Node.js needed: Claude Desktop runs the server on the
Node it ships.

1. Download `nera-mcp-<version>.mcpb` from the
   [latest release](https://github.com/seebaermichi/nera-mcp/releases/latest).
2. Double-click it and choose **Install** in Claude Desktop.
3. Pick your **Sites folder** when Claude Desktop asks for it: the folder your
   sites live in.

The extension runs on macOS and Windows. To update, install the `.mcpb` of a
newer release.

### Claude Code plugin

The plugin brings the server and the Nera skill in one install:

```bash
claude plugin marketplace add seebaermichi/nera-mcp
claude plugin install nera@nera
```

or, inside Claude Code 2.1.275 or later, in one step:

```text
/plugin install nera --marketplace seebaermichi/nera-mcp
```

Claude Code asks for your **Sites folder** when the plugin is enabled. The
plugin starts the server with `npx`, so it needs Node.js 22.12 or later
(`node --version`).

### Other clients

Cursor, Codex and other MCP clients add the server to their configuration by
hand, which also needs Node.js 22.12 or later. The commands and configuration
files are in the README, under
[Manual configuration](https://github.com/seebaermichi/nera-mcp#manual-configuration).

### What the assistant can do

With the server, the assistant lists the starter kits, themes and plugins,
creates a site, reads and writes its pages and files, adds plugins, builds,
validates, starts a preview and publishes to GitHub Pages or Netlify — with the
same results as you get in a terminal. The full list is in the README, under
[Tools](https://github.com/seebaermichi/nera-mcp#tools).

## Docs for AI

nera.js.org publishes its docs for assistants, in English:

- [`https://nera.js.org/llms.txt`](https://nera.js.org/llms.txt) — an index of
  the docs, following the llms.txt convention;
- [`https://nera.js.org/llms-full.txt`](https://nera.js.org/llms-full.txt) —
  all English docs and tutorials in one Markdown file;
- a raw Markdown file beside every English docs and tutorials page, e.g.
  [`/docs/cli.md`](/docs/cli.md) next to `/docs/cli.html`.

Paste one of these URLs into a chat assistant's prompt, or attach the file. The
docs are English only on purpose: models read them well and answer in your
language.

## The workflow

1. Ask for one change at a time.
2. Let the assistant edit the files.
3. It runs `npx nera validate`, then `npx nera build --check`, and fixes what
   they report. `AGENTS.md` tells it to; say so in the prompt if it does not.
   With `--json` (from 1.9.0 on) both print their findings for machines.
4. Preview with `npm run dev` on `http://localhost:3000`.
5. Review the diff (`git diff`) before you publish.

## Example prompts

Create a new site — there is no `AGENTS.md` yet, so name the command and the
docs:

```text
Create a new Nera site in the folder "bakery" with
npx @nera-static/nera new bakery, then read its AGENTS.md before changing
anything. Nera's docs are at https://nera.js.org/llms.txt.
```

Add a page:

```text
Add an "About us" page at pages/about.md with the same layout as
pages/index.md, and link it from the menu (if the site has no menu yet, add
@nera-static/plugin-navigation with npx nera add navigation). Then run
npx nera validate and npx nera build --check and fix what they report.
```

Add a contact form with the plugin:

```text
Add a contact form to the contact page with @nera-static/plugin-contact-form.
Add it with npx nera add contact-form, include its template in the page
template and set my address as recipient in the config/contact-form.yaml it
copies. Do not write a form by hand.
```

Add a second language:

```text
Add German as a second language. Put the German pages under pages/de/, set
lang: de in their frontmatter, move the interface text into translations in
config/app.yaml and use t('key') in the templates.
```

Fix what `nera validate` reports:

```text
Run npx nera validate and fix every error and warning it reports. Explain each
fix in one line. Then run npx nera build --check.
```

In a chat assistant without file access:

```text
Read https://nera.js.org/llms-full.txt — the docs of the Nera static site
generator. Then explain how I add a blog section with tags to my Nera site,
with the files I need to create and their content.
```

## What's planned

Planned, not available yet: a **hosted connector** for claude.ai and ChatGPT
that works on your GitHub repository, with no local install.
