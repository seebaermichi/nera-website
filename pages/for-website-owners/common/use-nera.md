---
layout: pages/blog-post.pug
title: Nera, a light weight static site generator
description: Let me tell you about Nera, a light weight static site generator
banner_image: /img/banner/blog-banner.jpg
teaser_image: /img/for-website-owners/common/nera-teaser.jpg
tags: website
author: Michael Becker
homepage_slider_content: 1
homepage_teaser_content: 5
for_website_owners: 1
---
A couple of months ago I needed to find a solution for a small website, where my customer wanted to have events on her page which were frequently updated. The website only consisted of one page static HTML and was based on a bought theme.

Since I didn’t want to write the events directly into the HTML I decided to use Markdown files for each event, compile it into the HTML file and upload this new file to the server.

It worked so well, that I thought a bit more about it and decided to improve and enhance the script I used a bit, so I would be able to compile more than one HTML file, depending on the structure and some meta data of the given Markdown files - Nera was born.

Nera is basically a “Markdown to HTML compiler”. It takes all the Markdown files of the pages folder, compiles it into HTML and puts it into pug templates. The result are static HTML files which you could upload where ever you want.

The main goal of Nera is to really do only this one thing. This is why it is so lightweight, but at the same time allows easy to develop plugins. The plugins of course add further functionality and there are already a couple of them.

So this was already a lot to read. Let’s get a bit more practical and I show you how easy and fast it is to use Nera.

* * *

## Installation

At first you just clone the repository from github.

```bash
cd /into/your/working/directory

git clone git@github.com:seebaermichi/nera.git my-nera-site

cd my-nera-site

rm -fr .git
```

Now you need to install all the dependencies.

```bash
npm install
```

If you open your project in your IDE now, you should see the following folder structure.
Screenshot of Neras default folder structure in VS Code

![Screenshot of Neras default folder structure in VS Code](/img/for-website-owners/common/Screenshot-of-Neras-default-folder-structure-in-VS-Code.png)

Let’s quickly talk about what you get.

The `assets` folder includes nothing for now. Later you should put all your assets, like CSS, JavaScript and image files in it.  

![Screenshot of the empty assets folder of a new Nero project](/img/for-website-owners/common/Screenshot-of-the-empty-assets-folder-of-a-new-Nero-project.png)

The `config` folder includes the `app.yaml` file, which holds some basic configuration.

![Screenshot of Neras config/app.yaml file with basic configuration](/img/for-website-owners/common/Screenshot-of-Neras-config-app-yaml-file-with-basic-configuration.png)

In the `pages` folder you find an initial Markdown file. It’s the `index.md` which includes the content of Neras `README.md` for now.

![Screenshot of Neras pages/index.md file with example content](/img/for-website-owners/common/Screenshot-of-Neras-pages-index-md-file-with-example-content.png)

The `src` folder includes all the files which Nera requires to compile and create the static HTML files. It also includes the `plugins` folder where you will add many different plugins later.

![Screenshot of Neras src folder which also includes plugins folder](/img/for-website-owners/common/Screenshot-of-Neras-src-folder-which-also-includes-plugins-folder.png)

Finally we see the `views` folder. Here you can add the pug files which are required to render the HTML.

![Screenshot of Neras views folder with basic pug layout](/img/for-website-owners/common/Screenshot-of-Neras-views-folder-with-basic-pug-layout.png)

There is one more file within the root folder which might be interesting. It’s the `plugins.md` file. It includes a list of all currently available plugins.

![Screenshot of Neras plugins.md file with a list of all currently available plugins](/img/for-website-owners/common/Screenshot-of-Neras-plugins-md-file-with-a-list-of-all-currently-available-plugins.png)

* * *

## Create first pages

Quite boring so far, right? So let’s create our first pages now.

The only thing you need to to is to add a couple of Markdown files in the `pages` folder.

![Screenshot of Neras pages folder with Markdown files for index careers company services and work](/img/for-website-owners/common/Screenshot-of-Neras-pages-folder-with-Markdown-files-for-index-careers-company-services-and-work.png)

Let’s just put some example content to each Markdown file and have the title and main headline set in accordance to the file name.

We need to run `npm run render` to get five HTML files, which are build in accordance to the pug layout files and include the conten of the related Markdown files.
Screenshot of Neras public folder after Markdown files were rendered

![Screenshot of Neras public folder after Markdown files were rendered](/img/for-website-owners/common/Screenshot-of-Neras-public-folder-after-Markdown-files-were-rendered.png)

Nera also comes with a npm run serve command which will start a dev server, so that you can view your created pages locally. If you run it and call e.g. [http://127.0.0.1:8080/careers.html](http://127.0.0.1:8080/careers.html) in your browser you should see the following.  
The port could be different, if 8080 is already in use.

![Screenshot of a very simple Careers webpage created with Nera](/img/for-website-owners/common/Screenshot-of-a-very-simple-Careers-webpage-created-with-Nera.png)

* * *

I hope you got a first impression on how easy it is to start your website with Nera.

Find out how I created this website with Nera in the ["Build Nera with Nera"](/for-website-owners/create-website-with-nera/installation-and-integration-of-website-theme.html) series.
