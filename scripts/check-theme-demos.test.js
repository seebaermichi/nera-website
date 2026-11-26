import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DEMOS } from './theme-demos.js'
import { checkDemoCss, checkDemoPage, internalPath, pageUrls, servedFile } from './check-theme-demos.js'

const SERVED = new Set([
    '/themes/blog/stack/index.html',
    '/themes/blog/stack/about.html',
    '/themes/blog/stack/feed.xml',
    '/themes/blog/stack/search-index.json',
    '/themes/blog/stack/css/main.css',
    '/themes/blog/stack/img/a-400.webp',
    '/themes/blog/stack/img/a-800.webp',
    '/themes/blog/stack/fonts/inter.woff2',
])
const exists = (publicPath) => SERVED.has(publicPath)

const FOOTER = `<footer>
<a href="https://nera.js.org/legal-notice.html">Imprint</a>
<a href="https://nera.js.org/privacy.html">Privacy</a>
<p>A demo of the Stack theme for <a href="https://nera.js.org">Nera</a>.</p>
</footer>`

const GOOD = `<!doctype html><html lang="en"><head>
<meta name="robots" content="noindex,follow">
<link rel="stylesheet" href="/themes/blog/stack/css/main.css">
<link rel="alternate" type="application/rss+xml" href="/themes/blog/stack/feed.xml">
<link rel="canonical" href="https://nera.js.org/themes/blog/stack/about.html">
<meta property="og:url" content="https://nera.js.org/themes/blog/stack/">
<style>@font-face { src: url('/themes/blog/stack/fonts/inter.woff2') }</style>
</head><body>
<a href="/themes/blog/stack/">Home</a>
<a href="/themes/blog/stack/about.html#team">About</a>
<a href="https://github.com/seebaermichi">GitHub</a>
<a href="#top">Top</a>
<div data-search-index="/themes/blog/stack/search-index.json"></div>
<img src="/themes/blog/stack/img/a-800.webp" srcset="/themes/blog/stack/img/a-400.webp 400w, /themes/blog/stack/img/a-800.webp 800w">
${FOOTER}
</body></html>`

const BAD = `<!doctype html><html lang="en"><head>
<meta name="robots" content="index,follow">
<link rel="stylesheet" href="/css/main.css">
<link rel="alternate" href="/themes/blog/stack/feed.rss">
<link rel="canonical" href="https://nera.js.org/about.html">
</head><body>
<div style="background: url(/images/hero.jpg)" data-search-index="/search-index.json"></div>
<img srcset="/themes/blog/stack/img/a-400.webp 400w, /img/a-800.webp 800w">
<a href="https://nera.js.org/imprint.html">Imprint</a>
</body></html>`

test('a good demo page has no problems', () => {
    assert.deepEqual(checkDemoPage(GOOD, DEMOS.stack, exists), [])
})

test('a bad demo page reports every problem, links outside <a href> included', () => {
    assert.deepEqual(checkDemoPage(BAD, DEMOS.stack, exists), [
        'robots meta without noindex',
        'no Nera note in the footer',
        'no link to https://nera.js.org/legal-notice.html',
        'no link to https://nera.js.org/privacy.html',
        '/css/main.css is outside /themes/blog/stack/',
        '/themes/blog/stack/feed.rss resolves to no file',
        'https://nera.js.org/about.html is outside /themes/blog/stack/',
        '/search-index.json is outside /themes/blog/stack/',
        '/img/a-800.webp is outside /themes/blog/stack/',
        'https://nera.js.org/imprint.html is outside /themes/blog/stack/',
        '/images/hero.jpg is outside /themes/blog/stack/',
    ])
})

test('exactly one robots meta: none and two are both problems', () => {
    const none = GOOD.replace('<meta name="robots" content="noindex,follow">', '')
    const two = GOOD.replace('</head>', '<meta name="robots" content="index,follow"></head>')
    assert.deepEqual(checkDemoPage(none, DEMOS.stack, exists), ['0 robots metas, expected exactly one'])
    assert.deepEqual(checkDemoPage(two, DEMOS.stack, exists), ['2 robots metas, expected exactly one'])
})

test('a stylesheet\'s root-absolute url()s are checked, relative ones are not', () => {
    const css = `@font-face { src: url("/themes/blog/stack/fonts/inter.woff2") }
.a { background: url(../img/x.png) } .b { background: url('/fonts/x.woff2') }`
    assert.deepEqual(checkDemoCss(css, DEMOS.stack, exists), ['/fonts/x.woff2 is outside /themes/blog/stack/'])
})

test('srcset candidates and entities are read as URLs', () => {
    assert.deepEqual(pageUrls('<img srcset="/a.webp 1x, /b.webp 2x" src="/c?x=1&amp;y=2">'), ['/a.webp', '/b.webp', '/c?x=1&y=2'])
})

test('internal paths and the files they are served from', () => {
    assert.equal(internalPath('https://nera.js.org'), null)
    assert.equal(internalPath('https://nera.js.org/privacy.html'), null)
    assert.equal(internalPath('//cdn.example.com/x.js'), null)
    assert.equal(internalPath('https://nera.js.org/themes/blog/x/'), '/themes/blog/x/')
    assert.equal(servedFile('/themes/blog/x/'), '/themes/blog/x/index.html')
    assert.equal(servedFile('/themes/blog/x/about?a=1#b'), '/themes/blog/x/about.html')
    assert.equal(servedFile('/themes/blog/x/feed.xml'), '/themes/blog/x/feed.xml')
})
