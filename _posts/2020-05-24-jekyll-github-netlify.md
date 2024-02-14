---
title: Hosting a Jekyll site on Netlify
layout: post
is_series: true
series_title: "Building this blog"
featured-image: /assets/post-media/2020-04-28/server.jpg
featured-thumbnail: /assets/post-media/2020-04-28/server-sm.jpg
description: Automated build with GitHub and Netlify
categories: jekyll hosting
---

This blog is built with the static site generator Jekyll (see [last post]({% post_url 2020-05-20-getting-started-with-jekyll %})). Static sites are easy, and usually free, to host.

Netlify is one of the services that offers convenient hosting options that can trigger a new build everytime you update a GitHub repository. This makes it easy to, for example, release a new blog post. You just push your changes to your repository and Netlify will make sure they are reflected on your hosted site.

First, you need to initiate the Ruby package manager, **Bundler**, in your project. If you are used to JavaScript, this is the Ruby equivalent of NPM, PNPM, or Yarn.

<img class="" src="/assets/post-media/2020-04-28/bundler.png"/>

In the terminal, run:

{% highlight javascript %}

> bundle init{% endhighlight %}

And then:
{% highlight javascript %}

> bundle install{% endhighlight %}

You should now have a file named Gemfile.lock in the root of your project. This file will track all dependencies for your project.

Now you can go ahead and setup your GitHub repository and push the code there. Then you just have to register an account with Netlify (you can sign up using your GitHub account) and create a new site from your GitHub repository. The process once you're on the Netlify dashboard is quite self-explanatory, but their docs [here](https://www.netlify.com/blog/2020/04/02/a-step-by-step-guide-jekyll-4.0-on-netlify/){:target="\_blank"} explain it in detail.

It's a simple way to set up a site that you can update with a few simple commands. Build time on Netlify once you push updates to your repository is around a minute or so.
