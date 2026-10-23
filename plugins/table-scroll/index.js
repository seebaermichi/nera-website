// Local plugin: wraps every table in a page's rendered Markdown in
// `<div class="table-scroll">`, so a wide table scrolls inside its own box
// instead of pushing the whole page sideways on a phone. markdown-it renders
// bare `<table>…</table>` and never writes the wrapper the design's CSS
// expects; a table that carries attributes (hand-written HTML) is left alone.
//
// Kept synchronous on purpose: core awaits hooks since 4.3.0, but synchronous
// is the safe default — see "The hook contract" in pages/docs/plugins.md.

export function wrapTables(content) {
    return content.replace(
        /<table>[\s\S]*?<\/table>/g,
        (table) => `<div class="table-scroll">${table}</div>`,
    )
}

export function getMetaData({ pagesData }) {
    if (!Array.isArray(pagesData)) return pagesData

    return pagesData.map((page) => (
        typeof page?.content === 'string'
            ? { ...page, content: wrapTables(page.content) }
            : page
    ))
}
