---
title: Generating the blog with Jekyll
layout: post
is_series: true
series_title: "Building this blog"
featured-image: /assets/post-media/2020-04-27/kickin-back.jpg
featured-thumbnail: /assets/post-media/2020-04-27/kickin-back-sm.jpg
description: I took my sad excuse of a blog and fed it to Jekyll. It spat this out!
categories: jekyll coding
---

## Jekyll - Static Site Generator

![Jekyll logo](\assets\post-media\2020-04-27\jekyll.svg "Jekyll logo")

Jekyll is a static site generator that has been around for long and the documentation is solid.

Setting up a blog with a JavaScript framework such as Vue or React can seem a bit overkill, and most likely you will end up having to use it together with a static site generator anyways (Gatsby for React, for example). Jekyll allows you to re-use components without any hassle if all you need is re-usable components and an easy way to publish blog posts.

Steps to get going:

1. Install Ruby (Jekyll is written in Ruby). I'm on Windows so I used the installer package: [Ruby](https://www.ruby-lang.org/en/)

2. With Ruby installed, proceeded to install Jekyll:

   ```
   > gem install jekyll
   ```

3. Created a new Jekyll site:

   ```
   > jekyll new C:/my-path
   ```

4. Follow the [official Jekyll guide on converting a site to Jekyll](https://jekyllrb.com/tutorials/convert-site-to-jekyll/)
