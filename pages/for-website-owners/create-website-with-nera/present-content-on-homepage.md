---
layout: pages/blog-post.pug
title: Present content on the homepage
description: Let's add content to the homepage now.
banner_image: /img/banner/blog-banner.jpg
teaser_image: /img/for-website-owners/create-website-with-nera/present-content-on-homepage/Screenshot-of-for-website-owners-overview-page.png
tags: content, website, pages, posts
author: Michael Becker
homepage_teaser_content: 4
popular_post: 2
for_website_owners: 5
---
Nera is a light weight static site generator and I will share how to build the website about it here.

## Show content on the homepage

In the last post of this series [“Create Content Pages”](/for-website-owners/create-website-with-nera/create-content-pages.html) I wrote about how to create content and how to use content of the meta section of the Markdown file on a page template.

Since my last post I have created a couple of different content pages and although content is key, I need a way to present my content to the users of my website. Adding a sitemap with links to all content pages can’t be the solution. So I will use a Nera plugin to create collections of content and use these collections to present teasers of my content pages on the homepage.

* * *

Let’s start! The [Opium theme](https://colorlib.com/wp/template/opium/) I use from [colorlib](https://colorlib.com) uses a slider and large and small teasers on the homepage. These elements use an image the title and a few more data of the related blog post to tease the content and link to it. If I want to replace all the placeholder content of the themes homepage, I would need to have two collections of data. One collection for the slider at the top and one collection for the teasers in the main section of the page.

Luckily there is already a Nera plugin which will help me to achieve what I want. It’s called [“popular content”](https://github.com/seebaermichi/nera-plugin-popular-content) and collects meta data of content pages which have a given meta property.

I will “install” this plugin, by just cloning it into the `src/plugins` folder, will remove the git related files and add some configuration.

```bash
cd /into/nera-website

git clone git@github.com:seebaermichi/nera-plugin-popular-content.git src/plugins/popular-content

# Clean up git
rm -fr src/plugins/popular-content/.git
```

_Unfortunately there is still no better way to install plugins, but I also will work on a proper solution and would be happy about any support._

In the `src/plugins/popular-content/config/popular-content.yaml` I start with the following configuration.

```yaml
// src/plugins/popular-content/config/popular-content.yaml

properties:
  - meta_property_name: homepage_slider_content
    order: desc
  - meta_property_name: homepage_teaser_content
    order: desc
```

Now I need to add the relevant property to my content pages meta section.

![Screenshot of content page with homepage_slider_content property](/img/for-website-owners/create-website-with-nera/present-content-on-homepage/Screenshot-of-content-page-with-homepage-slider-1-content-property.png)

![Screenshot of content page with homepage_slider_content property](/img/for-website-owners/create-website-with-nera/present-content-on-homepage/Screenshot-of-content-page-with-homepage-slider-2-content-property.png)

As an example I added the `homepage_slider_content` property to these two and two other pages.

The `README.md` of the plugin describes how to use the popular content in a template. There is now a new `app.popularContent.homepage_slider_content` property which I can iterate over.

```pug
//- views/partials/home-banner.pug

section.home_banner_area
    .container
        .row
            .col-lg-5
            .col-lg-7
                .blog_text_slider.owl-carousel
                    if app.popularContent.homepage_slider_content.length > 0
                        each item in app.popularContent.homepage_slider_content
                            .item
                                .blog_text
                                    .cat
                                        //- a.cat_btn(href='#') Gadgets
                                        span
                                            i.fa.fa-calendar(aria-hidden='true')
                                            |  #{ item.createdAt.toLocaleString(app.lang)}

                                    a(href=item.href)
                                        h4 #{ item.title }
                                    p
                                        | #{ item.description }
                                    a.blog_btn(href=item.href) Read More
```

In the `views/partials/home-banner.pug` I iterate over each item in the `app.popularContent.homepage_slider_content` array and render an item for the slider. Within the loop I can use all the meta data of each page.

As usual I start compiling the pages with `npm start` and run `npm run serve` in another terminal, to see my local website at [http://127.0.0.1:8080](http://127.0.0.1:8080).

![Screenshot of homepage with slider and new banner image](/img/for-website-owners/create-website-with-nera/present-content-on-homepage/Screenshot-of-homepage-with-slider-and-new-banner-image.png)

The slider on the homepage now includes four slides with data of the related pages. In addition I also changed the title of the Nera website and replaced the old `assets/img/banner/home-banner.jpg` with a new one.

* * *

Now I want to fill the teaser section below the slider with real content. In general I will do just the same as for the content of the slider. I will add a new property `homepage_teaser_content` to each content page I would like to be shown in a teaser on the homepage.

![Screenshot of content page with homepage_teaser_content property](/img/for-website-owners/create-website-with-nera/present-content-on-homepage/Screenshot-of-content-page-with-homepage-teaser-content-1-property.png)

![Screenshot of content page with homepage_teaser_content property](/img/for-website-owners/create-website-with-nera/present-content-on-homepage/Screenshot-of-content-page-with-homepage-teaser-content-3-property.png)

As for the slider I also need to adjust the homepage template so that it iterates through the `app.popularContent.homepage_teaser_content` array and renders a teaser for each page.

```pug
//- views/pages/home.pug

extends ../layouts/home

include ../mixins/teaser

block content
    section.blog_area.p_120
        .container
            .row
                .col-lg-8
                    if app.popularContent.homepage_teaser_content.length > 0
                        .blog_left_sidebar
                            .row
                                each item, index in app.popularContent.homepage_teaser_content
                                    if index == 0 || index == 3
                                        article.blog_style1
                                            +homepageTeaser(item)
                                    else
                                        .col-md-6
                                            article.blog_style1.small
                                                +homepageTeaser(item)

                include ../partials/homepage-sidebar
```

Since the homepage uses the wider teaser two times, I need to check the `index` within the loop and show the wider teaser when `index` is 0 or 3. As the markup for the teaser itself is always the same I created a mixin for it.

```pug
//- views/mixins/teaser.pug

mixin homepageTeaser(item)
    .blog_img
        img.img-fluid(src=item.teaser_image alt='')
    .blog_text
        .blog_text_inner
            .cat
                //- a.cat_btn(href='#') Gadgets
                span
                    i.fa.fa-calendar(aria-hidden='true')
                    |  #{ item.createdAt.toLocaleString(app.lang) }

            a(href=item.href)
                h4 #{ item.title }
            p
                | #{ item.description }
            a.blog_btn(href=item.href) Read More
```

If I now check my homepage, I will see the teasers as expected.

![Screenshot of the current homepage of Nera website](/img/for-website-owners/create-website-with-nera/present-content-on-homepage/Screenshot-of-the-current-homepage-of-Nera-website.png)

That's it for the homepage slider and teasers. 

* * *

There is another element on the homepage which I would like to fill with real content. In the sidebar is a section called "Popular posts". I will just add another meta property `popular_post` to the `src/plugins/popular-content/config/popular-config.yaml` and to the content pages and adjust the template accordingly.

```yaml
// src/plugins/popular-content/config/popular-content.yaml

properties:
  - meta_property_name: homepage_slider_content
    order: desc
  - meta_property_name: homepage_teaser_content
    order: desc
  - meta_property_name: popular_content
```

![Screenshot of content page with popular_post property](/img/for-website-owners/create-website-with-nera/present-content-on-homepage/Screenshot-of-content-page-with-popular-post-1-property.png)

![Screenshot of content page with popular_post property](/img/for-website-owners/create-website-with-nera/present-content-on-homepage/Screenshot-of-content-page-with-popular-post-3-property.png)

```pug
//- views/partials/sidebar-popular-posts.pug

if app.popularContent.popular_content.length > 0
    aside.single_sidebar_widget.popular_post_widget
        h3.widget_title Popular Posts
        each item in app.popularContent.popular_content
            .media.post_item
                img(src=item.teaser_image alt='post')
                .media-body
                    a(href=item.href)
                        h3 #{ item.title }
                    p #{ item.createdAt.toLocaleString(app.lang) }
        .br
```

The "Popular Posts" section in the sidebar on the homepage is now showing all the content I "marked" as popular post content.

![Screenshot of "Popular Posts" section in the sidebar of the homepage](/img/for-website-owners/create-website-with-nera/present-content-on-homepage/Screenshot-of-Popular-Posts-section-in-the-sidebar-of-the-homepage.png)

Although there are still some elements with placeholder content, I'm very happy with the result so far. Most of the content of the homepage is now real content and is linked to blog posts of the Nera website.

In the [next part](/for-website-owners/create-website-with-nera/present-content-on-overview-pages.html) of this series I will continue with the process and add content to the different overview pages of the Nera website.
