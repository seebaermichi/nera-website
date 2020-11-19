---
layout: pages/blog-post.pug
title: Create a simple plugin for Nera
description: Let me show you how to create a simple plugin to show social media icons and links on a Nera website
banner_image: /img/banner/plugin-banner.jpg
teaser_image: /img/for-developers/create-simple-plugin/simple-plugin-teaser.jpg
author: Michael Becker
tags: simple, plugin, development
homepage_slider_content: 5
homepage_teaser_content: 6
popular_post: 4
for_developers: 1
---
Nera is a light weight static site generator and I will share how to build a plugin for it here.

## Social Media Links

Recently I created a website with Nera where there was a list of icons with links to social media in the used theme. I didn't want to add all the icons and links directly in the template, but thought having a plugin for this would be create.  
So let me show you how I create it.

Since each Nera plugin should be a separate repository the general structure for it should look like follows.

![Screenshot of Nera plugins file and folder structure](/img/for-developers/create-simple-plugin/Screenshot-of-file-structure-of-a-nera-plugin.png)

As you can see there are two folders and a couple of files. The most important once are the `config/plugin-name.yaml` and the `index.js`.

The `index.js` should hold the whole functionality of the plugin and the `config/plugin-name.yaml` should include important settings so that the plugin works and can be adjusted with regards to the needs of the website which uses it.  
The other files aren't that important for the functionality of the plugin. See what's inside them in the [main-navigation plugin](https://medium.com/r/?url=https%3A%2F%2Fgithub.com%2Fseebaermichi%2Fnera-plugin-main-navigation) as an example.

* * *

As mentioned I want to create a plugin for social media links. Unfortunately, there is still no proper plugin dev environment, so I need to improvise a bit.

At first, I will install a fresh Nera project, remove all the git files, and than add a new folder into the `src/plugins` folder, which will be the starting point for my plugin.

```bash
cd /into/your/working/directory

git clone git@github.com:seebaermichi/nera.git dev-nera-plugins 

cd dev-nera-plugins

# Clean up git
rm -fr .git

# Install node dependencies
npm install

mkdir src/plugins/social-media-links
```

Within the `src/plugins/social-media-links` folder we start with the `index.js` file.

```javascript
// src/plugins/social-media-links/index.js

const { getConfig } = require('../plugin-helper')

module.exports = (() => {
    const config = getConfig(`${__dirname}/config/tags.yaml`)

    const getAppData = data => {
        // data.app manipulation goes here

        return data.app
    }

    const getMetaData = data => {
        // meta data manipulation of each relevant page goes here

        return data.pagesData
    }

    return {
        getAppData,
        getMetaData
    }
})()
```

What you see above is kind of a skeleton for the plugins `index.js` file. It might not always be necessary to have both functions `getAppData()` and `getMetaData()` in it. Depending on the functionality of the plugin one might be enough.  
The important thing is, that `data.app` or `data.pagesData` is returned.

For the social media links plugin, I want to create now, I don't need the `getMetaData()` function, so I will remove it later while adding the required functionality.

At the moment I also try to load the plugin configuration from `src/plugins/social-media-link/config/social-media-link.yaml` which isn't there. So I will add it now.

```yaml
# src/plugins/social-media-links/config/social-media-links.yaml

social_media_links:
  - name: facebook
    href: https://facebook.com
    icon: <i class="fab fa-facebook-square"></i>
  - name: twitter
    href: https://twitter.com
    icon: <i class="fab fa-twitter-square"></i>
  - name: linkedIn
    href: https://linkedin.com
    icon: <i class="fab fa-linkedin"></i>
```

Of course, I could have added a lot more or only one set of variables for the social media links. I decided to use these three as an example.

You might have recognized, that I use the Fontawesome icon markup here for each icon property. So this means I also need to provide Fontawesome somehow. Let's keep this in mind for later.

Now that I have data in the config file, I can adjust my `index.js` file and add the functionality which would allow the use of this information in a template.

```javascript
// src/plugins/social-media-links/index.js

const { getConfig } = require('../plugin-helper')

module.exports = (() => {
    const config = getConfig(`${__dirname}/config/social-media-links.yaml`)

    const getAppData = data => {
        data.app = Object.assign({}, data.app, {
            socialMediaLinks: config.social_media_links
        })

        return data.app
    }

    return {
        getAppData
    }
})()
```

As I already mentioned, I don't need the getMetaData() function for this plugin, so I removed it.  
The only thing I need to do is to add the data from the config file into the `data.app` object. Since the `getConfig()` helper "compiles" yaml data into JavaScript data, I can assign it directly to a new property `socialMediaLinks`.

Now I can use the social media links in a template.

```pug
//- src/plugins/social-media-links/views/social-media-links.pug

each link in app.socialMediaLinks
    a(href=link.href)
        | !{ link.icon }
```

The code just loops through the `app.socialMediaLinks` elements and uses it's properties to create the related links.

To get them properly shown I also provide another template to allow an easy integration of Fontawsome.

```pug
//- src/plugins/social-media-links/views/fontawesome-cdn-link.pug

link(rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css' integrity='sha512-1PKOgIY59xJ8Co8+NE6FZ+LOAZKjy+KY8iq0G4B3CyeY6wYHN3yt9PW0XpSriVlkMXe40PTKnXrLnZ9+fkDaog==' crossorigin='anonymous')
```

Don't be afraid, if this looks weird, it's just the link tag (in pug) which provides the Fontaewsome `all.min.css` file from cloudflare. You can find it at [cdnjs.com/libraries/font-awesome](https://medium.com/r/?url=https%3A%2F%2Fcdnjs.com%2Flibraries%2Ffont-awesome).  
Of course I need to include this template in the head tag of my layout or website.

![Screenshot of included fontawesome cdn link tag](/img/for-developers/create-simple-plugin/Screenshot-of-included-fontawesome-cdn-link-tag.png)

Finally, I can add the social media links template where ever I want. As an example, I decided to have them in the footer of my test website.

![Screenshot of integrated social media links template](/img/for-developers/create-simple-plugin/Screenshot-of-integrated-social-media-links-template.png)

If I now run `npm start` in one terminal window and `npm run serve` in another, I can visit [http://127.0.0.1:8080](http://127.0.0.1:8080) and see the three social media links at the bottom.

![Screenshot of three social media links at the bottom of examle page](/img/for-developers/create-simple-plugin/Screenshot-of-three-social-media-links-at-the-bottom-of-examle-page.png)

That's it.

Of course, this is a quite simple plugin, but I hope it could provide some insights in how Nera plugins work.

To complete the whole plugin I also add a `README.md` file for documentation and a `.gitignore` and a `package.json` file. The `.gitignore` is of course needed for the git repository and the `package.json` is the basis if the plugin might become a npm package later.

Here is how the files  look like.

_`README.md`_
```markdown
# Social Media Links - Nera plugin
This is a plugin for the static side generator [Nera](https://github.com/seebaermichi/nera) to create a list of social media links. It will generate links out of a given setup.
You can define within the `config/social-media-links.yaml` file which properties you want to use for each social media link (see example).  

## Usage
The first thing you need to do is to place this plugin in the `src/plugins` folder of your Nera project.  

In addition you need to define which properties each social media link should use. Define it in the `config/social-media-links.yaml`, e.g. like this:
```yaml
social_media_links:
  - name: facebook
    href: https://facebook.com
    icon: <i class="fab fa-facebook-square"></i>
  - name: twitter
    href: https://twitter.com
    icon: <i class="fab fa-twitter-square"></i>
  - name: linkedIn
    href: https://linkedin.com
    icon: <i class="fab fa-linkedin"></i>

```
Now all of these properties will be available in the `app.socialMediaLinks` property in your templates and you can loop through them however you want or include the template which is provided in `views/social-media-links.pug`.
```pug
//- views/social-media-links.pug

each link in app.socialMediaLinks
    a(href=link.href)
        | !{ link.icon }

```

In addition this plugin provides another template `views/fontawesome-cdn-link.pug` which includes the link to the `all.min.css` file of Fontawesome. You can use it to include Fontawesome icons and use them in your templates.

## Example
This is how a simple layout file could look like with the social media links templates included.
```pug
//- views/layouts/default.pug

<!DOCTYPE html>
html(lang=app.lang)
  head
    meta(charset="UTF-8")
    meta(name="viewport", content="width=device-width, initial-scale=1.0")
    meta(http-equiv="X-UA-Compatible", content="ie=edge")
    title #{ meta.title } | #{ app.name }
    meta(name="description", content=`${meta.description || app.description}`)
    meta(name="keywords", conent=`${meta.keywords || app.keywords}`)
    meta(name="generator" content=`nera - ${process.env.npm_package_version}`)
    meta(name="robots" content=`${meta.robots || app.robots}`)

    include ../../src/plugins/social-media-links/views/fontawesome-cdn-link

  body
    block content

  footer
    include ../../src/plugins/social-media-links/views/social-media-links
```

_`.gitignore`_
```text
node_modules
.vscode/
```

_`package.json`_
```json
{
    "name": "social-media-links",
    "version": "1.0.0",
    "description": "A plugin for static side generator nera to create social media links.",
    "main": "index.js",
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "keywords": [],
    "author": "“Michael <micha.becker79@gmail.com> (https://github.com/seebaermichi)",
    "license": "ISC",
    "repository": {
        "type": "git",
        "url": "https://github.com/seebaermichi/nera-plugin-social-media-links"
    }
}
```

Hope you enjoyed reading. There will be another post about a more advanced plugin, so stay tuned.
