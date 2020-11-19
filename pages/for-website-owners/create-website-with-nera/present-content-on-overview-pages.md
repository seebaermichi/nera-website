---
layout: pages/blog-post.pug
title: Present content on overview pages
description: Let's add content to the overpages like "For Website Owners" now.
banner_image: /img/banner/blog-banner.jpg
teaser_image: /img/for-website-owners/create-website-with-nera/present-content-on-overview-pages/Screenshot-of-For-Website-Owners-overview-page.png
tags: content, website, pages, posts
author: Michael Becker
for_website_owners: 6
---
Nera is a light weight static site generator and I will share how to build the website about it here.

## Add content to overview pages

In my last post of this series [“Show content on the homepage”](/for-website-owners/create-website-with-nera/present-content-on-homepage.html) I have described how to add content to the slider and teasers of the homepage with the [Nera plugin “popular content”](https://github.com/seebaermichi/nera-plugin-popular-content). In this post I will use the same plugin to add content to the different overview pages, like “For Website Owners” or “News”.

Since I already have a couple of posts which are related to and live below “For Website Owners”, I will start with adding content to this page. As described in the `README.md` of the [Nera popular content plugin](https://github.com/seebaermichi/nera-plugin-popular-content) I add the property of interest to the config first.

```yaml
# src/plugins/popular-content/config/popular-content.yaml
properties:
    ...
    - meta_property_name: for_website_owners
      order: desc
```

Now that Nera plugin knows for which property it should look, I add it to all the pages which should appear on the “For Website Owners” overview page.

![Screenshot of page with for_website_owners property](/img/for-website-owners/create-website-with-nera/present-content-on-overview-pages/Screenshot-of-page-with-for-website-owners-1-property.png)

![Screenshot of page with for_website_owners property](/img/for-website-owners/create-website-with-nera/present-content-on-overview-pages/Screenshot-of-page-with-for-website-owners-6-property.png)

For the "For Website Owners" overview page, I will create a new page template, so it's easier to define which content should be shown.

```pug
//- views/pages/for-website-owners.pug

extends ../layouts/posts-overview.pug

include ../mixins/teaser

block posts
    if app.popularContent.for_website_owners
        +teasers(app.popularContent.for_website_owners)
```

To keep the page template as small as possible and allow to reuse the code for other overview pages, I created a new layout and another mixin.

```pug
//- views/layouts/posts-overview.pug

extends ../layouts/app

block page-content
    include ../partials/default-banner

    section.blog_area.p_120
        .container
            .row
                .col-lg-8
                    .blog_left_sidebar
                        .row
                            block posts

                include ../partials/sidebar
```

In the already existing `views/mixins/teaser.pug` file I renamed the `homeTeaser` mixin to `teaser`, because it can be used for all teasers and I added another mixin `teasers` which includes the loop through the different items of a given array of pages of interest.

```pug
//- views/mixins/teaser.pug

mixin teaser(item)
    ...

mixin teasers(items)
    each item, index in items
        if index == 0
            article.blog_style1
                +teaser(item)
        else
            .col-md-6
                article.blog_style1.small
                    +teaser(item)
```

Of course I also updated the `pages/for-website-owners/index.md` to use the new page template.

![Screenshot of For Website Owners page with new page template](/img/for-website-owners/create-website-with-nera/present-content-on-overview-pages/Screenshot-of-For-Website-Owners-page-with-new-page-template.png)

Now that everything is in place, I can start the compiling process with `npm start` and run `npm run serve` to serve my local Nera website. If I call [http://127.0.0.1:8080](http://127.0.0.1:8080) in the browser and click on “For Website Owners” in the main navigation, I should see the new content on this overview page.

![Screenshot of For Website Owners overview page](/img/for-website-owners/create-website-with-nera/present-content-on-overview-pages/Screenshot-of-For-Website-Owners-page.png)

So now every page which might be interesting for website owners is shown and linked here.

For the pages "News" and "For Developers" I do exactly the same, just with another property in the meta section of the pages.

* * *

I used the "popular content" plugin of Nera now quite a lot for many different use cases, but there is another really useful plugin, the ["tags" plugin](https://github.com/seebaermichi/nera-plugin-tags).  
Since the Nera website consists of many posts and tagging posts is a quite usual thing, this website needs to be able to handle tags.

The ["tags" Nera plugin](https://github.com/seebaermichi/nera-plugin-tags) takes the words (tags) added to a page in a special meta property and creates three elements: 
* a tag link list - which can be used on the page itself
* a tag cloud - which can be shown where ever you like
* an overview page for every used tag

The "installation" works the same as for all Nera plugins for now. Clone the repo into the `src/plugins` folder and remove the git related files.

```bash
cd /into/nera-website

git clone git@github.com:seebaermichi/nera-plugin-tags.git src/plugins/tags

# Clean up git
rm -fr src/plugins/tags/.git
```

The tags plugin basically doesn't require any configuration, since it comes with a lot of default values already. But one thing I like to set up is the template which should be used for the tag overview pages. So the only thing, I need in my `src/plugins/tags/config/tags.yaml` is:

```yaml
# src/plugins/tags/config/tags.yaml

tag_overview_layout: pages/tags-overview.pug
```

I will create the page template later and start with adding tags to my pages.

![Screenshot of added tags on a content page](/img/for-website-owners/create-website-with-nera/present-content-on-overview-pages/Screenshot-of-added-tags-on-a-content-page.png)

![Screenshot of added tags on a content page](/img/for-website-owners/create-website-with-nera/present-content-on-overview-pages/Screenshot-of-added-tags-on-another-content-page.png)

After adding tags to all of my pages, I can create the template for the tag overview pages.

```pug
//- views/pages/tag-overview.pug

extends ../layouts/posts-overview.pug

include ../mixins/teaser

block posts
    if meta.taggedPages
        +teasers(meta.taggedPages)
```

As you can see, the tag overview page template looks almost exactly the same as the "For Website Owners" page template, except that it uses the `meta.taggedPages` property of the current tag overview page. This property is generated by the tags plugin and added to the meta section of the page. It includes the content and the meta data of all pages with the tag related to this overview page.

Because the `meta.taggedPages` array includes objects with content and meta property, whereas my teaser mixin awaits an array with items on the meta level, I need to adjust the teaser mixin slightly so that it works also for tag overview pages.

```pug
//- views/mixins/teaser.pug

mixin teaser(item)
    - var item = item.meta ? item.meta : item

    if item.teaser_image
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

mixin teasers(items)
    ...
```

In line two I make sure, that the item variable will always include the data required by this mixin.

Since the tag overview pages should  now be ready, I would like to place some links on the website to actually reach them.

The easiest way is to add the tag link list to each blog post page. I can use the `tagLinks` property which is also added by the tags plugin to every page. To render a link to each related tag overview page, I just need to loop through the elements of the `tagLinks` property.

![Screenshot of loop for tag links](/img/for-website-owners/create-website-with-nera/present-content-on-overview-pages/Screenshot-of-loop-for-tag-links.png)

This replaces the tag buttons of each blog post page with real links to the related tag overview page.

![Screenshot of blog post with real links to tag overview pages](/img/for-website-owners/create-website-with-nera/present-content-on-overview-pages/Screenshot-of-blog-post-with-real-links-to-tag-overview-pages.png)

![Screenshot of tag overview page for content tag](/img/for-website-owners/create-website-with-nera/present-content-on-overview-pages/Screenshot-of-tag-overview-page-for-content-tag.png)

The last element which is offered by the tags plugin and not implemented yet is the tag cloud. This is also just a list of links for all used tags on the whole website. Because it's a global thing, it is part of the app data and to use it, I just need to iterate over the `app.tagCloud`. With this knowledge I can replace the static tag cloud in the sidebar with one with real data.

So I create a small partial for it.

```pug
//- views/partials/tag-cloud.pug

aside.single-sidebar-widget.tag_cloud_widget
    h4.widget_title Tag Clouds
    ul.list
        each tag in app.tagCloud
            li
                a(href=`${ tag.href }`) #{ tag.name }
```

To use this partial, I just replace the old static code in the sidebar with an include to this partial.

![Screenshot of include for tag cloud in sidebar partial](/img/for-website-owners/create-website-with-nera/present-content-on-overview-pages/Screenshot-of-include-for-tag-cloud-in-sidebar-partial.png)

Finally the sidebar shows a tag cloud with all the tags used on the Nera website. And if I click on one of the tags, I will see the related tag overview page.

![Screenshot with dynamic tag cloud](/img/for-website-owners/create-website-with-nera/present-content-on-overview-pages/Screenshot-with-dynamic-tag-cloud.png)

That's it for this post. The Nera website has now content for the main pages like "News", "For Website Owners" and "For Developers" and it also is able to handle the tags provided on the different blog posts.

There are still a couple of static elements, like the "Post Categories" or the author section in the sidebar and I will present how to replace all of them with real content and data in further posts.
