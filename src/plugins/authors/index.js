const fs = require('fs')

const meta = require('markdown-it-meta')
const md = require('markdown-it')({ html: true }).use(meta)

const { getConfig } = require('../plugin-helper')

module.exports = (() => {
  const getAuthorsData = (path, name) => {
    if (path && name) {
      const fileName = name.replace(' ', '-').toLowerCase()
      const relativePath = `../../../pages/${path}/${fileName}.md`

      if (fs.existsSync(`${__dirname}/${relativePath}`)) {
        const content = md.render(fs.readFileSync(`${__dirname}/${relativePath}`, 'utf-8'))
        const meta = md.meta

        return Object.assign({}, meta, { content })
      }
    }

    return false
  }

  const getMetaData = data => {
    if (data.pagesData !== null && typeof data.pagesData === 'object') {
      const config = getConfig(`${__dirname}/config/authors.yaml`)

      data.pagesData = data.pagesData.map(({ content, meta }) => ({
        content,
        meta: Object.assign({}, meta, {
          authorData: getAuthorsData(config.authors_path, meta.author)
        })
      }))
    }

    return data.pagesData
  }

  return {
    getMetaData
  }
})()
