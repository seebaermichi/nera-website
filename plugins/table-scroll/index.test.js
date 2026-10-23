import { test } from 'node:test'
import assert from 'node:assert/strict'
import { wrapTables, getMetaData } from './index.js'

const TABLE = '<table>\n<thead>\n<tr>\n<th>Plugin</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>search</td>\n</tr>\n</tbody>\n</table>'

test('a Markdown table is wrapped in a .table-scroll box', () => {
    assert.equal(
        wrapTables(`<p>Before</p>\n${TABLE}\n<p>After</p>`),
        `<p>Before</p>\n<div class="table-scroll">${TABLE}</div>\n<p>After</p>`,
    )
})

test('every table on a page gets its own box', () => {
    assert.equal(
        wrapTables(`${TABLE}\n${TABLE}`),
        `<div class="table-scroll">${TABLE}</div>\n<div class="table-scroll">${TABLE}</div>`,
    )
})

test('a table with attributes and an escaped table in code are left alone', () => {
    const html = '<table class="x"><tr><td>1</td></tr></table><pre><code>&lt;table&gt;&lt;/table&gt;</code></pre>'
    assert.equal(wrapTables(html), html)
})

test('getMetaData rewrites string content and keeps everything else', () => {
    const pages = [
        { content: TABLE, meta: { href: '/a.html' } },
        { meta: { href: '/b.html' } },
    ]
    const result = getMetaData({ app: {}, pagesData: pages })

    assert.deepEqual(result, [
        { content: `<div class="table-scroll">${TABLE}</div>`, meta: { href: '/a.html' } },
        { meta: { href: '/b.html' } },
    ])
    assert.equal(pages[0].content, TABLE)
})
