---
layout: pages/blog-post.pug
title: Improve an existing Nera plugin
description: Let me show you how to improve an existing plugin for Nera
banner_image: /img/banner/plugin-banner.jpg
teaser_image: /img/for-developers/improve-existing-plugin/improve-plugin-teaser.jpg
author: Michael Becker
tags: advanced, plugin, development, improve
for_developers: 3
homepage_teaser_content: 7
for_developers: 3
---
Nera is a light weight static site generator and I will share how to build a plugin for it here.

## Improve popular content plugin for Nera

The [Nera plugin "popular content"](https://github.com/seebaermichi/nera-plugin-popular-content) can be used for different puposes, like deciding which content should be shown in a simple list or maybe in a content slider on your homepage or just teasers with content from different pages.

In the current version it requires a configuration where you define which property in the meta section it should recognize, which other properties of the page meta section it should include in the popular content data and in which order you would like to show the popular content.
A `config/popular-content.yaml` could look like this.

```yaml
// src/plugins/popular-content/config/popular-content.yaml

collection:
  - meta_property_name: is_home_teaser
    display_meta_properties:
      - title
      - description
      - createdAt
      - href
    order: desc

  - meta_property_name: is_popular
    display_meta_properties:
      - title
      - createdAt
      - href
```

It is probably already quite obvious, that the plugin would require a lot of configuration. If I have a couple of different properties I would like to cover, I would always need to define, which meta properties it should collect.

I want to improve this plugin in a way, where it always collects all available meta data of each page of interest. This way I can be sure, that I can use what ever meta data the page has and don’t need to add it in the config file of the plugin.

* * *

I will start with a new config file and start improving the plugins `index.js` afterwards.

```yaml
// src/plugins/popular-content/config/popular-config.yaml

properties:
  - meta_property_name: is_popular
    order: desc
  - meta_property_name: is_home_teaser
```

Now I only define the properties (was collections before) I would like to cover and if the order should be ascending (which is the default if nothing is set) or descending.

The current `index.js` file of the plugin looks like follows.

```javascript
// src/plugins/popular-content/index.js

const { getConfig } = require('../plugin-helper')

module.exports = (() => {
  const getProperties = (meta, properties) => {
    const propertiesObject = {}

    properties.forEach(property => {
      if (meta[property]) {
        propertiesObject[property] = meta[property]
      }
    })

    return propertiesObject
  }

  const getPopularContent = pagesData => {
    const config = getConfig(`${__dirname}/config/popular-content.yaml`)
    const popularContent = {}

    config.collection.forEach(({ meta_property_name, display_meta_properties, order }) => {
      pagesData.forEach(({ meta }) => {
        if (meta[meta_property_name]) {
          const properties = [meta_property_name, ...display_meta_properties]

          if (!popularContent[meta_property_name]) {
            popularContent[meta_property_name] = []
          }

          popularContent[meta_property_name].push(getProperties(meta, properties))

          popularContent[meta_property_name].sort((a, b) => {
            if (order && order === 'desc') {
              return b[meta_property_name] - a[meta_property_name]
            }
            return a[meta_property_name] - b[meta_property_name]
          })
        }
      })
    })

    return popularContent
  }

  const getAppData = data => {
    if (data.app !== null && typeof data.app === 'object') {
      return Object.assign({}, data.app, {
        popularContent: getPopularContent(data.pagesData)
      })
    }

    return data.app
  }

  return {
    getAppData
  }
})()
```

At first I completely remove the `getProperties()` function, because I want to collect all meta data from now on.  
This also means that the `getPopularContent()` function can be reduced to the following.

```javascript
// src/plugins/popular-content/index.js

...

const getPopularContent = pagesData => {
  const popularContent = {}

  config.properties.forEach(({ meta_property_name, order }) => {
    popularContent[meta_property_name] = []

    pagesData.forEach(({ meta }) => {
      if (meta[meta_property_name]) {
        popularContent[meta_property_name].push(meta)
      }
    })
    
    popularContent[meta_property_name].sort((a, b) => {
      if (order && order === 'desc') {
        return b[meta_property_name] - a[meta_property_name]
      }
      return a[meta_property_name] - b[meta_property_name]
    })
  })

  return popularContent
}

...
```

So I removed everything related to the configured properties of interest and just create an array for each “popular content property” defined in the config. If the page has the property I’m looking for, I add the whole meta data to the array and sort it ascending or descending, depending on the configuration.

That’s basically it. The new whole `index.js` looks like this now.

```javascript
// src/plugins/popular-content/index.js

const { getConfig } = require('../plugin-helper')

module.exports = (() => {
  const config = getConfig(`${__dirname}/config/popular-content.yaml`)
  
  const getPopularContent = pagesData => {
    const popularContent = {}

    config.properties.forEach(({ meta_property_name, order }) => {
      popularContent[meta_property_name] = []

      pagesData.forEach(({ meta }) => {
        if (meta[meta_property_name]) {
          popularContent[meta_property_name].push(meta)
        }
      })

      popularContent[meta_property_name].sort((a, b) => {
        if (order && order === 'desc') {
          return b[meta_property_name] - a[meta_property_name]
        }
        return a[meta_property_name] - b[meta_property_name]
      })
    })

    return popularContent
  }

  const getAppData = data => {
    if (data.app !== null && typeof data.app === 'object') {
      return Object.assign({}, data.app, {
        popularContent: getPopularContent(data.pagesData)
      })
    }

    return data.app
  }

  return {
    getAppData
  }
})()
```

Since I removed the `fromNow()` function, I also need to adjust the `src/plugins/popular-content/views/popular-content.pug` file. I just use the `toLocalString()` method on the `createdAt` property of the page instead.

```pug
//- src/plugins/popular-content/views/popular-content.pug

if (app.popularContent.is_popular.length > 0)
  ul
    each item in app.popularContent.is_popular
      li
        span #{ item.title } -&nbsp;
        span #{ item.createdAt.toLocaleString(app.lang) }
```

Of course I also removed the package moment from the plugin and adjusted the `README.md` file with the description of how to use the plugin.  
You can find the [updated version of this plugin](https://github.com/seebaermichi/nera-plugin-popular-content) on github right now.
