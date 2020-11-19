const fs = require('fs')

const { getConfig } = require('../plugin-helper')

module.exports = (() => {
    const config = getConfig(`${__dirname}/config/tags.yaml`)
    const metaPropertyName = config.meta_property_name || 'tags'
    const tagOverviewPath = config.tag_overview_path || '/tags'
    const tagOverviewLayout = config.tag_overview_layout || 'pages/default.pug'
    const tagSeparator = config.tag_separator || ','

    const getTagHref = (path, tag) => `${path}/${tag.toLowerCase()}.html`

    const getTagLinks = tags => {
        if (!tags) return []

        return tags.split(tagSeparator).map(tag => ({
            name: tag.trim(),
            href: getTagHref(tagOverviewPath, tag.trim())
        }))
    }

    const getTagCloud = (pagesData, app) => {
        const tagCloud = app.tagCloud ? [...app.tagCloud] : []

        pagesData.filter(({ meta }) => meta[metaPropertyName])
            .forEach(({ meta }) => {
                meta[metaPropertyName].split(tagSeparator)
                    .map(tag => tag.trim())
                    .forEach(tag => {
                        if (!tagCloud.map(tag => tag.name).includes(tag)) {
                            tagCloud.push({
                                name: tag,
                                href: getTagHref(tagOverviewPath, tag)
                            })
                        }
                    })
            })

        return tagCloud.sort((a, b) => a.name > b.name)
    }

    const getTagAmount = pagesData => {
        let tagAmount = []

        pagesData.filter(({ meta }) => meta[metaPropertyName])
            .forEach(({ meta }) => {
                meta[metaPropertyName].split(tagSeparator)
                    .map(tag => tag.trim())
                    .forEach(tag => {
                        if (!tagAmount.map(tag => tag.name).includes(tag)) {
                            tagAmount.push({
                                name: tag.trim(),
                                href: getTagHref(tagOverviewPath, tag.trim()),
                                amount: 1
                            })
                        } else {
                            tagAmount = tagAmount.map(({ name, href, amount }) => {
                                if (name === tag) {
                                    return {
                                        name,
                                        href,
                                        amount: amount + 1
                                    }
                                }

                                return { name, href, amount }
                            })
                        }
                    })
            })

        return tagAmount.sort((a, b) => b.amount - a.amount)
    }

    const getTaggedPages = (pagesData, tag) => {
        return pagesData.filter(({ meta }) => meta[metaPropertyName]
            && meta[metaPropertyName].includes(tag))
            .sort((a, b) => new Date(b.meta.createdAt) - new Date(a.meta.createdAt))
    }

    const getAppData = data => {
        if (data.app !== null && typeof data.app === 'object') {
            return Object.assign({}, data.app, {
                tagCloud: getTagCloud(data.pagesData, data.app),
                tagAmount: getTagAmount(data.pagesData),
                tagsConfig: config
            })
        }

        return data.app
    }

    const getMetaData = data => {
        if (data.pagesData !== null && typeof data.pagesData === 'object') {

            // Generate tag overview pages
            const tagCloud = getTagCloud(data.pagesData, data.app)
            tagCloud.forEach(tag => {
                data.pagesData.push({
                    content: '',
                    meta: {
                        layout: tagOverviewLayout,
                        title: tag.name,
                        createdAt: new Date(),
                        htmlPathName: getTagHref(tagOverviewPath, tag.name),
                        href: getTagHref(tagOverviewPath, tag.name),
                        pagePathName: tagOverviewPath.replace('/', ''),
                        dirname: tagOverviewPath.replace('/', ''),
                        tag: tag.name,
                        taggedPages: getTaggedPages(data.pagesData, tag.name),
                    }
                })
            })

            data.pagesData = data.pagesData.map(({ content, meta }) => ({
                content,
                meta: Object.assign({}, meta, {
                    tagLinks: getTagLinks(meta[metaPropertyName])
                })
            }))
        }

        return data.pagesData
    }

    return {
        getAppData,
        getMetaData
    }
})()
