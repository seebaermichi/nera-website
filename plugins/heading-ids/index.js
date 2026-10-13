// Local plugin: gives every h2–h4 in a page's rendered Markdown an `id`, so a
// section can be linked (`/docs/plugins.html#the-hook-contract`). markdown-it
// renders bare `<h2>…</h2>`; a heading that already carries attributes is left
// alone. Ids are slugs of the heading text, unique per page (`-2`, `-3` on a
// repeat), and never one the layout uses itself (`main`).
//
// Kept synchronous on purpose: core awaits hooks since 4.3.0, but synchronous
// is the safe default — see "The hook contract" in pages/docs/plugins.md.

import { slugify } from '@nera-static/plugin-utils'

const LAYOUT_IDS = ['main']

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': '\'', apos: '\'' }

function headingText(html) {
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&(amp|lt|gt|quot|#39|apos);/g, (_, name) => ENTITIES[name])
}

export function addHeadingIds(content) {
    const used = new Set(LAYOUT_IDS)

    return content.replace(/<h([2-4])>([\s\S]*?)<\/h\1>/g, (match, level, inner) => {
        const base = slugify(headingText(inner))
        if (!base) return match

        let id = base
        for (let n = 2; used.has(id); n++) id = `${base}-${n}`
        used.add(id)

        return `<h${level} id="${id}">${inner}</h${level}>`
    })
}

export function getMetaData({ pagesData }) {
    if (!Array.isArray(pagesData)) return pagesData

    return pagesData.map((page) => (
        typeof page?.content === 'string'
            ? { ...page, content: addHeadingIds(page.content) }
            : page
    ))
}
