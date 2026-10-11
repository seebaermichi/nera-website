import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { getAssets, stripFrontmatter, absolutizeLinks, markdownPath } from './index.js'

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
    const read = (file) => fs.readFileSync(assets.find(({ to }) => to === file).from, 'utf-8')
    return { assets, text: read('llms-full.txt'), index: read('llms.txt') }
}

// The parts of llms.txt between `## <name>` and the next heading.
function section(index, name) {
    const match = index.match(new RegExp(`^## ${name}\\n\\n([\\s\\S]*?)(?=\\n\\n## |\\n$)`, 'm'))
    return match ? match[1].split('\n') : null
}

const PLUGINS = [
    { name: 'Canonical links', package: '@nera-static/plugin-canonical-links', description: 'Adds <link> tags.', url: 'https://github.test/canonical' },
    { name: 'Tags', package: '@nera-static/plugin-tags', description: 'Tag pages.', url: 'https://github.test/tags' },
]

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

test('getAssets writes llms.txt, llms-full.txt and each page .md to the cache and returns them for public/', () => {
    writePage('docs/index.md', 'title: Introduction', '# Documentation\n\nHello.\n')

    const { assets } = build([meta('/docs/index.html', { title: 'Introduction', pagination_order: 1 })])

    const cache = path.join(fs.realpathSync(tmp), '.nera-cache/llms-txt')
    assert.deepEqual(assets, [
        { from: path.join(cache, 'llms.txt'), to: 'llms.txt' },
        { from: path.join(cache, 'llms-full.txt'), to: 'llms-full.txt' },
        { from: path.join(cache, 'pages/docs/index.md'), to: 'docs/index.md' },
    ])
    assert.equal(fs.existsSync(path.join(tmp, 'public')), false)
})

test('markdownPath maps a page href to its .md path relative to public/', () => {
    assert.equal(markdownPath('/docs/cli.html'), 'docs/cli.md')
    assert.equal(markdownPath('/tutorials/build-a-blog.html'), 'tutorials/build-a-blog.md')
})

test('each selected page gets its own .md, holding exactly its llms-full.txt section', () => {
    writePage('docs/index.md', 'title: Intro', '# Intro\n\nDocs one, see [CLI](/docs/cli.html).\n')
    writePage('docs/cli.md', 'title: CLI\nlayout: pages/default.pug', '# CLI\n\nDocs two.\n')
    writePage('tutorials/blog.md', 'title: Blog', 'Tutorial one.\n')

    const { assets, text } = build([
        meta('/docs/index.html', { title: 'Intro', pagination_order: 1 }),
        meta('/docs/cli.html', { title: 'CLI', pagination_order: 2 }),
        meta('/tutorials/blog.html', { title: 'Blog', pagination_order: 1 }),
        meta('/tutorials/index.html', { title: 'Tutorials' }),
        meta('/de/docs/index.html', { title: 'Einführung', lang: 'de', pagination_order: 1 }),
        meta('/es/docs/cli.html', { title: 'CLI', lang: 'es', pagination_order: 2 }),
    ])

    const pageAssets = assets.filter(({ to }) => to.endsWith('.md'))
    assert.deepEqual(pageAssets.map(({ to }) => to), ['docs/index.md', 'docs/cli.md', 'tutorials/blog.md'])
    const sections = pageAssets.map(({ from }) => fs.readFileSync(from, 'utf-8').replace(/\n$/, ''))
    assert.equal(`${sections.join('\n\n')}\n`, text)
    assert.equal(
        sections[0],
        `# Intro\n\nSource: ${ORIGIN}/docs/index.html\n\nDocs one, see [CLI](${ORIGIN}/docs/cli.html).`
    )
    assert.ok(!sections[1].includes('layout:'), sections[1])
})

test('a page removed since the last build leaves no .md in the cache', () => {
    writePage('docs/index.md', 'title: Intro', '# Intro\n')
    writePage('docs/old.md', 'title: Old', '# Old\n')
    build([
        meta('/docs/index.html', { title: 'Intro', pagination_order: 1 }),
        meta('/docs/old.html', { title: 'Old', pagination_order: 2 }),
    ])

    build([meta('/docs/index.html', { title: 'Intro', pagination_order: 1 })])

    const cache = path.join(tmp, '.nera-cache/llms-txt/pages/docs')
    assert.deepEqual(fs.readdirSync(cache), ['index.md'])
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
    const orderWarnings = warnings.filter((message) => message.includes('pagination_order'))
    assert.equal(orderWarnings.length, 2)
    assert.match(orderWarnings[0], /\/docs\/draft\.html has no pagination_order/)
    assert.match(orderWarnings[1], /\/docs\/empty\.html has no pagination_order/)
})

test('the origin falls back to nera.js.org without a config file', () => {
    fs.rmSync(path.join(tmp, 'config/llms-txt.yaml'))
    writePage('docs/index.md', 'title: Intro', '# Intro\n\nSee [CLI](/docs/cli.html).\n')

    const { text } = build([meta('/docs/index.html', { title: 'Intro', pagination_order: 1 })])

    assert.ok(text.includes('Source: https://nera.js.org/docs/index.html'), text)
    assert.ok(text.includes('[CLI](https://nera.js.org/docs/cli.html)'), text)
})

test('llms.txt opens with the configured H1 and the summary as one blockquote line', () => {
    fs.appendFileSync(path.join(tmp, 'config/llms-txt.yaml'), 'title: Example\nsummary: >\n    First line\n    and second.\n')

    const { index } = build([])

    assert.ok(index.startsWith('# Example\n\n> First line and second.\n\n## '), index)
})

test('llms.txt falls back to the default title and summary without a config file', () => {
    fs.rmSync(path.join(tmp, 'config/llms-txt.yaml'))

    const { index } = build([])

    assert.ok(index.startsWith('# Nera\n\n> Nera is a lightweight, plugin-based static site generator for Node.js.\n\n'), index)
    assert.ok(index.includes('(https://nera.js.org/llms-full.txt)'), index)
})

test('llms.txt lists Docs, Tutorials, Plugins, CLI and Optional in that order', () => {
    writePage('docs/index.md', 'title: Intro', '# Intro\n')
    writePage('docs/cli.md', 'title: CLI reference', '# CLI\n')
    writePage('tutorials/blog.md', 'title: Blog', 'Blog.\n')
    writePage('tutorials/search.md', 'title: Search', 'Search.\n')

    const { index } = build([
        meta('/tutorials/search.html', { title: 'Search', description: 'Add search.', pagination_order: 2 }),
        meta('/docs/cli.html', { title: 'CLI reference', description: 'The nera CLI.', pagination_order: 7 }),
        meta('/tutorials/blog.html', { title: 'Blog', description: 'Build a blog.', pagination_order: 1 }),
        meta('/docs/index.html', { title: 'Intro', description: 'What Nera is.', pagination_order: 1 }),
        meta('/tutorials/index.html', { title: 'Tutorials', description: 'All tutorials.' }),
        meta('/plugins/index.html', { title: 'Plugins', plugins: PLUGINS }),
    ])

    const headings = index.split('\n').filter((line) => line.startsWith('## '))
    assert.deepEqual(headings, ['## Docs', '## Tutorials', '## Plugins', '## CLI', '## Optional'])
    assert.deepEqual(section(index, 'Docs'), [
        `- [Intro](${ORIGIN}/docs/index.html): What Nera is.`,
        `- [CLI reference](${ORIGIN}/docs/cli.html): The nera CLI.`,
    ])
    assert.deepEqual(section(index, 'Tutorials'), [
        `- [Blog](${ORIGIN}/tutorials/blog.html): Build a blog.`,
        `- [Search](${ORIGIN}/tutorials/search.html): Add search.`,
    ])
    assert.deepEqual(section(index, 'Plugins'), [
        '- [@nera-static/plugin-canonical-links](https://github.test/canonical): Adds <link> tags.',
        '- [@nera-static/plugin-tags](https://github.test/tags): Tag pages.',
    ])
    assert.deepEqual(section(index, 'CLI'), [
        `- [CLI reference](${ORIGIN}/docs/cli.html): The nera CLI.`,
        '- [@nera-static/nera on npm](https://www.npmjs.com/package/@nera-static/nera): The one package a site depends on: the `nera` CLI with `new`, `build`, `dev`, `serve`, `validate`, `check` and `update`.',
    ])
    assert.deepEqual(section(index, 'Optional'), [
        `- [llms-full.txt](${ORIGIN}/llms-full.txt): Every English docs page and tutorial above as one Markdown file, in reading order.`,
    ])
    assert.deepEqual(warnings, [])
})

test('llms.txt takes the plugins and the CLI page from the English pages only', () => {
    const { index } = build([
        meta('/de/plugins/index.html', { lang: 'de', plugins: [{ package: '@nera-static/plugin-de', description: 'Deutsch.', url: 'https://github.test/de' }] }),
        meta('/plugins/index.html', { lang: 'de', plugins: [{ package: '@nera-static/plugin-mislabelled', description: 'X.', url: 'https://github.test/x' }] }),
        meta('/de/docs/cli.html', { title: 'CLI', lang: 'de', description: 'Deutsch.' }),
    ])

    assert.equal(section(index, 'Plugins'), null)
    assert.ok(!index.includes('/de/'), index)
    assert.deepEqual(section(index, 'CLI'), [
        '- [@nera-static/nera on npm](https://www.npmjs.com/package/@nera-static/nera): The one package a site depends on: the `nera` CLI with `new`, `build`, `dev`, `serve`, `validate`, `check` and `update`.',
    ])
    assert.equal(section(index, 'Docs'), null)
    assert.ok(warnings.some((message) => /no plugins list on \/plugins\/index\.html/.test(message)), warnings)
})

test('an llms.txt item without a description is listed bare, with a warning', () => {
    writePage('docs/index.md', 'title: Intro', '# Intro\n')

    const { index } = build([
        meta('/docs/index.html', { title: 'Intro', pagination_order: 1 }),
        meta('/plugins/index.html', { plugins: PLUGINS }),
    ])

    assert.deepEqual(section(index, 'Docs'), [`- [Intro](${ORIGIN}/docs/index.html)`])
    assert.deepEqual(warnings, [`⚠️ llms-txt: ${ORIGIN}/docs/index.html has no description in llms.txt`])
})
