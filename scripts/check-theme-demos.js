// Checks the built theme demos in public/themes/blog/<name>/: every page has
// exactly one robots meta, with noindex, carries the Nera note and
// nera.js.org's legal links, and every site-internal URL stays under the
// demo's base path and points at a file that exists. Run after
// `npm run build:demos`.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { DEMOS, LEGAL_LINKS, NERA_ORIGIN, demoBasePath, demoOutputDir } from './theme-demos.js'

// Attributes whose value is one URL. `content` only counts when it holds a
// nera.js.org URL (og:url, og:image); its other values are plain text.
const URL_ATTRIBUTES = ['href', 'src', 'data-search-index', 'content', 'poster', 'action']
const ATTRIBUTE = /\s([a-z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi
const CSS_URL = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]+))\s*\)/gi
const ROBOTS = /<meta\s[^>]*name=["']robots["'][^>]*>/gi

const decode = (value) => value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', '\'')

// Every URL a page or stylesheet references: attributes, each `srcset`
// candidate, and `url()` in inline styles and <style> blocks.
export function pageUrls(html) {
    const urls = []
    for (const [, name, double, single] of html.matchAll(ATTRIBUTE)) {
        const value = decode(double ?? single)
        const attribute = name.toLowerCase()
        if (URL_ATTRIBUTES.includes(attribute)) {
            urls.push(value.trim())
        } else if (attribute === 'srcset') {
            urls.push(...value.split(',').map((candidate) => candidate.trim().split(/\s+/)[0]))
        }
    }
    return [...urls, ...cssUrls(html)].filter(Boolean)
}

export function cssUrls(css) {
    return [...css.matchAll(CSS_URL)].map(([, double, single, bare]) => (double ?? single ?? bare).trim())
}

// The site-internal path of a URL, or null for one that leaves the demo
// on purpose (another host, a fragment, nera.js.org's home and legal pages).
export function internalPath(url) {
    const allowed = [NERA_ORIGIN, `${NERA_ORIGIN}/`, ...LEGAL_LINKS.map(({ href }) => href)]
    if (allowed.includes(url)) {
        return null
    }
    if (url.startsWith(`${NERA_ORIGIN}/`)) {
        return url.slice(NERA_ORIGIN.length)
    }
    if (url.startsWith('/') && !url.startsWith('//')) {
        return url
    }
    return null
}

// The file under public/ a site path is served from.
export function servedFile(urlPath) {
    const clean = decodeURIComponent(urlPath.split(/[?#]/)[0])
    if (clean.endsWith('/')) {
        return `${clean}index.html`
    }
    return path.posix.extname(clean) ? clean : `${clean}.html`
}

function urlProblems(urls, demo, exists) {
    const base = `${demoBasePath(demo)}/`
    const problems = []
    for (const url of urls) {
        const urlPath = internalPath(url)
        if (urlPath === null) {
            continue
        }
        if (!urlPath.startsWith(base) && urlPath !== demoBasePath(demo)) {
            problems.push(`${url} is outside ${base}`)
        } else if (!exists(servedFile(urlPath === demoBasePath(demo) ? base : urlPath))) {
            problems.push(`${url} resolves to no file`)
        }
    }
    return problems
}

// Problems of one demo page. `exists(publicPath)` says whether a file is
// served at that path (e.g. `/themes/blog/stack/index.html`).
export function checkDemoPage(html, demo, exists) {
    const problems = []
    const robots = html.match(ROBOTS) ?? []
    if (robots.length !== 1) {
        problems.push(`${robots.length} robots metas, expected exactly one`)
    } else if (!/content=["'][^"']*noindex/i.test(robots[0])) {
        problems.push('robots meta without noindex')
    }
    const note = `A demo of the ${demo.theme} theme for <a href="${NERA_ORIGIN}">Nera</a>`
    if (!html.includes(note)) {
        problems.push('no Nera note in the footer')
    }
    for (const { href } of LEGAL_LINKS) {
        if (!html.includes(`href="${href}"`)) {
            problems.push(`no link to ${href}`)
        }
    }
    return [...problems, ...urlProblems(pageUrls(html), demo, exists)]
}

// Problems of one demo stylesheet: its root-absolute `url()`s (fonts,
// backgrounds). Relative ones resolve beside the file and stay in the demo.
export function checkDemoCss(css, demo, exists) {
    return urlProblems(cssUrls(css), demo, exists)
}

function filesUnder(dir) {
    return fs.readdirSync(dir, { recursive: true })
        .map((file) => path.join(dir, file))
        .filter((file) => fs.statSync(file).isFile())
}

// Checks every demo under `publicDir`; returns `file: problem` lines.
export function checkDemos(publicDir) {
    const exists = (publicPath) => fs.existsSync(path.join(publicDir, publicPath))
    const problems = []
    for (const demo of Object.values(DEMOS)) {
        const dir = demoOutputDir(publicDir, demo)
        if (!fs.existsSync(path.join(dir, 'index.html'))) {
            problems.push(`${path.relative(publicDir, dir)}: demo not built`)
            continue
        }
        for (const file of filesUnder(dir)) {
            const check = { '.html': checkDemoPage, '.css': checkDemoCss }[path.extname(file)]
            if (!check) {
                continue
            }
            const name = path.relative(publicDir, file)
            for (const problem of check(fs.readFileSync(file, 'utf8'), demo, exists)) {
                problems.push(`${name}: ${problem}`)
            }
        }
    }
    return problems
}

export function main() {
    const publicDir = path.resolve(import.meta.dirname, '../public')
    const problems = checkDemos(publicDir)
    if (problems.length) {
        console.error(problems.join('\n'))
        console.error(`✗ Theme demos: ${problems.length} problem(s)`)
        process.exitCode = 1
        return
    }
    console.log(`✓ Theme demos: ${Object.keys(DEMOS).join(', ')} pass`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main()
}
