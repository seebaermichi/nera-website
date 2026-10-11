// Local plugin: publishes the English docs and tutorials as plain Markdown for
// AI assistants (llmstxt.org). `llms-full.txt` is every English docs page, then
// every tutorial, each in `pagination_order`, with the frontmatter cut off and
// root-relative links made absolute so the text stands on its own.
//
// The bodies are read from the Markdown sources, not from `pagesData` — core
// hands plugins rendered HTML. The file is written to `.nera-cache/llms-txt/`
// and handed to core through `getAssets` (core >= 4.13.0): `public/` is deleted
// after the plugins run, so anything written there directly would be lost.
//
// Kept synchronous on purpose — see the plugin contract in CLAUDE.md.
// Spec: ../nera-cli/ROADMAP-ai.md, slice 2 (L2), English only (D3).

import fs from 'fs'
import path from 'path'
import { getConfig } from '@nera-static/plugin-utils'

const DEFAULT_ORIGIN = 'https://nera.js.org'
const LANG = 'en'
// Output order: every docs page before every tutorial.
const SECTIONS = ['/docs', '/tutorials']
// Pages in those folders that are listings, not reading material.
const UNORDERED_PAGES = ['/tutorials/index.html']
const CACHE_DIR = '.nera-cache/llms-txt'
const FULL_FILE = 'llms-full.txt'

export function getAssets({ app, pagesData }) {
    if (!Array.isArray(pagesData)) return []

    const cwd = process.cwd()
    const config = getConfig(path.resolve(cwd, 'config/llms-txt.yaml'))
    const origin = String(config.origin || DEFAULT_ORIGIN).replace(/\/+$/, '')
    const pagesDir = path.resolve(cwd, 'pages')

    const full = selectPages(pagesData, app?.lang)
        .map((meta) => renderPage(meta, pagesDir, origin))
        .join('\n\n')

    const cacheDir = path.resolve(cwd, CACHE_DIR)
    fs.mkdirSync(cacheDir, { recursive: true })
    const fullPath = path.join(cacheDir, FULL_FILE)
    fs.writeFileSync(fullPath, `${full}\n`)

    return [{ from: fullPath, to: FULL_FILE }]
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
