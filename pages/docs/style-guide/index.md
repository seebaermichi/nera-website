---
layout: pages/docs.pug
title: Style guide
slug: style-guide
lang: en
description: The Nera handwriting for contributors — one way to write every Nera package, helpers from @nera-static/plugin-utils only, no copies.
pagination_order: 1
---

# Style guide

Nera is many small packages: the engine `@nera-static/core`, the CLI
`@nera-static/nera`, the validator, the MCP server, some twenty plugins, the
themes and the starters. Each of them should read like the others. Open any of
them and you recognise Nera at a glance; only the feature differs. This style
guide writes down that **one handwriting**, for everyone who contributes to a
Nera package or writes a plugin, theme or starter of their own.

You do not need it to build a site. For that, start with the
[documentation](/docs/index.html).

## The principle

- **A generic helper exists once, in a shared package.** Checking for a plain
  object, reading a plugin's config, printing a warning, guarding the core
  version, joining a page URL, parsing a page date: none of this is written
  again inside a plugin, theme, starter or tool. It comes from
  `@nera-static/plugin-utils`. **No copies** — not in core, the CLI, the
  validator or the MCP server either, and not as a commented copy "from
  plugin-sitemap".
- **The same goes for the shape of a package.** A plugin, a theme and a
  starter each have one layout: the same files in the same places, the same
  hook shape, the same `package.json` key order, the same README outline, the
  same way of writing tests.
- **Where a rule cannot be kept by hand, a tool enforces it.** Every Nera
  repository runs the same checks in `npm run lint`, so CI refuses what breaks
  them.
- **An unexplained variant is a defect.** If your package does something
  differently from its siblings, either the guide allows it, or the difference
  carries a comment that says why. Otherwise it is fixed like a bug.

## Why it matters

Every Nera package used to be started by copying a sibling of the same kind.
Copies drift: one plugin fixed its date parser, the next one kept the old
bug, a third one rewrote it with other rules. The result was dozens of copies
of the same helpers in several variants, and bugs that one fix in one place
would have removed everywhere. "Copy a sibling" is no longer the instruction.
This guide and the shared packages are.

## Where the shared code lives

- **`@nera-static/plugin-utils`** holds every generic runtime helper, one
  subpath per family. From version 1.7.0 on: `/values` (plain objects, text
  values), `/config` (reading and normalising a plugin's config file), `/log`
  (one warning format), `/guard` (the minimum core version) and `/packages`
  (resolving a package from the site). More families follow, such as URLs,
  dates, HTML escaping and the page language.
- **`@nera-static/test-utils`** (coming) will hold the shared test helpers:
  building a site in a temporary folder, reading the output, the theme suites.
- **`@nera-static/stan`** (`nera-stan`, from version 1.0.0) is the one check
  every repository runs: code, CSS, Pug and the package structure.

Before you write a helper, look in `@nera-static/plugin-utils`. If it is not
there and it is generic, it belongs there, not in your package.

## What the guide covers

The pages of this section follow the principle through each kind of package:

1. **Plugins** — the anatomy of a plugin: files, the hook shape, config and
   warnings, `package.json`, README and CHANGELOG.
2. **Themes and starters** — the layout of a theme and a starter, the theme
   helper object, the custom-property prefixes.
3. **Tests** — where tests live, how they are named and written, and the
   shared helpers.
4. **Tooling** — what `nera-stan` checks, how to run it, its documented
   exceptions, and the shared `.editorconfig`.
