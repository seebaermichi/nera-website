import { test } from 'node:test'
import assert from 'node:assert/strict'
import { addHeadingIds, getMetaData } from './index.js'

test('h2–h4 get a slug of their text as id', () => {
    assert.equal(
        addHeadingIds('<h2>The hook contract</h2><h3>Build it</h3><h4>Notes</h4>'),
        '<h2 id="the-hook-contract">The hook contract</h2><h3 id="build-it">Build it</h3><h4 id="notes">Notes</h4>',
    )
})

test('h1, h5 and headings with attributes are left alone', () => {
    const html = '<h1>Title</h1><h5>Small</h5><h2 class="x">Styled</h2>'
    assert.equal(addHeadingIds(html), html)
})

test('the id comes from the text, without tags, entities decoded, accents folded', () => {
    assert.equal(
        addHeadingIds('<h2>Hand over a file with <code>getAssets</code></h2>'),
        '<h2 id="hand-over-a-file-with-getassets">Hand over a file with <code>getAssets</code></h2>',
    )
    assert.equal(
        addHeadingIds('<h2>Übergib &amp; prüfe</h2>'),
        '<h2 id="ubergib-prufe">Übergib &amp; prüfe</h2>',
    )
})

test('a repeated heading gets a numbered id, and the layout\'s own ids are never used', () => {
    assert.equal(
        addHeadingIds('<h2>Setup</h2><h3>Setup</h3><h2>Main</h2>'),
        '<h2 id="setup">Setup</h2><h3 id="setup-2">Setup</h3><h2 id="main-2">Main</h2>',
    )
})

test('a heading without usable text gets no id', () => {
    assert.equal(addHeadingIds('<h2>🚀</h2>'), '<h2>🚀</h2>')
})

test('escaped headings inside code blocks are not touched', () => {
    const html = '<pre><code>&lt;h2&gt;Not a heading&lt;/h2&gt;</code></pre>'
    assert.equal(addHeadingIds(html), html)
})

test('getMetaData rewrites string content and keeps everything else', () => {
    const pages = [
        { content: '<h2>A</h2>', meta: { href: '/a.html' } },
        { meta: { href: '/b.html' } },
    ]
    const result = getMetaData({ app: {}, pagesData: pages })

    assert.deepEqual(result, [
        { content: '<h2 id="a">A</h2>', meta: { href: '/a.html' } },
        { meta: { href: '/b.html' } },
    ])
    assert.equal(pages[0].content, '<h2>A</h2>')
})
