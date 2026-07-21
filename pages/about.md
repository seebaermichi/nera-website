---
layout: pages/default.pug
title: About
slug: about
lang: en
description: What Nera is, its philosophy, and how to get involved.
keywords: about nera, static site generator philosophy
---

# About Nera

Nera is an open-source static site generator with a deliberately small surface
area. The whole pipeline — load, render, apply plugins, write — fits in a handful
of files you can read in one sitting.

## Philosophy

- **Transparent over magic.** No hidden conventions; a page renders because its
  frontmatter says so.
- **Composable over monolithic.** Features live in small `@nera-static/plugin-*`
  packages you opt into.
- **Yours to own.** Templates publish into your project so you can style and edit
  them directly.

## Get involved

Nera and its plugins are developed in the open on
[GitHub](https://github.com/seebaermichi/nera). Issues, ideas and pull requests
are welcome — see the plugin catalog on the [Plugins](/plugins/index.html) page.

## This site

This website is itself built with Nera, using `plugin-navigation`, `plugin-tags`,
`plugin-search`, `plugin-page-pagination` and `plugin-canonical-links` — plus one
small local plugin for the tutorials list.
