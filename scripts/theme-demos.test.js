import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parse } from 'yaml'
import {
    DEMOS,
    applyDemoOverrides,
    demoAppYaml,
    demoFooterExtra,
    demoLegalLinks,
    demoNote,
    demoThemeYaml,
} from './theme-demos.js'

// Real files of @nera-static/starter-blog 1.4.0 (legal pages as stubs).
const FIXTURE = path.join(import.meta.dirname, 'fixtures/starter-blog')
const fixture = (file) => fs.readFileSync(path.join(FIXTURE, file), 'utf8')

const without = (object, ...keys) =>
    Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)))

const LEGAL_LINKS = [
    { label: 'Imprint', href: 'https://nera.js.org/legal-notice.html' },
    { label: 'Privacy', href: 'https://nera.js.org/privacy.html' },
]

test('every demo names its starter and its theme', () => {
    assert.deepEqual(Object.keys(DEMOS), ['plain', 'stack', 'ansitz', 'umwege'])
    for (const [name, demo] of Object.entries(DEMOS)) {
        assert.equal(demo.name, name)
        assert.match(demo.starter, /^@nera-static\/starter-[a-z]+$/)
        assert.ok(demo.theme)
    }
})

test('app.yaml gets the base path, noindex and nera.js.org, every other key stays', () => {
    const source = fixture('config/app.yaml')
    const result = demoAppYaml(source, DEMOS.stack)
    const before = parse(source)
    const after = parse(result)

    assert.equal(after.base_path, '/themes/blog/stack')
    assert.equal(after.robots, 'noindex,follow')
    assert.equal(after.origin, 'https://nera.js.org')
    assert.deepEqual(
        without(after, 'base_path', 'robots', 'origin'),
        without(before, 'robots', 'origin'),
    )
})

test('app.yaml: robots and origin are replaced in place, never added twice', () => {
    const result = demoAppYaml(fixture('config/app.yaml'), DEMOS.plain)
    assert.equal(result.match(/^robots:/gm).length, 1)
    assert.equal(result.match(/^origin:/gm).length, 1)
    assert.equal(result.match(/^base_path:/gm).length, 1)
    assert.doesNotMatch(result, /example\.com|^robots: index,follow$/m)
    assert.equal(demoAppYaml(result, DEMOS.plain), result)
})

test('app.yaml keeps its comments and its 4-space indent', () => {
    const result = demoAppYaml(fixture('config/app.yaml'), DEMOS.plain)
    assert.match(result, /^# Replace with your site's real address before you deploy/m)
    assert.match(result, /^ {8}# footer_links labels \(config\/theme\.yaml\)$/m)
    assert.match(result, /^ {4}en:$/m)
})

test('a YAML error is reported, not written back', () => {
    assert.throws(() => demoAppYaml('lang: [en', DEMOS.plain), /config\/app\.yaml/)
})

test('theme.yaml: footer_links point at nera.js.org, every other key and comment stays', () => {
    const source = fixture('config/theme.yaml')
    const result = demoThemeYaml(source)
    assert.deepEqual(parse(result).footer_links, LEGAL_LINKS)
    assert.deepEqual(without(parse(result), 'footer_links'), without(parse(source), 'footer_links'))
    assert.equal(result.match(/^footer_links:/gm).length, 1)
    assert.match(result, /^# Labels the legal checks of `nera check` recognise/m)
    assert.match(result, /^ {4}# The tag whose newest four posts the home page lists$/m)
})

test('the demo note is appended at the seam\'s top level, after the social links', () => {
    const source = fixture('theme/views/partials/footer-extra.pug')
    const result = demoFooterExtra(source, DEMOS.ansitz)
    const lines = result.trimEnd().split('\n')

    assert.ok(result.startsWith(source))
    assert.equal(lines.at(-2), 'include /vendor/plugin-social-media-links/social-media-links')
    assert.equal(lines.at(-1), 'p A demo of the Ansitz theme for #[a(href=\'https://nera.js.org\') Nera].')
    assert.equal(demoNote(DEMOS.ansitz), lines.at(-1))
    assert.ok(result.endsWith('\n'))
})

test('the demo note is added once, also to a seam without a final newline or content', () => {
    const note = demoNote(DEMOS.umwege)
    const once = demoFooterExtra('include x', DEMOS.umwege)
    assert.equal(once, `include x\n${note}\n`)
    assert.equal(demoFooterExtra(once, DEMOS.umwege), once)
    assert.equal(demoFooterExtra('', DEMOS.umwege), `${note}\n`)
})

test('links to the sample legal pages go to nera.js.org\'s pages', () => {
    const result = demoLegalLinks(fixture('pages/index.md'))
    assert.match(result, /\[imprint\]\(https:\/\/nera\.js\.org\/legal-notice\.html\)/)
    assert.match(result, /\[privacy policy\]\(https:\/\/nera\.js\.org\/privacy\.html\)/)
    assert.doesNotMatch(result, /\]\(\/(imprint|privacy)\.html\)/)
    assert.match(result, /\[about\]\(\/about\.html\)/)
})

test('applyDemoOverrides rewrites the configs and the seam, and deletes the sample legal pages', (t) => {
    const site = fs.mkdtempSync(path.join(os.tmpdir(), 'theme-demo-'))
    t.after(() => fs.rmSync(site, { recursive: true, force: true }))
    fs.cpSync(FIXTURE, site, { recursive: true })

    applyDemoOverrides(site, DEMOS.plain)

    const read = (file) => fs.readFileSync(path.join(site, file), 'utf8')
    assert.equal(parse(read('config/app.yaml')).base_path, '/themes/blog/plain')
    assert.deepEqual(parse(read('config/theme.yaml')).footer_links, LEGAL_LINKS)
    assert.ok(read('theme/views/partials/footer-extra.pug').endsWith(`${demoNote(DEMOS.plain)}\n`))
    assert.equal(fs.existsSync(path.join(site, 'pages/imprint.md')), false)
    assert.equal(fs.existsSync(path.join(site, 'pages/privacy.md')), false)
    assert.doesNotMatch(read('pages/index.md'), /\]\(\/(imprint|privacy)\.html\)/)
})

test('applyDemoOverrides creates the seam when the starter has none', (t) => {
    const site = fs.mkdtempSync(path.join(os.tmpdir(), 'theme-demo-'))
    t.after(() => fs.rmSync(site, { recursive: true, force: true }))
    fs.cpSync(path.join(FIXTURE, 'config'), path.join(site, 'config'), { recursive: true })
    fs.mkdirSync(path.join(site, 'pages'))

    applyDemoOverrides(site, DEMOS.stack)

    const seam = fs.readFileSync(path.join(site, 'theme/views/partials/footer-extra.pug'), 'utf8')
    assert.equal(seam, `${demoNote(DEMOS.stack)}\n`)
})
