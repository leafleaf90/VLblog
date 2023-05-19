---
title: Generating the blog with Jekyll
layout: post
featured-image: /assets/post-media/2020-04-27/kickin-back.jpg
featured-thumbnail: /assets/post-media/2020-04-27/kickin-back-sm.jpg
description: I took my sad excuse of a blog and fed it to Jekyll. It spat this out!
categories: jekyll programming
---

## Static Site Generator-generated!

We are now up and running with static site generator Jekyll!

![Jekyll logo](\assets\post-media\2020-04-27\jekyll.svg "Jekyll logo")

Jekyll is a static site generator that has been around for long and the documentation is solid. Steps:

1. Install Ruby (Jekyll is written in Ruby). I'm on Windows so I used the installer package: [Ruby](https://www.ruby-lang.org/en/)</div>

2. With Ruby installed, proceeded to install Jekyll:

   ```
   > gem install jekyll
   ```

3. Created a new Jekyll site:

   ```
   > jekyll new C:/my-path
   ```

4. Followed the [official Jekyll guide on converting a site to Jekyll](https://jekyllrb.com/tutorials/convert-site-to-jekyll/)

And it seems smooth! Setting up a blog with a JavaScript framework such as Vue seemed a bit overkill for this simple blog just to be able to utilize components. Jekyll still allows the re-use of footer, html head etc on all pages without any hassle, by using layouts.
