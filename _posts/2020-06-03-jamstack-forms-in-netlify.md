---
title: "JAMstack forms with Netlify"
layout: post
featured-image: /assets/post-media/2020-06-03/coffee-computer.jpg
featured-thumbnail: /assets/post-media/2020-06-03/coffee-computer-sm.jpg
description: 1 minute setup for small-scale form handling with Netlify
categories: infrastructure
---

## An easy solution to a common problem

Even on a static websites you generally some functionality that requires server-side code. Search or submission forms are two examples. If you host with Netlify they can take care of the latter for you. This is no doubt the fastest way if you're already on Netlify and it doesn't require any JavaScript.

## Downsides - limited free tier

The free plan only allows for 100 submissions per month. This is on par with other servies out there, such as [Formik](https://formik.com/pricing){:target="\_blank"} and [StaticKit](https://statickit.com/){:target="\_blank"}, whose free tiers also offers 100 requests/month. For \$19/month you get 1,000 submissions with Netlify.

## How-to

I added a contact form to this Jekyll blog in a matter of minutes. You can follow the instructions on Netlify's own blog post on this [here](https://www.netlify.com/blog/2017/09/19/form-handling-with-the-jamstack-and-netlify/){:target="\_blank"}. In short, here is what I did:

1. In your forms opening tag, add <em>netlify</em>:
   ![Form opening tag](/assets/post-media/2020-06-03/form-1.png "Form opening tag")
2. Option, add spam protection with a hidden field (what's called a honeypot) that bots might fill out and thereby be exposed:
   ![Form spam protection](/assets/post-media/2020-06-03/form-2.png "Form spam protection")
3. Check incoming form submissions in Netlify. You can also set email notifications to let you know when you have new submissions.

And that's it! Netlify will recognize this form at build time, due to the added "netlify" in the opening form tag.

If you want a free option even as your usage grows, you can look at integrating a [Google Form](https://www.google.com/forms/about/){:target="\_blank"} with an iframe into your static website.
