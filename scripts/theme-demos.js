// Live demos of the four blog themes under nera.js.org/themes/blog/<name>.
// Each demo is scaffolded from its published starter into a temp site, the
// overrides below turn it into a demo (base path, noindex, nera.js.org's legal
// pages, a note in the footer), and its build is copied into public/.
import fs from 'node:fs'
import path from 'node:path'
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

// config/app.yaml: serve under the demo's base path, keep every page out of
// search results, and use nera.js.org as the origin of absolute URLs.
export function demoAppYaml(source, demo) {
    const doc = parseYaml(source, 'config/app.yaml')
    doc.set('base_path', demoBasePath(demo))
    doc.set('robots', 'noindex,follow')
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

// The footer-extra seam: the starter's content (social links) stays, the
// demo note follows it at the seam's top level.
export function demoFooterExtra(source, demo) {
    const note = demoNote(demo)
    if (source.split('\n').includes(note)) {
        return source
    }
    const body = source === '' || source.endsWith('\n') ? source : `${source}\n`
    return `${body}${note}\n`
}

// Markdown links to the deleted sample legal pages (starter-blog's home
// names them) go to nera.js.org's pages instead.
export function demoLegalLinks(markdown) {
    return LEGAL_LINKS.reduce(
        (text, { sample, href }) => text.replaceAll(`](${sample})`, `](${href})`),
        markdown,
    )
}

function markdownFiles(dir) {
    return fs.readdirSync(dir, { recursive: true })
        .filter((file) => file.endsWith('.md'))
        .map((file) => path.join(dir, file))
}

function rewrite(file, transform) {
    fs.writeFileSync(file, transform(fs.readFileSync(file, 'utf8')))
}

// Applies every override to a freshly scaffolded demo site in `siteDir`.
export function applyDemoOverrides(siteDir, demo) {
    rewrite(path.join(siteDir, 'config/app.yaml'), (text) => demoAppYaml(text, demo))
    rewrite(path.join(siteDir, 'config/theme.yaml'), demoThemeYaml)

    const footerExtra = path.join(siteDir, FOOTER_EXTRA)
    const seam = fs.existsSync(footerExtra) ? fs.readFileSync(footerExtra, 'utf8') : ''
    fs.mkdirSync(path.dirname(footerExtra), { recursive: true })
    fs.writeFileSync(footerExtra, demoFooterExtra(seam, demo))

    const pagesDir = path.join(siteDir, 'pages')
    for (const page of SAMPLE_LEGAL_PAGES) {
        fs.rmSync(path.join(pagesDir, page), { force: true })
    }
    for (const file of markdownFiles(pagesDir)) {
        rewrite(file, demoLegalLinks)
    }
}
