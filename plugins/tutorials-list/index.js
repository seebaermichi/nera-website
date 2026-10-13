// Local plugin: collects every tutorial page (in any language) into
// app.tutorials, newest first. The tutorials index filters this by the current
// page's language. Each tutorial lives at <lang-prefix>/tutorials/<slug>.html,
// so we match on the directory ending in "/tutorials" and skip the index page.
//
// Kept synchronous on purpose: core awaits hooks since 4.3.0, but synchronous
// is the safe default — see "The hook contract" in pages/docs/plugins.md.

export function getAppData({ app, pagesData }) {
    if (!app || typeof app !== 'object') return app
    if (!Array.isArray(pagesData)) return app

    const tutorials = pagesData
        .filter(({ meta }) => {
            const dirname = meta?.dirname || ''
            const isTutorial = dirname === '/tutorials' || dirname.endsWith('/tutorials')
            return isTutorial && meta?.filename !== 'index.html'
        })
        .map(({ meta }) => ({
            href: meta.href,
            title: meta.title || meta.href,
            description: meta.description || '',
            createdAt: meta.createdAt,
            lang: meta.lang || app.lang,
        }))
        .sort((a, b) => {
            const da = new Date(a.createdAt).getTime()
            const db = new Date(b.createdAt).getTime()
            if (!Number.isNaN(da) && !Number.isNaN(db) && da !== db) return db - da
            return String(a.href).localeCompare(String(b.href))
        })

    return { ...app, tutorials }
}
