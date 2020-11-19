---
layout: pages/blog-post.pug
title: Adding the main navigation
description: In this post I will show you how to implement the main navigation with Neras main navigation plugin
banner_image: /img/banner/blog-banner.jpg
teaser_image: /img/for-website-owners/create-website-with-nera/adding-the-main-navigation/Screenshot-of-finished-main-navigation-integration-and-first-pages-of-the-Nera-website.png
tags: website, navigation
author: Michael Becker
homepage_teaser_content: 1
popular_post: 3
for_website_owners: 3
---
Nera is a light weight static site generator and I will share how to build the website about it here.

In the first post of this series [“Installation and integration of a website theme”](/for-website-owners/create-website-with-nera/installation-and-integration-of-website-theme.html) I explained how to install Nera and how to get started with a website theme from [colorlib](https://colorlib.com/).  
In this post I will show you how to implement the main navigation with [Neras main navigation plugin](https://github.com/seebaermichi/nera-plugin-main-navigation).  

* * *

Since Nera is still in a very early state, there is unfortunately not a convenient installation process yet. Neither for Nera itself nor for any of its plugins. Although I have worked on a command line interface tool to install Nera from the command line in the past, there is nothing ready yet _(if you would like to help me with it, feel free to have a look at the current state in the [Nera CLI repo](https://github.com/seebaermichi/nera-cli))_.

So to use the plugin I need to clone the repo of Neras main navigation plugin right into the `src/plugins` folder and remove all the related git files afterwards.

```bash
# In nera-website/src/plugins
git clone git@github.com:seebaermichi/nera-plugin-main-navigation.git main-navigation

cd main-navigation

rm -fr .git
```

Now this is what I get with the plugin.

![Screenshot of Neras main navigation plugin file structure in VS Code](/img/for-website-owners/create-website-with-nera/adding-the-main-navigation/Screenshot-of-Neras-main-navigation-plugin-file-structure-in-VS-Code.png)

So there is a config file, a view file with some view helpers and the `index.js` file which includes all the required functionality. You will see the purpose of some of these files, while I integrate the main navigation.

In Nera it is not required to register plugins some how. During the compile process Nera will automatically use all the plugins and their `index.js` files from the `src/plugins` directory.

* * *

Let’s start now with the integration of the main navigation by checking the elements of it in the `src/plugins/main-navigation/config/main-navigation.yaml` file.  
The plugin already comes with some example settings.

![Screenshot of example settings of Neras main navigation plugin](/img/for-website-owners/create-website-with-nera/adding-the-main-navigation/Screenshot-of-example-settings-of-Neras-main-navigation-plugin.png)

As you can see, there are three variables which are used to add a class name to the active navigation link of the current page, a class name for the navigation link within the path of the current page and all the elements of the main navigation.

I’m still not 100% sure about the content of the Nera website, but I think the elements of the main navigation could be like follows.

```pug
//- src/plugins/main-navigation/config/main-navigation.yaml
active_class: "active"
active_path_class: "active-path"
elements:
  - href: /index.html
    name: Home
  - href: /about-nera.html
    name: About Nera
  - href: /news.html
    name: News
  - href: /for-website-owners.html
    name: For Website Owners
  - href: /for-developers.html
    name: For Developers
```

Since the theme Opium uses the `active` class name to show which page is currently visited in the main navigation, I don’t need to change the value of 'active_class' here.
I also don’t use the `active_path_class` for now, so I keep it as it is.

* * *

To actually see something of the main navigation config on the Nera website, I need to add the pug template to where I want to have my main navigation. In my case I just need to replace all the static markup from the Opium theme with an include of the main navigation template.

So my `views/partials/header.pug` file will now change a bit. I remove everything related to the main navigation.

![Screenshot of code which will be replaced](/img/for-website-owners/create-website-with-nera/adding-the-main-navigation/Screenshot-of-code-which-will-be-replaced.png)

And just add include `../../src/plugins/main-navigation/views/main-navigation.pug`.

![Screenshot of header template file with include of main navigation template](/img/for-website-owners/create-website-with-nera/adding-the-main-navigation/Screenshot-of-header-template-file-with-include-of-main-navigation-template.png)

The main navigation template comes with some pre-defined mixins, which would you allow to quickly choose a markup structure for your main navigation.  
Since I need to have the markup of the Opium theme, I don’t need these pre-defined mixins and remove everything inside the `src/plugins/main-navigation/views/main-navigation.pug` file.

![Screenshot of default content of the main navigation template file](/img/for-website-owners/create-website-with-nera/adding-the-main-navigation/Screenshot-of-default-content-of-the-main-navigation-template-file.png)

And I add, the markup which is required from the Opium theme with some adjustments.

```pug
//- src/plugins/main-navigation/views/main-navigation.pug
ul.nav.navbar-nav.menu_nav
    include ./helper/setup
        li(class=`nav-item ${activeClass}`)
            a.nav-link(href=item.href) #{ item.name }
```

As you can see, I added more or less the same markup from what I removed before from the `views/partials/header.pug` file and adjusted it in a way so that it uses the data from the main navigation config and becomes dynamic.

_If you like, you can have a look into the setup helper, but I won’t go into details about it here, since the focus is on how to create a website and not necessarily how everything works under the hood._

If I now start the compile process by running `npm start` in the root directory of the Nera website project and also start the dev server with `npm run serve` in another terminal window, open [http://127.0.0.1:8080](http://127.0.0.1:8080) in my browser, I already see the new content of the main navigation.

![Screenshot of new content of main navigation](/img/for-website-owners/create-website-with-nera/adding-the-main-navigation/Screenshot-of-new-content-of-main-navigation.png)

Of course I get a 404 error when I try to go to one of the new pages, since they are not created so far.

* * *

I create four additional Markdown files with really basic content for now.

![Screenshot of additional Markdown files for additional pages](/img/for-website-owners/create-website-with-nera/adding-the-main-navigation/Screenshot-of-additional-Markdown-files-for-additional-pages.png)

At the moment the four new Markdown files have no content, but only include two meta data elements. One reference the pages layout and one for the title.

As you can see, I use a different layout template now. To get these new pages also shown in the nice Opium theme, I need to adjust the `views/pages/default.pug`, since the current content of the file doesn’t include the right markup.

![Screenshot of default content of Neras default page template](/img/for-website-owners/create-website-with-nera/adding-the-main-navigation/Screenshot-of-default-content-of-Neras-default-page-template.png)

I decided to use the “element” page layout for the new pages as a beginning. I might change this in the future, but for now it’s a good start.

![Screenshot of opiums element page](/img/for-website-owners/create-website-with-nera/adding-the-main-navigation/Screenshot-of-default-content-of-Neras-default-page-template.png)

So to achieve this I do similar steps as I did in the [first part of this series](https://medium.com/@micha.becker79/building-nera-website-with-nera-4b50ed5dbff2), where I integrated Opiums home page in my Nera website. So I transformed HTML into pug with [HTML2Jade](https://html2jade.org/), created a new default banner partial and finally ended up with this content in the `views/pages/default.pug` file.

```pug
//- views/pages/default.pug
extends ../layouts/app

block page-content
    include ../partials/default-banner

    section.sample-text-area
        .container
            h3.text-heading.title_color #{ meta.title }
```

The `views/partials/default-banner.pug` looks like this.

```pug
//- views/partials/default-banner.pug
section.banner_area
    .container
        .row.banner_inner
            .col-lg-5
            .col-lg-7
                .banner_content.text-center
                    h2 #{ meta.title }
                    .page_link
                        a(href='/') Home
                        a(href='#') #{ meta.title }
```

As you can see, I already replace static content with some dynamic content, so that the page shows its title in some places.  
This is how it looks for the “About Nera” page now.

![Screenshot of finished main navigation integration and first pages of the Nera website](/img/for-website-owners/create-website-with-nera/adding-the-main-navigation/Screenshot-of-finished-main-navigation-integration-and-first-pages-of-the-Nera-website.png)

_Since Nera delivers static HTML to the browser, I sometimes don’t see content changes and need to reload the page while clearing the cache in the browser._

That’s it for the main navigation. Everything works quite well and I already see some “real” content on the new Nera website.  
In the [next post](/for-website-owners/create-website-with-nera/create-content-pages.html) I will start creating some real content pages and link them to the home page.
