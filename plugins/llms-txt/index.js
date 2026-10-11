// Local plugin: publishes the English docs and tutorials as plain Markdown for
// AI assistants (llmstxt.org). `llms.txt` is the index: an H1, a one-paragraph
// summary, then linked sections (Docs, Tutorials, Plugins, CLI, Optional), each
// item with a one-line description. `llms-full.txt` is every English docs page,
// then every tutorial, each in `pagination_order`, with the frontmatter cut off
// and root-relative links made absolute so the text stands on its own.
//
// Each of those pages is also published on its own, as `/<dirname>/<name>.md`
// beside its `.html` (`/docs/cli.md`), holding exactly its llms-full.txt section.
//
// The bodies are read from the Markdown sources, not from `pagesData` — core
// hands plugins rendered HTML. Every file is written to `.nera-cache/llms-txt/`
// (the per-page ones under `pages/`, so they cannot collide with the two index
// files) and handed to core through `getAssets` (core >= 4.13.0): `public/` is
// deleted after the plugins run, so anything written there directly would be lost.
//
// Kept synchronous on purpose — see the plugin contract in CLAUDE.md.
// Spec: ../nera-cli/ROADMAP-ai.md, slice 2 (L2), English only (D3).

import fs from 'fs'
import path from 'path'
import { getConfig } from '@nera-static/plugin-utils'

const DEFAULT_ORIGIN = 'https://nera.js.org'
const DEFAULT_TITLE = 'Nera'
const DEFAULT_SUMMARY = 'Nera is a lightweight, plugin-based static site generator for Node.js.'
const LANG = 'en'
// Output order: every docs page before every tutorial.
const SECTIONS = ['/docs', '/tutorials']
// Pages in those folders that are listings, not reading material.
const UNORDERED_PAGES = ['/tutorials/index.html']
const CACHE_DIR = '.nera-cache/llms-txt'
const FULL_FILE = 'llms-full.txt'
const INDEX_FILE = 'llms.txt'
// Per-page Markdown, below CACHE_DIR, mirroring the page's path in public/.
const PAGES_CACHE_DIR = 'pages'
// The English plugin catalog, whose `plugins:` frontmatter feeds `## Plugins`.
const PLUGINS_PAGE = '/plugins/index.html'
const CLI_PAGE = '/docs/cli.html'
const CLI_PACKAGE = {
    title: '@nera-static/nera on npm',
    url: 'https://www.npmjs.com/package/@nera-static/nera',
    description: 'The one package a site depends on: the `nera` CLI with `new`, `build`, `dev`, `serve`, `validate`, `check` and `update`.',
}

export function getAssets({ app, pagesData }) {
    if (!Array.isArray(pagesData)) return []

    const cwd = process.cwd()
    const config = getConfig(path.resolve(cwd, 'config/llms-txt.yaml'))
    const origin = String(config.origin || DEFAULT_ORIGIN).replace(/\/+$/, '')
    const pagesDir = path.resolve(cwd, 'pages')

    const pages = selectPages(pagesData, app?.lang)
    const pageFiles = pages.map((meta) => [markdownPath(meta.href), renderPage(meta, pagesDir, origin)])
    const full = pageFiles.map(([, text]) => text).join('\n\n')
    const index = renderIndex({
        title: config.title || DEFAULT_TITLE,
        summary: config.summary || DEFAULT_SUMMARY,
        origin,
        pages,
        pagesData,
        defaultLang: app?.lang,
    })

    const cacheDir = path.resolve(cwd, CACHE_DIR)
    // Start the per-page folder empty, so a removed page leaves no stale file behind.
    fs.rmSync(path.join(cacheDir, PAGES_CACHE_DIR), { recursive: true, force: true })
    fs.mkdirSync(cacheDir, { recursive: true })

    const files = [
        [INDEX_FILE, INDEX_FILE, index],
        [FULL_FILE, FULL_FILE, full],
        ...pageFiles.map(([to, text]) => [path.join(PAGES_CACHE_DIR, to), to, text]),
    ]
    return files.map(([cacheFile, to, text]) => {
        const from = path.join(cacheDir, cacheFile)
        fs.mkdirSync(path.dirname(from), { recursive: true })
        fs.writeFileSync(from, `${text}\n`)
        return { from, to }
    })
}

// `/docs/cli.html` → `docs/cli.md`: relative to public/, as getAssets wants it.
export function markdownPath(href) {
    return href.replace(/^\/+/, '').replace(/\.html$/, '.md')
}

/**
 * The llms.txt index. Docs and Tutorials are the pages of llms-full.txt, in the
 * same order; Plugins is the English catalog's `plugins:` list; CLI points at
 * the CLI reference and the npm package; Optional links llms-full.txt itself.
 * An empty section is left out.
 */
export function renderIndex({ title, summary, origin, pages, pagesData, defaultLang = LANG }) {
    const pageItem = (meta) => ({ title: meta.title || meta.href, url: `${origin}${meta.href}`, description: meta.description })
    const english = pagesData
        .map(({ meta }) => meta || {})
        .filter((meta) => (meta.lang || defaultLang) === LANG)
    const findPage = (href) => english.find((meta) => meta.href === href)

    const pluginsPage = findPage(PLUGINS_PAGE)
    if (!Array.isArray(pluginsPage?.plugins)) {
        console.warn(`⚠️ llms-txt: no plugins list on ${PLUGINS_PAGE}, the Plugins section is left out of ${INDEX_FILE}`)
    }
    const plugins = (pluginsPage?.plugins || []).map((plugin) => ({
        title: plugin.package || plugin.name,
        url: plugin.url,
        description: plugin.description,
    }))

    const cliPage = findPage(CLI_PAGE)
    const sections = [
        ['Docs', pages.filter((meta) => meta.dirname === '/docs').map(pageItem)],
        ['Tutorials', pages.filter((meta) => meta.dirname === '/tutorials').map(pageItem)],
        ['Plugins', plugins],
        ['CLI', [...(cliPage ? [pageItem(cliPage)] : []), CLI_PACKAGE]],
        ['Optional', [{
            title: FULL_FILE,
            url: `${origin}/${FULL_FILE}`,
            description: 'Every English docs page and tutorial above as one Markdown file, in reading order.',
        }]],
    ]

    const body = sections
        .filter(([, items]) => items.length > 0)
        .map(([name, items]) => `## ${name}\n\n${items.map(renderItem).join('\n')}`)
        .join('\n\n')

    return `# ${title}\n\n> ${oneLine(summary)}\n\n${body}`
}

// `- [Title](url): description`, without the colon part when there is none.
function renderItem({ title, url, description }) {
    if (!description) {
        console.warn(`⚠️ llms-txt: ${url} has no description in ${INDEX_FILE}`)
        return `- [${title}](${url})`
    }
    return `- [${title}](${url}): ${oneLine(description)}`
}

// A folded or multi-line YAML value would break the blockquote or the list item.
function oneLine(text) {
    return String(text).replace(/\s+/g, ' ').trim()
}

/**
 * The English pages directly inside `/docs` and `/tutorials`, docs first, each
 * section by `pagination_order`. A page there without `pagination_order` has
 * no place in the reading order: it is left out with a warning, except for the
 * listing pages in UNORDERED_PAGES.
 */
export function selectPages(pagesData, defaultLang = LANG) {
    const pages = pagesData
        .map(({ meta }) => meta || {})
        .filter((meta) => SECTIONS.includes(meta.dirname))
        .filter((meta) => (meta.lang || defaultLang) === LANG)
        .filter((meta) => {
            if (hasOrder(meta.pagination_order)) return true
            if (!UNORDERED_PAGES.includes(meta.href)) {
                console.warn(`⚠️ llms-txt: ${meta.href} has no pagination_order, left out of ${FULL_FILE}`)
            }
            return false
        })

    return pages.sort((a, b) =>
        SECTIONS.indexOf(a.dirname) - SECTIONS.indexOf(b.dirname)
        || Number(a.pagination_order) - Number(b.pagination_order))
}

// An empty YAML key (`pagination_order:`) is null, and Number(null) is 0.
function hasOrder(value) {
    return value !== null && value !== '' && Number.isFinite(Number(value))
}

/**
 * One page as a Markdown section: its own leading H1 (or `# <title>` when the
 * body has none), a `Source:` line with the page's URL, then the body.
 */
export function renderPage(meta, pagesDir, origin) {
    const sourceFile = path.join(pagesDir, meta.href.replace(/\.html$/, '.md'))
    const body = absolutizeLinks(stripFrontmatter(fs.readFileSync(sourceFile, 'utf-8')), origin).trim()

    const [firstLine, ...rest] = body.split('\n')
    const hasHeading = /^# /.test(firstLine)
    const heading = hasHeading ? firstLine : `# ${meta.title || meta.href}`
    const content = hasHeading ? rest.join('\n').trim() : body

    return `${heading}\n\nSource: ${origin}${meta.href}\n\n${content}`
}

/**
 * Cuts the leading `---` … `---` frontmatter block. Only a block that opens on
 * the very first line counts, and it ends at the first `---` line after it, so
 * a horizontal rule or a YAML code block further down the body stays intact.
 * A source without frontmatter, or with an unclosed block, is returned as is.
 */
export function stripFrontmatter(source) {
    const lines = source.split(/\r?\n/)
    if (lines[0] !== '---') return source

    const end = lines.indexOf('---', 1)
    if (end === -1) return source

    return lines.slice(end + 1).join('\n')
}

/**
 * Makes root-relative Markdown link targets (`](/path)`) absolute against the
 * site origin. Protocol-relative targets (`](//host)`) are left alone.
 */
export function absolutizeLinks(markdown, origin) {
    return markdown.replace(/\]\(\/(?!\/)/g, `](${origin}/`)
}
