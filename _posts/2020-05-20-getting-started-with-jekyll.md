---
title: Getting started with Jekyll
layout: post
is_series: true
series_title: "Building this blog"
featured-image: /assets/post-media/2020-04-27/kickin-back.jpg
featured-thumbnail: /assets/post-media/2020-04-27/kickin-back-sm.jpg
description: Build and host static websites with ease
categories: jekyll
---

Jekyll is a static site generator written in Ruby that was released in 2008. It allows you to reuse components without any hassle and suits well if all you need an easy way to publish blog posts or launch simple static websites.

Steps to get going:

1\. Install Ruby on your machine. I'm on Windows so I used the installer package: [Ruby](https://www.ruby-lang.org/en/){:target="\_blank"}

2\. With Ruby installed, proceeded to install Jekyll:

{% highlight javascript %}

> gem install jekyll{% endhighlight %}

3\. Create a new Jekyll site:

{% highlight javascript %}

> jekyll new C:/my-path{% endhighlight %}

If you already have an HTML site that you want to convert Jekyll, follow the [official Jekyll guide](https://jekyllrb.com/tutorials/convert-site-to-jekyll/){:target="\_blank"} on converting a site to Jekyll.

4\. Navigate into your newly created project directory:

{% highlight javascript %}

> jekyll cd my-path{% endhighlight %}

5\. Let Jekyll serve your site on your local machine with:

{% highlight javascript %}

> jekyll serve{% endhighlight %}

Now you can dive into the Jekyll documentation to learn more about how you can build your site. You should also learn about the [Liquid](https://shopify.github.io/liquid/){:target="\_blank"} template language which is used in Jekyll. If you come from any of the modern JavaScript frameworks, you will quickly pick up the Liquid syntax which allows you to loop over and conditionally display data in the HTML part of your code. If you have built Shopify storefronts you will be right at home, since Shopify also uses Liquid.

A static site is easy, and often free, to host with several hosting services. If you want to learn how to host your Jekyll site on **Netlify**, see my post on that [here]({% post_url 2020-05-24-jekyll-github-netlify %})

![Jekyll logo](\assets\post-media\2020-04-27\jekyll.svg "Jekyll logo")
