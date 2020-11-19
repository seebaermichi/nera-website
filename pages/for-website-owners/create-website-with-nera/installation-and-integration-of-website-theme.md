---
layout: pages/blog-post.pug
title: Installation and integration of website theme
description: With this post I want to get real and will show you, how I start to build the website for Nera with itself.
banner_image: /img/banner/blog-banner.jpg
teaser_image: /img/for-website-owners/create-website-with-nera/installation-and-integration-of-website-theme/Screenshot-of-the-first-draft-of-the-Nera-website-after-transfering-the-Opium-theme.png
tags: website, installation, theme
author: Michael Becker
homepage_slider_content: 2
homepage_teaser_content: 2
for_website_owners: 2
---
Nera is a light weight static site generator and I will share how to build the website about it here. 

In my first post about Nera I gave a short overview of how easy it is to install and start using Nera.  
With this post I want to get real and will show you, how I start to build the website for Nera with itself.

* * *

To install and use Nera I need to clone it from the repository into my working directory, remove the old git files and install all the depencies.

```bash
cd /into/your/working/directory

git clone git@github.com:seebaermichi/nera.git nera-website

cd nera-website

# Clean up git
rm -fr .git# Install node dependencies

npm install

```
In VS Code I will start with Neras default setup.

![Screenshot of Nera default setup in VS Code](/img/for-website-owners/create-website-with-nera/installation-and-integration-of-website-theme/Screenshot-of-Nera-default-setup-in-VS-Code.png)

* * *

Before I decide on the structure of the Nera website and its content, I want to add the theme with its placeholder content. This way I get a better feeling, what should be the content of the future Nera website.

I have choosen [Opium from colorlib](https://colorlib.com/wp/template/opium/) and will now implement it.

At first I copy all the assets Opium has into the assets folder of my Nera website. During the compile process Nera will copy all of these directories and files into the public folder.
Screenshot of assets folder after copying all theme assets

![Screenshot of assets folder after copying all theme assets](/img/for-website-owners/create-website-with-nera/installation-and-integration-of-website-theme/Screenshot-of-assets-folder-after-copying-all-theme-assets.png)

Just to show you how these assets will end up in the `public` folder during the compile process, I run `npm run render` and will get the following in my `public` folder.

![Screenshot of Neras public folder after compile process.](/img/for-website-owners/create-website-with-nera/installation-and-integration-of-website-theme/Screenshot-of-Neras-public-folder-after-compile-process.png)

So far I didn’t need to change anything in the `config/app.yaml`. But this is mainly because I want to create a website about Nera, so I can use the default settings here.  
If you create your own website with Nera, you might need to adjust things here accordingly.

![Screenshot of Neras default settings in config/app.yaml](/img/for-website-owners/create-website-with-nera/installation-and-integration-of-website-theme/Screenshot-of-Neras-default-settings.png)

Since I don’t want to show any Markdown content on the home page of the Nera website, I removed everything here.  
The only things which are required are the title and the layout file which should be used.
Screenshot of index.md file for Nera website.

![Screenshot of index.md file for Nera website](/img/for-website-owners/create-website-with-nera/installation-and-integration-of-website-theme/Screenshot-of-index-md-file-for-Nera-website.png)

As you can see here, I used a dedicated template for the layout of the home page. This is because the home page of Opium doesn’t have “own” content, but only shows different teasers of other pages.

Look how I structured my view files so far.

At first I copied the whole content of Opiums `index.html` file and pasted it into [html2jade](https://html2jade.org/) to have it transformed in pug. Make sure to use spaces and the width for the indentation. I used 4, because with 2 I had some issues in VS Code after I copied the pug code into the several partials.

If you copy the whole pug code and paste it into the `pages/home.pug` or directly copy parts of it and paste it into dedicated partials is up to you. I prefer the later method and ended up with the following.

![Screenshot of initial views file structure for Nera website](/img/for-website-owners/create-website-with-nera/installation-and-integration-of-website-theme/Screenshot-of-initial-views-file-structure-for-Nera-website.png)

Here is how each view file looks after I finished the whole copy and paste process.

_As a side node, Nera comes with another command, which is quite helpful while developing the project. Run npm start to get the HTML files re-compiled whenever there are changes on the assets, Markdown or pug files._

This is the base layout `views/layouts/app.pug`, which includes all the main partials.

```pug
//- views/layouts/app.pug
<!DOCTYPE html>
html(lang=app.lang)
    include ../partials/head

    body
        include ../partials/header

        block page-content

        include ../partials/footer

        include ../partials/footer-scripts

```

The `views/partials/head.pug` includes everything needed in the head tag, like title, meta tags, link to style files etc.  
You can see how I added JavaScript template strings for title and meta tags. This will be replaced during the compile process with the related settings in your Markdown files meta section or the values from the `config/app.yaml`.  
I also added a slash before all the paths to the assets to have absolute paths to make sure this will also work, when the rendered HTML file isn’t on the same level as the assets folder.

```pug
//- views/partials/head.pug
head
    meta(charset='utf-8')
    meta(name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no')

    title #{ meta.title } | #{ app.name }

    meta(name="description", content=`${meta.description || app.description}`)
    meta(name="keywords", conent=`${meta.keywords || app.keywords}`)
    meta(name="generator" content=`nera - ${process.env.npm_package_version}`)
    meta(name="robots" content=`${meta.robots || app.robots}`)

    link(rel='stylesheet' href='/css/bootstrap.css')
    link(rel='stylesheet' href='/vendors/linericon/style.css')
    link(rel='stylesheet' href='/css/font-awesome.min.css')
    link(rel='stylesheet' href='/vendors/owl-carousel/owl.carousel.min.css')
    link(rel='stylesheet' href='/vendors/lightbox/simpleLightbox.css')
    link(rel='stylesheet' href='/vendors/nice-select/css/nice-select.css')
    link(rel='stylesheet' href='/vendors/animate-css/animate.css')
    link(rel='stylesheet' href='/vendors/jquery-ui/jquery-ui.css')

    link(rel='stylesheet' href='/css/style.css')
    link(rel='stylesheet' href='/css/responsive.css')

```

The next partial in the `app.pug` is the `views/partials/header.pug` which basically includes the main navigation. For now I didn’t add any JavaScript template strings and kept the placeholder content and images.  
What we need for our own navigation will be part of another post.

```pug
//- views/partials/header.pug
header.header_area
    .main_menu
        nav.navbar.navbar-expand-lg.navbar-light
            .container.box_1620
                a.navbar-brand.logo_h(href='index.html')
                    img(src='img/logo.png' alt='')
                button.navbar-toggler(type='button' data-toggle='collapse' data-target='#navbarSupportedContent' aria-controls='navbarSupportedContent' aria-expanded='false' aria-label='Toggle navigation')
                    span.icon-bar
                    span.icon-bar
                    span.icon-bar
                #navbarSupportedContent.collapse.navbar-collapse.offset
                    ul.nav.navbar-nav.menu_nav
                        li.nav-item.active
                            a.nav-link(href='index.html') Home
                        li.nav-item
                            a.nav-link(href='category.html') Category
                        li.nav-item
                            a.nav-link(href='archive.html') Archive
                        li.nav-item.submenu.dropdown
                            a.nav-link.dropdown-toggle(href='#' data-toggle='dropdown' role='button' aria-haspopup='true' aria-expanded='false') Pages
                            ul.dropdown-menu
                                li.nav-item
                                    a.nav-link(href='single-blog.html') Sinlge Blog
                                li.nav-item
                                    a.nav-link(href='elements.html') Elements
                        li.nav-item
                            a.nav-link(href='contact.html') Contact
                    ul.nav.navbar-nav.navbar-right.header_social.ml-auto
                        li.nav-item
                            a(href='#')
                                i.fa.fa-facebook
                        li.nav-item
                            a(href='#')
                                i.fa.fa-twitter
                        li.nav-item
                            a(href='#')
                                i.fa.fa-dribbble
                        li.nav-item
                            a(href='#')
                                i.fa.fa-behance
    .logo_part
        .container
            a.logo(href='#')
                img(src='img/logo.png' alt='')

```

Finally I included the partials for the footer and for the scripts which are added at the end of the page. Also here I added a slash to the paths to use absolute paths for the same reason as mentioned above.  
The content of the footer will change while we continue with creating the real Nera website, so I kept the placeholder content and images of Opium here for now as well.

```pug
//- views/partials/footer.pug
footer.footer-area.p_120
    .container
        .row
            .col-lg-3.col-md-6.col-sm-6
                .single-footer-widget
                    h6.footer_title About Us
                    p
                        | Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore dolore magna aliqua.
            .col-lg-4.col-md-6.col-sm-6
                .single-footer-widget
                    h6.footer_title Newsletter
                    p Stay updated with our latest trends
                    #mc_embed_signup
                        form.subscribe_form.relative(target='_blank' action='https://spondonit.us12.list-manage.com/subscribe/post?u=1462626880ade1ac87bd9c93a&id=92a4423d01' method='get')
                            .input-group.d-flex.flex-row
                                input(name='EMAIL' placeholder='Email Address' onfocus="this.placeholder = ''" onblur="this.placeholder = 'Email Address '" required='' type='email')
                                button.btn.sub-btn
                                    span.lnr.lnr-arrow-right
                            .mt-10.info
            .col-lg-3.col-md-6.col-sm-6
                .single-footer-widget.instafeed
                    h6.footer_title Instagram Feed
                    ul.list.instafeed.d-flex.flex-wrap
                        li
                            img(src='img/instagram/Image-01.jpg' alt='')
                        li
                            img(src='img/instagram/Image-02.jpg' alt='')
                        li
                            img(src='img/instagram/Image-03.jpg' alt='')
                        li
                            img(src='img/instagram/Image-04.jpg' alt='')
                        li
                            img(src='img/instagram/Image-05.jpg' alt='')
                        li
                            img(src='img/instagram/Image-06.jpg' alt='')
                        li
                            img(src='img/instagram/Image-07.jpg' alt='')
                        li
                            img(src='img/instagram/Image-08.jpg' alt='')
            .col-lg-2.col-md-6.col-sm-6
                .single-footer-widget.f_social_wd
                    h6.footer_title Follow Us
                    p Let us be social
                    .f_social
                        a(href='#')
                            i.fa.fa-facebook
                        a(href='#')
                            i.fa.fa-twitter
                        a(href='#')
                            i.fa.fa-dribbble
                        a(href='#')
                            i.fa.fa-behance
        .row.footer-bottom.d-flex.justify-content-between.align-items-center
            p.col-lg-12.footer-text.text-center
                // Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0.
                | Copyright ©
                script.
                    document.write(new Date().getFullYear());
                |  All rights reserved | This template is made with
                i.fa.fa-heart-o(aria-hidden='true')
                |  by
                a(href='https://colorlib.com' target='_blank') Colorlib

```

```pug
//- views/partials/footer-scripts.pug
script(src='/js/jquery-3.2.1.min.js')
script(src='/js/popper.js')
script(src='/js/bootstrap.min.js')
script(src='/js/stellar.js')
script(src='/vendors/lightbox/simpleLightbox.min.js')
script(src='/vendors/nice-select/js/jquery.nice-select.min.js')
script(src='/vendors/isotope/imagesloaded.pkgd.min.js')
script(src='/vendors/isotope/isotope-min.js')
script(src='/vendors/owl-carousel/owl.carousel.min.js')
script(src='/vendors/jquery-ui/jquery-ui.js')
script(src='/js/jquery.ajaxchimp.min.js')
script(src='/js/mail-script.js')
script(src='/js/theme.js')

```

Well, but we still didn’t look into the template file which is actually used for the home page, right? So let’s do this now.

As I already mentioned I choosed a dedicated layout file `views/layouts/home.pug` for the home page, because it’s so special. The home layout file extends the app layout, includes the partial for the home banner and is used by the home page template.

Let’s see what’s inside.

```pug
//- views/layouts/home.pug
extends ./app

block page-content
    include ../partials/home-banner

    block content

```

```pug
//- views/pages/home.pug
extends ../layouts/home

block content
    section.blog_area.p_120
        .container
            .row
                .col-lg-8
                    .blog_left_sidebar
                        article.blog_style1
                            .blog_img
                                img.img-fluid(src='img/home-blog/blog-1.jpg' alt='')
                            .blog_text
                                .blog_text_inner
                                    .cat
                                        a.cat_btn(href='#') Gadgets
                                        a(href='#')
                                            i.fa.fa-calendar(aria-hidden='true')
                                            |  March 14, 2018
                                        a(href='#')
                                            i.fa.fa-comments-o(aria-hidden='true')
                                            |  05
                                    a(href='#')
                                        h4 Nest Protect: 2nd Gen Smoke + CO Alarm
                                    p
                                        | Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.
                                    a.blog_btn(href='#') Read More
                        .row
                            .col-md-6
                                article.blog_style1.small
                                    .blog_img
                                        img.img-fluid(src='img/home-blog/blog-small-1.jpg' alt='')
                                    .blog_text
                                        .blog_text_inner
                                            .cat
                                                a.cat_btn(href='#') Gadgets
                                                a(href='#')
                                                    i.fa.fa-calendar(aria-hidden='true')
                                                    |  March 14, 2018
                                                a(href='#')
                                                    i.fa.fa-comments-o(aria-hidden='true')
                                                    |  05
                                            a(href='single-blog.html')
                                                h4 Nest Protect 2nd Gen Smoke CO Alarm
                                            p
                                                | Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incidid unt ut labore et dolore magna aliqua.
                                            a.blog_btn(href='#') Read More
                            .col-md-6
                                article.blog_style1.small
                                    .blog_img
                                        img.img-fluid(src='img/home-blog/blog-small-2.jpg' alt='')
                                    .blog_text
                                        .blog_text_inner
                                            .cat
                                                a.cat_btn(href='#') Gadgets
                                                a(href='#')
                                                    i.fa.fa-calendar(aria-hidden='true')
                                                    |  March 14, 2018
                                                a(href='#')
                                                    i.fa.fa-comments-o(aria-hidden='true')
                                                    |  05
                                            a(href='single-blog.html')
                                                h4 Nest Protect 2nd Gen Smoke CO Alarm
                                            p
                                                | Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incidid unt ut labore et dolore magna aliqua.
                                            a.blog_btn(href='#') Read More
                        article.blog_style1
                            .blog_img
                                img.img-fluid(src='img/home-blog/blog-2.jpg' alt='')
                            .blog_text
                                .blog_text_inner
                                    .cat
                                        a.cat_btn(href='#') Gadgets
                                        a(href='#')
                                            i.fa.fa-calendar(aria-hidden='true')
                                            |  March 14, 2018
                                        a(href='#')
                                            i.fa.fa-comments-o(aria-hidden='true')
                                            |  05
                                    a(href='single-blog.html')
                                        h4 Nest Protect: 2nd Gen Smoke CO Alarm
                                    p
                                        | Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.
                                    a.blog_btn(href='#') Read More
                        .row
                            .col-md-6
                                article.blog_style1.small
                                    .blog_img
                                        img.img-fluid(src='img/home-blog/blog-small-3.jpg' alt='')
                                    .blog_text
                                        .blog_text_inner
                                            .cat
                                                a.cat_btn(href='#') Gadgets
                                                a(href='#')
                                                    i.fa.fa-calendar(aria-hidden='true')
                                                    |  March 14, 2018
                                                a(href='#')
                                                    i.fa.fa-comments-o(aria-hidden='true')
                                                    |  05
                                            a(href='single-blog.html')
                                                h4 Nest Protect 2nd Gen Smoke CO Alarm
                                            p
                                                | Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incidid unt ut labore et dolore magna aliqua.
                                            a.blog_btn(href='#') Read More
                            .col-md-6
                                article.blog_style1.small
                                    .blog_img
                                        img.img-fluid(src='img/home-blog/blog-small-4.jpg' alt='')
                                    .blog_text
                                        .blog_text_inner
                                            .cat
                                                a.cat_btn(href='#') Gadgets
                                                a(href='#')
                                                    i.fa.fa-calendar(aria-hidden='true')
                                                    |  March 14, 2018
                                                a(href='#')
                                                    i.fa.fa-comments-o(aria-hidden='true')
                                                    |  05
                                            a(href='single-blog.html')
                                                h4 Nest Protect 2nd Gen Smoke CO Alarm
                                            p
                                                | Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incidid unt ut labore et dolore magna aliqua.
                                            a.blog_btn(href='#') Read More
                        .row
                            .col-md-6
                                article.blog_style1.small
                                    .blog_img
                                        img.img-fluid(src='img/home-blog/blog-small-5.jpg' alt='')
                                    .blog_text
                                        .blog_text_inner
                                            .cat
                                                a.cat_btn(href='#') Gadgets
                                                a(href='#')
                                                    i.fa.fa-calendar(aria-hidden='true')
                                                    |  March 14, 2018
                                                a(href='#')
                                                    i.fa.fa-comments-o(aria-hidden='true')
                                                    |  05
                                            a(href='single-blog.html')
                                                h4 Nest Protect 2nd Gen Smoke CO Alarm
                                            p
                                                | Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incidid unt ut labore et dolore magna aliqua.
                                            a.blog_btn(href='#') Read More
                            .col-md-6
                                article.blog_style1.small
                                    .blog_img
                                        img.img-fluid(src='img/home-blog/blog-small-6.jpg' alt='')
                                    .blog_text
                                        .blog_text_inner
                                            .cat
                                                a.cat_btn(href='#') Gadgets
                                                a(href='#')
                                                    i.fa.fa-calendar(aria-hidden='true')
                                                    |  March 14, 2018
                                                a(href='#')
                                                    i.fa.fa-comments-o(aria-hidden='true')
                                                    |  05
                                            a(href='single-blog.html')
                                                h4 Nest Protect 2nd Gen Smoke CO Alarm
                                            p
                                                | Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incidid unt ut labore et dolore magna aliqua.
                                            a.blog_btn(href='#') Read More
                        nav.blog-pagination.justify-content-center.d-flex
                            ul.pagination
                                li.page-item
                                    a.page-link(href='#' aria-label='Previous')
                                        span(aria-hidden='true')
                                            span.lnr.lnr-chevron-left
                                li.page-item
                                    a.page-link(href='#') 01
                                li.page-item.active
                                    a.page-link(href='#') 02
                                li.page-item
                                    a.page-link(href='#') 03
                                li.page-item
                                    a.page-link(href='#') 04
                                li.page-item
                                    a.page-link(href='#') 09
                                li.page-item
                                    a.page-link(href='#' aria-label='Next')
                                        span(aria-hidden='true')
                                            span.lnr.lnr-chevron-right
                .col-lg-4
                    .blog_right_sidebar
                        aside.single_sidebar_widget.search_widget
                            .input-group
                                input.form-control(type='text' placeholder='Search Posts')
                                span.input-group-btn
                                    button.btn.btn-default(type='button')
                                        i.lnr.lnr-magnifier
                            // /input-group
                            .br
                        aside.single_sidebar_widget.author_widget
                            img.author_img.img-fluid(src='img/blog/author.png' alt='')
                            h4 Charlie Barber
                            p Senior blog writer
                            p
                                | Boot camps have its supporters andit sdetractors. Some people do not understand why you should have to spend money on boot camp when you can get. Boot camps have itssuppor ters andits detractors.
                            .social_icon
                                a(href='#')
                                    i.fa.fa-facebook
                                a(href='#')
                                    i.fa.fa-twitter
                                a(href='#')
                                    i.fa.fa-github
                                a(href='#')
                                    i.fa.fa-behance
                            .br
                        aside.single_sidebar_widget.popular_post_widget
                            h3.widget_title Popular Posts
                            .media.post_item
                                img(src='img/blog/popular-post/post1.jpg' alt='post')
                                .media-body
                                    a(href='blog-details.html')
                                        h3 Space The Final Frontier
                                    p 02 Hours ago
                            .media.post_item
                                img(src='img/blog/popular-post/post2.jpg' alt='post')
                                .media-body
                                    a(href='blog-details.html')
                                        h3 The Amazing Hubble
                                    p 02 Hours ago
                            .media.post_item
                                img(src='img/blog/popular-post/post3.jpg' alt='post')
                                .media-body
                                    a(href='blog-details.html')
                                        h3 Astronomy Or Astrology
                                    p 03 Hours ago
                            .media.post_item
                                img(src='img/blog/popular-post/post4.jpg' alt='post')
                                .media-body
                                    a(href='blog-details.html')
                                        h3 Asteroids telescope
                                    p 01 Hours ago
                            .br
                        aside.single-sidebar-widget.newsletter_widget
                            h4.widget_title Newsletter
                            .form-group.d-flex.flex-row
                                .input-group
                                    input#inlineFormInputGroup.form-control(type='text' placeholder='Enter email' onfocus="this.placeholder = ''" onblur="this.placeholder = 'Enter email'")
                                a.bbtns(href='#')
                                    i.lnr.lnr-arrow-right
                            .br
                        aside.single_sidebar_widget.post_category_widget
                            h4.widget_title Post Catgories
                            ul.list.cat-list
                                li
                                    a.d-flex.justify-content-between(href='#')
                                        p Technology
                                        p 37
                                li
                                    a.d-flex.justify-content-between(href='#')
                                        p Lifestyle
                                        p 24
                                li
                                    a.d-flex.justify-content-between(href='#')
                                        p Fashion
                                        p 59
                                li
                                    a.d-flex.justify-content-between(href='#')
                                        p Art
                                        p 29
                                li
                                    a.d-flex.justify-content-between(href='#')
                                        p Food
                                        p 15
                                li
                                    a.d-flex.justify-content-between(href='#')
                                        p Architecture
                                        p 09
                                li
                                    a.d-flex.justify-content-between(href='#')
                                        p Adventure
                                        p 44

```

As with the other files, I didn’t remove any of the placeholder content and images of the Opium theme.  
My goal was to see the demo page of Opium in my Nera project and when I run `npm run serve` now and open [http://127.0.0.1:8080/](http://127.0.0.1:8080/) it looks like I achieved it. There is the Opium demo page, but with the title, meta description and meta keywords from the config/app.yaml of my Nera website.

![Screenshot of the first draft of the Nera website after transfering the Opium theme](/img/for-website-owners/create-website-with-nera/installation-and-integration-of-website-theme/Screenshot-of-the-first-draft-of-the-Nera-website-after-transfering-the-Opium-theme.png)

That’s it for now. I will continue with explaining how to replace the placeholder main navigation with what the Nera website will use in the [next post](/for-website-owners/create-website-with-nera/installation-and-integration-of-website-theme.html).
