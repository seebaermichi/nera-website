import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { getAssets, stripFrontmatter, absolutizeLinks } from './index.js'

const ORIGIN = 'https://example.test'

let tmp
let previousCwd
let warnings
let originalWarn

function writePage(file, frontmatter, body) {
    const target = path.join(tmp, 'pages', file)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, `---\n${frontmatter}\n---\n${body}`)
}

function meta(href, extra = {}) {
    return {
        meta: {
            href,
            dirname: path.posix.dirname(href),
            filename: path.posix.basename(href),
            lang: 'en',
            ...extra,
        },
    }
}

function build(pagesData) {
    const assets = getAssets({ app: { lang: 'en' }, pagesData })
    return { assets, text: fs.readFileSync(assets[0].from, 'utf-8') }
}

beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'llms-txt-'))
    previousCwd = process.cwd()
    process.chdir(tmp)
    fs.mkdirSync(path.join(tmp, 'config'))
    fs.writeFileSync(path.join(tmp, 'config/llms-txt.yaml'), `origin: ${ORIGIN}/\n`)

    warnings = []
    originalWarn = console.warn
    console.warn = (message) => warnings.push(message)
})

afterEach(() => {
    console.warn = originalWarn
    process.chdir(previousCwd)
    fs.rmSync(tmp, { recursive: true, force: true })
})

test('stripFrontmatter cuts only the leading block, not a later --- line', () => {
    const source = '---\ntitle: A\n---\nIntro\n\n---\n\n```yaml\n---\nkey: value\n---\n```\n'
    assert.equal(stripFrontmatter(source), 'Intro\n\n---\n\n```yaml\n---\nkey: value\n---\n```\n')
})

test('stripFrontmatter handles CRLF sources', () => {
    assert.equal(stripFrontmatter('---\r\ntitle: A\r\n---\r\nBody\r\n'), 'Body\n')
})

test('stripFrontmatter leaves a source without (closed) frontmatter untouched', () => {
    assert.equal(stripFrontmatter('Body\n---\nmore\n'), 'Body\n---\nmore\n')
    assert.equal(stripFrontmatter('---\ntitle: A\nno end\n'), '---\ntitle: A\nno end\n')
})

test('absolutizeLinks rewrites root-relative targets only', () => {
    const input = '[a](/docs/x.html) [b](https://other.test/y) [c](//cdn.test/z) [d](rel.html)'
    assert.equal(
        absolutizeLinks(input, ORIGIN),
        `[a](${ORIGIN}/docs/x.html) [b](https://other.test/y) [c](//cdn.test/z) [d](rel.html)`
    )
})

test('getAssets writes llms-full.txt to the cache and returns it for public/', () => {
    writePage('docs/index.md', 'title: Introduction', '# Documentation\n\nHello.\n')

    const { assets } = build([meta('/docs/index.html', { title: 'Introduction', pagination_order: 1 })])

    assert.deepEqual(assets, [{ from: path.join(fs.realpathSync(tmp), '.nera-cache/llms-txt/llms-full.txt'), to: 'llms-full.txt' }])
    assert.equal(fs.existsSync(path.join(tmp, 'public')), false)
})

test('llms-full.txt orders docs then tutorials, each by pagination_order', () => {
    writePage('docs/index.md', 'title: Intro', '# Intro\n\nDocs one.\n')
    writePage('docs/cli.md', 'title: CLI', '# CLI\n\nDocs two.\n')
    writePage('tutorials/blog.md', 'title: Blog', 'Tutorial one.\n')
    writePage('tutorials/search.md', 'title: Search', 'Tutorial two.\n')

    const { text } = build([
        meta('/tutorials/search.html', { title: 'Search', pagination_order: 2 }),
        meta('/docs/cli.html', { title: 'CLI', pagination_order: 10 }),
        meta('/tutorials/blog.html', { title: 'Blog', pagination_order: 1 }),
        meta('/docs/index.html', { title: 'Intro', pagination_order: 2 }),
    ])

    const order = ['Docs one.', 'Docs two.', 'Tutorial one.', 'Tutorial two.'].map((s) => text.indexOf(s))
    assert.ok(order.every((pos) => pos !== -1), text)
    assert.deepEqual([...order].sort((a, b) => a - b), order)
    assert.ok(text.startsWith('# Intro\n\nSource: https://example.test/docs/index.html\n\nDocs one.'), text)
})

test('a page without its own H1 gets its title as heading', () => {
    writePage('tutorials/blog.md', 'title: Build a blog', 'Body with a [link](/docs/index.html).\n')

    const { text } = build([meta('/tutorials/blog.html', { title: 'Build a blog', pagination_order: 1 })])

    assert.equal(
        text,
        `# Build a blog\n\nSource: ${ORIGIN}/tutorials/blog.html\n\nBody with a [link](${ORIGIN}/docs/index.html).\n`
    )
})

test('frontmatter never reaches llms-full.txt, a body --- does', () => {
    writePage('docs/index.md', 'title: Intro\nsecret_key: frontmatter-only', '# Intro\n\n```yaml\n---\nlayout: x\n---\n```\n')

    const { text } = build([meta('/docs/index.html', { title: 'Intro', pagination_order: 1 })])

    assert.ok(!text.includes('frontmatter-only'), text)
    assert.ok(text.includes('```yaml\n---\nlayout: x\n---\n```'), text)
})

test('only English pages directly in /docs and /tutorials are included', () => {
    writePage('docs/index.md', 'title: Intro', '# Intro\n\nEnglish.\n')

    const { text } = build([
        meta('/docs/index.html', { title: 'Intro', pagination_order: 1 }),
        meta('/de/docs/index.html', { title: 'Einführung', lang: 'de', pagination_order: 1 }),
        meta('/es/tutorials/blog.html', { title: 'Blog', lang: 'es', pagination_order: 1 }),
        meta('/docs/index.html', { title: 'Mislabelled', lang: 'de', pagination_order: 2 }),
        meta('/about.html', { title: 'About', pagination_order: 1 }),
    ])

    assert.equal(text, `# Intro\n\nSource: ${ORIGIN}/docs/index.html\n\nEnglish.\n`)
})

test('a page without pagination_order is left out with a warning, the tutorials index silently', () => {
    writePage('docs/index.md', 'title: Intro', '# Intro\n\nIn.\n')

    const { text } = build([
        meta('/docs/index.html', { title: 'Intro', pagination_order: 1 }),
        meta('/docs/draft.html', { title: 'Draft' }),
        meta('/docs/empty.html', { title: 'Empty', pagination_order: null }),
        meta('/tutorials/index.html', { title: 'Tutorials' }),
    ])

    assert.ok(!text.includes('Draft'), text)
    assert.equal(warnings.length, 2)
    assert.match(warnings[0], /\/docs\/draft\.html has no pagination_order/)
    assert.match(warnings[1], /\/docs\/empty\.html has no pagination_order/)
})

test('the origin falls back to nera.js.org without a config file', () => {
    fs.rmSync(path.join(tmp, 'config/llms-txt.yaml'))
    writePage('docs/index.md', 'title: Intro', '# Intro\n\nSee [CLI](/docs/cli.html).\n')

    const { text } = build([meta('/docs/index.html', { title: 'Intro', pagination_order: 1 })])

    assert.ok(text.includes('Source: https://nera.js.org/docs/index.html'), text)
    assert.ok(text.includes('[CLI](https://nera.js.org/docs/cli.html)'), text)
})
