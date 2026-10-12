---
layout: pages/docs.pug
title: Using Nera with AI
slug: using-ai
lang: en
description: Work on a Nera site with an AI assistant — AGENTS.md, docs for AI, the check loop and example prompts.
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

## Per assistant

Open the site's folder in the assistant — the folder with `package.json` and
`AGENTS.md` — so it finds the instructions.

- **Claude Code** reads `CLAUDE.md`, which pulls in `AGENTS.md`.
- **OpenAI Codex** reads `AGENTS.md`.
- **Cursor**, **GitHub Copilot** and other coding assistants that support the
  `AGENTS.md` convention read it too.
- **Chat assistants without access to your files** (claude.ai, ChatGPT and the
  like) never see `AGENTS.md`. Give them Nera's docs in the prompt instead —
  see the next section.

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
pages/index.md, and link it from the menu (add
@nera-static/plugin-navigation if the site has no menu yet). Then run
npx nera validate and npx nera build --check and fix what they report.
```

Add a contact form with the plugin:

```text
Add a contact form to the contact page with @nera-static/plugin-contact-form.
Install it, copy its template with its command, include it in the page
template and set my address in config/contact-form.yaml. Do not write a form
by hand.
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

Planned, not available yet:

- a **Nera skill** (an Agent Skill) copied into every site for assistants that
  load skills, plus a download for claude.ai and Claude Desktop;
- **`--json` output** for `nera validate` and `nera check`, so assistants can
  read the findings directly;
- **`nera publish`** — getting a site online from the CLI;
- an **MCP server** for Nera: a local one for Claude Desktop, Claude Code and
  Cursor, and a hosted connector for claude.ai and ChatGPT that works on your
  GitHub repository.
