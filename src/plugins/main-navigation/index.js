const path = require('path')

const { getConfig } = require('../plugin-helper')

module.exports = (() => {
  const getMainNav = () => {
    const mainNavConfig = getConfig(`${__dirname}/config/main-navigation.yaml`)

    mainNavConfig.activeClass = mainNavConfig.active_class
    mainNavConfig.activePathClass = mainNavConfig.active_path_class
    mainNavConfig.elements = mainNavConfig.elements
      .map(element => Object.assign({}, element, { path: path.dirname(element.href) }))

    return mainNavConfig
  }

  const getAppData = data => {
    if (data.app !== null && typeof data.app === 'object') {
      return Object.assign({}, data.app, {
        mainNav: getMainNav()
      })
    }

    return data.app
  }

  return {
    getAppData
  }
})()
