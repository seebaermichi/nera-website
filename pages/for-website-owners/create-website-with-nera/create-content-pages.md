---
layout: pages/blog-post.pug
title: Create content pages
description: It’s time to add some content, so that the website becomes more valuable to visitors.
banner_image: /img/banner/blog-banner.jpg
teaser_image: /img/for-website-owners/create-website-with-nera/create-content-pages/Screenshot-of-blog-post-with-tags-author-and-published-at-date.png
tags: content, website, pages, posts
author: Michael Becker
homepage_slider_content: 3
for_website_owners: 4
---
Nera is a light weight static site generator and I will share how to build the website about it here.

In the last post of this series, I showed you how I added the main navigation to the new Nera website.
Now it’s time to add some content, so that the website becomes more valuable to visitors.

* * *

Finding content for a website was always a big challenge to me. But now I feel in a quite comfortable situation. I already created a lot of content with this series of posts about how to create the Nera website with Nera and why should it only live here? I think visitors of the Nera website would also love to know how they can easily create a website with Nera.  
So I will use the same content for a series on the new Nera website.

At first I need to decide where this content should live. I might not have stated it that clear, but the target group of the posts in this series from my point of view are people who would like to build their own website or small blog with Nera. Therefore I will put all of this content below “For Website Owners”. Which means I need to restructure this section a bit.

I create a new folder `pages/for-website-owners`, move the `pages/for-website-owners.md` file in it and re-name it to `pages/for-website-owners/index.md`. This page might become kind of an overview page later.
Then I create another new folder `pages/create-website-with-nera` and add three files in it. These files will later include the content of the current series.  

![Screenshot of file and folder structure for first content of Nera website](/img/for-website-owners/create-website-with-nera/create-content-pages/Screenshot-of-file-and-folder-structure-for-first-content-of-Nera-website.png)

As I changed the structure of the Markdown files for the “For Website Owners” part, I also need to adjust my main navigation config in `src/plugins/main-navigation/config/main-navigation.yaml`.

![Screenshot of adjusted main navigation config file](/img/for-website-owners/create-website-with-nera/create-content-pages/Screenshot-of-adjusted-main-navigation-config-file.png)

If you look closely you will also see, that I changed the value for the `active_path_class` variable to `active` as well. Since I have sub pages of pages in the main navigation now, I will use this variable to highlight the link in the main navigation.

So I also adjusted the `src/plugins/main-navigation/views/main-navigation.pug` in accordance to the requirements of my Opium theme.  
Now the link in the navigation is also highlighted when a subpage is visited.

![Screenshot of adjusted main navigation template](/img/for-website-owners/create-website-with-nera/create-content-pages/Screenshot-of-adjusted-main-navigation-template.png)

After all of these adjustments my new page about the “Installation and integration of a website theme” looks like this.

![Screenshot of blog post with adjusted main navigation](/img/for-website-owners/create-website-with-nera/create-content-pages/Screenshot-of-adjusted-main-navigation-template.png)

It looks like everything works as expected. But there is one thing I don’t like here. My Markdown file still uses the default page template and I want to create kind of a blog post here. So I need to adjust this as well.

* * *

My theme “Opium” from [colorlib](https://colorlib.com/) has a really nice template for a single blog post page and I will use this for my blog posts as well.

At first I will create a new page template, which is similar to the default template, so I can copy it from this one and just add everything else to it.

```pug
//- views/pages/blog-post.pug
extends ../layouts/app

block page-content
    include ../partials/default-banner

    section.blog_area.p_120.single-post-area
        .container
            .row
                .col-lg-8
                    .main_blog_details
                        img.img-fluid(src='img/blog/news-blog.jpg' alt='')

                        a(href='#')
                            h4 #{ meta.title }

                        .user_details
                            .float-left
                                a(href='#') Lifestyle
                                a(href='#') Gadget
                            .float-right
                                .media
                                    .media-body
                                        h5 Mark wiens
                                        p 12 Dec, 2017 11:21 am
                                    .d-flex
                                        img(src='img/blog/user-img.jpg' alt='')

                        | !{ content }

                        .news_d_footer
                            .news_socail.ml-auto
                                a(href='#')
                                    i.fa.fa-facebook
                                a(href='#')
                                    i.fa.fa-twitter
                                a(href='#')
                                    i.fa.fa-youtube-play
                                a(href='#')
                                    i.fa.fa-pinterest
                                a(href='#')
                                    i.fa.fa-rss

                    .navigation-area
                        .row
                            .col-lg-6.col-md-6.col-12.nav-left.flex-row.d-flex.justify-content-start.align-items-center
                                .thumb
                                    a(href='#')
                                        img.img-fluid(src='img/blog/prev.jpg' alt='')
                                .arrow
                                    a(href='#')
                                        span.lnr.text-white.lnr-arrow-left
                                .detials
                                    p Prev Post
                                    a(href='#')
                                        h4 Space The Final Frontier
                            .col-lg-6.col-md-6.col-12.nav-right.flex-row.d-flex.justify-content-end.align-items-center
                                .detials
                                    p Next Post
                                    a(href='#')
                                        h4 Telescopes 101
                                .arrow
                                    a(href='#')
                                        span.lnr.text-white.lnr-arrow-right
                                .thumb
                                    a(href='#')
                                        img.img-fluid(src='img/blog/next.jpg' alt='')

                include ../partials/sidebar
```

I used [html2Jade](https://html2jade.org/) again to get pug out of the HTML of my theme. For now I replaced the static content only in two places.  
In line 14 I added `#{ meta.title }` to get the title of my blog post as the headline. And in line 28 I replaced all the placeholder post content with `| !{ content }` so that the content from the related Markdown file is added.

I won’t show the whole content of the first blog post of the new Nera website, but only a screenshot of its beginning, since it’s a really big file.

![Screenshot of first blog post markdown file](/img/for-website-owners/create-website-with-nera/create-content-pages/Screenshot-of-first-blog-post-markdown-file.png)

Now I’m curious to see the result. I run `npm start` and start my dev server with `npm run serve` and open [http://127.0.0.1:8080/for-website-owners/create-website-with-nera/installation-and-integration-of-website-theme.html](http://127.0.0.1:8080/for-website-owners/create-website-with-nera/installation-and-integration-of-website-theme.html) in the browser.

![Screenshot of first blog post](/img/for-website-owners/create-website-with-nera/create-content-pages/Screenshot-of-first-blog-post.png)

It doesn’t look to bad, but there are a lot of things which I would like to approve.

_As a side node, I needed to add a bit of CSS to the `assets/css/style.css` to limit the width of the images within the post content. Without it there where just to wide._

* * *

But back to the first post. There is still a lot of static or placeholder content from the theme which I would like to replace with my own content.

Let’s start with the banner image right at the top. The Opium theme uses it everywhere, but it doesn’t really fit for my content. It would be cool, if I could add a different banner image for each post or page or use a default one.  
Luckily this can be achieved easily.

So at first I add a new variable to my blog post Markdown file meta section.

![Screenshot of adding banner image to blog post](/img/for-website-owners/create-website-with-nera/create-content-pages/Screenshot-of-adding-banner-image-to-blog-post.png)

As you can see, I added a new banner image for blog posts to the `assets/img/banner` folder and referenced its path in a new meta data variable `banner_image`.

Now I want my banner partial to use the value of this variable whenever it’s available as the background image for the banner.

![Screenshot of using blog post banner if available](/img/for-website-owners/create-website-with-nera/create-content-pages/Screenshot-of-using-blog-post-banner-if-available.png)

To override the background image, I just added inline style to the relevant container. The inline style for the background image uses the path inside the `banner_image` variable if available. Otherwise it shows the old default banner image.

![Screenshot of blog post with new banner image](/img/for-website-owners/create-website-with-nera/create-content-pages/Screenshot-of-blog-post-with-new-banner-image.png)

* * *

Another image I would like to add is kind of a teaser which Opium shows before the content of the blog post starts.  
I think, I can use the same approach as for the custom banner image. I add a new meta data variable with the path to the image I want to use and adjust my `views/page/blog-post.pug` template accordingly.

![Screenshot of new teaser-image variable for blog post](/img/for-website-owners/create-website-with-nera/create-content-pages/Screenshot-of-new-teaser-image-variable-for-blog-post.png)

It’s a quite long path string since I structured the images related to this post the same way as the post itself, but it should be totally fine.

As already mentioned, I need to adjust the template file now, so that it uses this variable.

![Screenshot of blog post template using the teaser image variable](/img/for-website-owners/create-website-with-nera/create-content-pages/Screenshot-of-blog-post-template-using-the-teaser-image-variable.png)

In the page template file I just replaced the old static image source with the new variable I just added to the blog post meta section.

I probably will also add another variable for the teaser image alt text, so that the alt attribute of the image is no longer empty. But for now the image source is enough.

![Screenshot of blog post with teaser image](/img/for-website-owners/create-website-with-nera/create-content-pages/Screenshot-of-blog-post-with-teaser-image.png)

* * *

Finally I would like to replace the static tags, the authors name and the published at date. The procedure will be the same as before. I add new variables to the meta section of my blog post and use them in the template file.

![Screenshot of blog post Markdown file with new variables for tags, author and published at date](/img/for-website-owners/create-website-with-nera/create-content-pages/Screenshot-of-blog-post-Markdown-file-with-new-variables-for-tags-author-and-published-at-date.png)

I just added `tags`, `author` and `published_at` with relevant values and will use these now in the related template file.

![Screenshot of adjusted blog template with tags, author and published at date](/img/for-website-owners/create-website-with-nera/create-content-pages/Screenshot-of-adjusted-blog-template-with-tags,-author-and-published-at-date.png)

For simplicity I kept the empty links now and only loop through the list of tags and add the tag name (probably a nice use case for another plugin).  
The replacement for the static author and published at date is an easy fix (published at might also be a nice plugin).

![Screenshot of blog post with tags author and publisehd at date](/img/for-website-owners/create-website-with-nera/create-content-pages/Screenshot-of-blog-post-with-tags-author-and-published-at-date.png)


I’m quite happy with the result so far. Of course the whole sidebar is still static content, but this will be part of another post.

In the [next post](/for-website-owners/create-website-with-nera/present-content-on-homepage.html) I will show you how to link the blog posts on the home page or other category pages.
