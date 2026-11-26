// Live demos of the four blog themes under nera.js.org/themes/blog/<name>.
// Each demo is scaffolded from its published starter into a temp site, the
// overrides below turn it into a demo (base path, noindex, nera.js.org's legal
// pages, a note in the footer), and its build is copied into public/.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseDocument } from 'yaml'

export const NERA_ORIGIN = 'https://nera.js.org'

// The demos, by the folder they are served from.
export const DEMOS = Object.freeze({
    plain: { name: 'plain', starter: '@nera-static/starter-blog', theme: 'Plain' },
    stack: { name: 'stack', starter: '@nera-static/starter-stack', theme: 'Stack' },
    ansitz: { name: 'ansitz', starter: '@nera-static/starter-ansitz', theme: 'Ansitz' },
    umwege: { name: 'umwege', starter: '@nera-static/starter-umwege', theme: 'Umwege' },
})

// nera.js.org's own legal pages, which every demo links instead of the
// starter's sample ones. The labels are the starters' translation keys.
export const LEGAL_LINKS = Object.freeze([
    { label: 'Imprint', href: `${NERA_ORIGIN}/legal-notice.html`, sample: '/imprint.html' },
    { label: 'Privacy', href: `${NERA_ORIGIN}/privacy.html`, sample: '/privacy.html' },
])

// The starter's sample legal pages: their placeholder address must not be
// reachable under nera.js.org.
const SAMPLE_LEGAL_PAGES = ['imprint.md', 'privacy.md']

const FOOTER_EXTRA = 'theme/views/partials/footer-extra.pug'
const HEAD_EXTRA = 'theme/views/partials/head-extra.pug'

// Every demo page stays out of search results. It goes through the
// head-extra seam, not `app.robots`: plugin-feed treats a site-wide noindex
// as "no page is a feed entry" and writes no feed.xml, which the themes link.
export const DEMO_ROBOTS = 'meta(name=\'robots\' content=\'noindex,follow\')'

// The starters' YAML style: 4-space indent, long lines left as they are.
const YAML_OUTPUT = Object.freeze({ indent: 4, lineWidth: 0 })

function parseYaml(source, file) {
    const doc = parseDocument(source)
    if (doc.errors.length) {
        throw new Error(`${file}: ${doc.errors[0].message}`)
    }
    return doc
}

export function demoBasePath(demo) {
    return `/themes/blog/${demo.name}`
}

// config/app.yaml: serve under the demo's base path and use nera.js.org as
// the origin of absolute URLs. The starter's `robots: index,follow` goes, so
// the themes render no robots meta of their own beside the seam's noindex.
export function demoAppYaml(source, demo) {
    const doc = parseYaml(source, 'config/app.yaml')
    doc.set('base_path', demoBasePath(demo))
    doc.delete('robots')
    doc.set('origin', NERA_ORIGIN)
    return doc.toString(YAML_OUTPUT)
}

// config/theme.yaml: the footer's legal links point at nera.js.org.
export function demoThemeYaml(source) {
    const doc = parseYaml(source, 'config/theme.yaml')
    doc.set('footer_links', doc.createNode(
        LEGAL_LINKS.map(({ label, href }) => ({ label, href })),
    ))
    return doc.toString(YAML_OUTPUT)
}

export function demoNote(demo) {
    return `p A demo of the ${demo.theme} theme for #[a(href='${NERA_ORIGIN}') Nera].`
}

// Appends `line` at a seam's top level once; the seam's content stays.
function appendToSeam(source, line) {
    if (source.split('\n').includes(line)) {
        return source
    }
    const body = source === '' || source.endsWith('\n') ? source : `${source}\n`
    return `${body}${line}\n`
}

// The footer-extra seam: the starter's content (social links) stays, the
// demo note follows it.
export function demoFooterExtra(source, demo) {
    return appendToSeam(source, demoNote(demo))
}

// The head-extra seam: the starter's content (canonical link, JSON-LD)
// stays, the noindex meta follows it.
export function demoHeadExtra(source) {
    return appendToSeam(source, DEMO_ROBOTS)
}

// Markdown links to the deleted sample legal pages (starter-blog's home
// names them) go to nera.js.org's pages instead.
export function demoLegalLinks(markdown) {
    return LEGAL_LINKS.reduce(
        (text, { sample, href }) => text.replaceAll(`](${sample})`, `](${href})`),
        markdown,
    )
}

// starter-blog's home calls its legal pages placeholders; in the demo they
// are nera.js.org's real ones, so that clause goes and the advice stays.
const PLACEHOLDER_CLAUSE = /the \[imprint\]\([^)]*\) and the\s+\[privacy policy\]\([^)]*\) are placeholders\.\s+Replace them/g

export function demoLegalAdvice(markdown) {
    return markdown.replace(PLACEHOLDER_CLAUSE, 'replace them')
}

function markdownFiles(dir) {
    return fs.readdirSync(dir, { recursive: true })
        .filter((file) => file.endsWith('.md'))
        .map((file) => path.join(dir, file))
}

function rewrite(file, transform) {
    fs.writeFileSync(file, transform(fs.readFileSync(file, 'utf8')))
}

// Like rewrite, for a seam the starter may not override (then it starts empty).
function rewriteSeam(file, transform) {
    const source = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, transform(source))
}

// Applies every override to a freshly scaffolded demo site in `siteDir`.
export function applyDemoOverrides(siteDir, demo) {
    rewrite(path.join(siteDir, 'config/app.yaml'), (text) => demoAppYaml(text, demo))
    rewrite(path.join(siteDir, 'config/theme.yaml'), demoThemeYaml)

    rewriteSeam(path.join(siteDir, FOOTER_EXTRA), (text) => demoFooterExtra(text, demo))
    rewriteSeam(path.join(siteDir, HEAD_EXTRA), demoHeadExtra)

    const pagesDir = path.join(siteDir, 'pages')
    for (const page of SAMPLE_LEGAL_PAGES) {
        fs.rmSync(path.join(pagesDir, page), { force: true })
    }
    for (const file of markdownFiles(pagesDir)) {
        rewrite(file, (text) => demoLegalAdvice(demoLegalLinks(text)))
    }
}

// The website's root, where `npm run build:demos` runs.
const WEBSITE = path.resolve(import.meta.dirname, '..')

// Temp sites and their image caches (git- and eslint-ignored). `sites/` is
// rebuilt on every run, `cache/` survives it (and is what CI caches).
export const DEMO_ROOT = path.join(WEBSITE, '.theme-demos')
const SITES = path.join(DEMO_ROOT, 'sites')
const CACHE = path.join(DEMO_ROOT, 'cache')

// Files a demo's build writes that it must not ship: a robots.txt below the
// domain root is ignored, and the sitemap would list only noindex pages.
export const DROPPED_FILES = Object.freeze(['sitemap.xml', 'robots.txt'])

// Where a demo's build lands in the website's own output.
export function demoOutputDir(publicDir, demo) {
    return path.join(publicDir, ...demoBasePath(demo).split('/').filter(Boolean))
}

function run(command, args, cwd) {
    const result = spawnSync(command, args, { cwd, stdio: 'inherit' })
    if (result.error) {
        throw result.error
    }
    if (result.status !== 0) {
        throw new Error(`${path.basename(command)} ${args.join(' ')} failed in ${cwd} (exit ${result.status})`)
    }
}

// A fresh site dir would refuse `nera new`; a missing cache is a cold build.
function moveIfPresent(from, to) {
    if (!fs.existsSync(from)) {
        return
    }
    fs.rmSync(to, { recursive: true, force: true })
    fs.mkdirSync(path.dirname(to), { recursive: true })
    fs.renameSync(from, to)
}

// Scaffolds, overrides and builds one demo, then copies its output into the
// website's public/. Returns the seconds it took.
export function buildDemo(demo, { publicDir = path.join(WEBSITE, 'public') } = {}) {
    const started = performance.now()
    const site = path.join(SITES, demo.name)
    const siteCache = path.join(site, '.nera-cache')
    const savedCache = path.join(CACHE, demo.name)

    fs.rmSync(site, { recursive: true, force: true })
    fs.mkdirSync(SITES, { recursive: true })
    run(path.join(WEBSITE, 'node_modules/.bin/nera'),
        ['new', demo.name, '--starter', demo.starter, '--yes'], SITES)

    applyDemoOverrides(site, demo)
    moveIfPresent(savedCache, siteCache)
    try {
        run(path.join(site, 'node_modules/.bin/nera'), ['build'], site)
    } finally {
        moveIfPresent(siteCache, savedCache)
    }

    for (const file of DROPPED_FILES) {
        fs.rmSync(path.join(site, 'public', file), { force: true })
    }
    const output = demoOutputDir(publicDir, demo)
    fs.rmSync(output, { recursive: true, force: true })
    fs.cpSync(path.join(site, 'public'), output, { recursive: true })
    return (performance.now() - started) / 1000
}

// Runs after the website's own build, which deletes public/.
export function main() {
    const publicDir = path.join(WEBSITE, 'public')
    if (!fs.existsSync(path.join(publicDir, 'index.html'))) {
        throw new Error('public/index.html is missing: run `npm run build` before `npm run build:demos`.')
    }
    const times = []
    for (const demo of Object.values(DEMOS)) {
        const seconds = buildDemo(demo, { publicDir })
        times.push(`${demo.name} ${seconds.toFixed(1)} s`)
        console.log(`✓ Demo ${demo.name} built into public${demoBasePath(demo)}/ in ${seconds.toFixed(1)} s`)
    }
    console.log(`Theme demos: ${times.join(', ')}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main()
}
