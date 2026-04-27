---
title: "Set up a Buttondown newsletter with Jekyll and a custom signup form"
layout: post
is_series: false
description: "How to add a custom Buttondown signup form to a Jekyll blog without exposing API keys or building a backend."
date: "2026-04-26"
categories: ["coding", "jekyll"]
published: true
slug: buttondown-newsletter-jekyll-custom-form
featured-image: "/assets/post-media/buttondown-newsletter-jekyll-custom-form/header.webp"
featured-thumbnail: "/assets/post-media/buttondown-newsletter-jekyll-custom-form/header-sm.webp"
featured_image_width: 1600
featured_image_height: 528
---

## What you'll learn

- How to connect a custom signup form to Buttondown.
- Why the embed endpoint does not require a public API key.
- How to keep the implementation portable beyond Jekyll.

I wanted a simple email list for this blog.

Not a publication platform. Not a new content management system. Not a second place where posts go to start a small administrative rebellion.

Just this:

- Someone reads a post.
- They decide they want future posts by email.
- They enter their email.
- Buttondown handles the subscriber list, confirmation email, unsubscribe links, and sending.
- I still write and publish posts on the blog.

That is the setup this post covers.

I use Jekyll here, but the Jekyll part is not the important part. The same idea works in any static site, frontend framework, or server-rendered app. Astro, Eleventy, Nuxt, Next, plain HTML, whatever currently feels like the least regrettable choice.

The important part is that Buttondown gives you a public embed endpoint. You can post a normal HTML form to that endpoint. No API key is needed in the browser.

<blockquote class="pull-quote">
  <p>No API key is needed in the browser.</p>
</blockquote>

## The Shape Of The Setup

The setup is:

```text
Custom form -> Buttondown embed endpoint -> double opt-in email -> subscriber list
```

For this blog, I added:

- a reusable Jekyll include for the form
- styling in the main stylesheet
- a small JavaScript enhancement so the form can submit without navigating away
- the include on the homepage and below each post

The JavaScript is optional. The form still works without it. That is a nice property for a newsletter signup form, because the stakes are "collect an email address", not "simulate a cockpit".

## 1. Create The Newsletter In Buttondown

In Buttondown, create the newsletter and set the basics:

- name
- description
- tint color
- icon
- sender settings
- double opt-in

For this blog, the newsletter page is:

```text
https://buttondown.com/viktorlovgren
```

That username is the key piece for the embed form. In my case it is:

```text
viktorlovgren
```

The form endpoint becomes:

```text
https://buttondown.com/api/emails/embed-subscribe/viktorlovgren
```

There is no private key in that URL. It is meant to be used from a public website.

## 2. Add A Custom Form

Buttondown can give you an iframe or a form snippet. I prefer using a custom form.

The iframe is faster to paste in, but it is harder to make it feel like the rest of your site. You get Buttondown's embedded UI inside your page. That is fine, but I already had a design system made of CSS variables, dark mode, and a few questionable decisions. Might as well keep going.

Here is the core form:

```html
<form
  action="https://buttondown.com/api/emails/embed-subscribe/viktorlovgren"
  method="post"
>
  <label for="newsletter-email">Email address</label>
  <input
    id="newsletter-email"
    type="email"
    name="email"
    placeholder="you@example.com"
    autocomplete="email"
    required
  />
  <input type="hidden" name="embed" value="1" />
  <button type="submit">Subscribe</button>
</form>
```

The important parts are:

- `action` points to Buttondown's embed endpoint.
- `method="post"` sends the signup request.
- the email field is named `email`.
- `type="email"` and `required` give you basic browser validation.
- `embed=1` tells Buttondown this is coming from an embedded signup form.

Buttondown handles the real validation after that. If the email is malformed, already subscribed, blocked, or needs confirmation, that is Buttondown's job. Always pleasant when a SaaS product does the SaaS part.

## 3. Turn It Into A Jekyll Include

On a Jekyll site, I do not want to paste this form into every layout. I want one include that can be reused wherever it makes sense.

I created:

```text
_includes/newsletter_signup.html
```

The include looks like this:

{% raw %}
```html
{% assign newsletter_variant = include.variant | default: "default" %}
{% assign newsletter_username = include.username | default: "viktorlovgren" %}

<section
  class="newsletter-signup newsletter-signup--{{ newsletter_variant }}"
  aria-labelledby="newsletter-heading-{{ newsletter_variant }}"
>
  <div class="newsletter-signup__inner">
    <p class="newsletter-signup__eyebrow">Newsletter</p>
    <h2
      id="newsletter-heading-{{ newsletter_variant }}"
      class="newsletter-signup__title"
    >
      Forever Closing Tabs
    </h2>
    <p class="newsletter-signup__copy">
      Software, sanity, and the occasional useful rabbit hole. Get new posts by
      email. No spam, no growth hacks, no heroic promises about inbox zero.
    </p>

    <form
      class="newsletter-signup__form"
      action="https://buttondown.com/api/emails/embed-subscribe/{{ newsletter_username }}"
      method="post"
      data-newsletter-form
    >
      <label class="sr-only" for="newsletter-email-{{ newsletter_variant }}">
        Email address
      </label>
      <input
        id="newsletter-email-{{ newsletter_variant }}"
        class="newsletter-signup__input"
        type="email"
        name="email"
        placeholder="you@example.com"
        autocomplete="email"
        required
      />
      <input type="hidden" name="embed" value="1" />
      <button class="newsletter-signup__button" type="submit">
        Subscribe
      </button>
    </form>

    <p class="newsletter-signup__note" data-newsletter-status aria-live="polite">
      After subscribing, check your inbox for the confirmation email. If it is
      not there, check spam or junk.
    </p>
  </div>
</section>
```
{% endraw %}

The `variant` is just for styling and unique IDs. I use `home` on the homepage and `post` below articles.

The username is passed in at the include site:

{% raw %}
```liquid
{% include newsletter_signup.html variant="home" username="viktorlovgren" %}
```
{% endraw %}

And below posts:

{% raw %}
```liquid
{% include newsletter_signup.html variant="post" username="viktorlovgren" %}
```
{% endraw %}

You could also put the username in `_config.yml`, but remember that Jekyll config changes require restarting the dev server. I used an explicit include parameter here because it is boring and hard to misunderstand. Boring is underrated.

## 4. Put It In The Layouts

On my homepage layout, I put the signup block just after the hero:

{% raw %}
```html
</section>

{% include newsletter_signup.html variant="home" username="viktorlovgren" %}

<div class="page-container">
  ...
</div>
```
{% endraw %}

In the post layout, I put it below the content:

{% raw %}
```html
<article class="post">
  ...
  <div class="content">{{ content }}</div>
  {% include newsletter_signup.html variant="post" username="viktorlovgren" %}
</article>
```
{% endraw %}

That means people can subscribe from the homepage, but also right after reading a post. The latter is probably the better moment. They have just survived a full article and may still be making decisions.

## 5. Style It Like Part Of The Site

The CSS is regular component styling. Nothing Buttondown-specific here.

The important bit is to make the form responsive, readable in light and dark mode, and accessible enough that the invisible label is still available to screen readers.

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.newsletter-signup__form {
  display: flex;
  max-width: 640px;
  gap: 0.5rem;
}

.newsletter-signup__input {
  flex: 1;
  min-width: 0;
  padding: 1.4rem 1.6rem;
  border: 1px solid rgba(37, 99, 235, 0.24);
  border-radius: 10px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font: inherit;
}

.newsletter-signup__button {
  padding: 1.4rem 1.8rem;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
  text-transform: uppercase;
}

@media (max-width: 640px) {
  .newsletter-signup__form {
    flex-direction: column;
  }
}
```

One small dark mode gotcha: if the input background is light in dark mode, make sure the typed text is dark too. Otherwise you end up with pale text on a pale background, which is a fun bug if your hobby is squinting.

```css
html[data-theme="dark"] .newsletter-signup__input {
  background: #f8fafc;
  color: #111827;
  caret-color: #111827;
}

html[data-theme="dark"] .newsletter-signup__input::placeholder {
  color: #6b7280;
}
```

## 6. Add Optional JavaScript Enhancement

Without JavaScript, the form posts to Buttondown and the browser navigates to the response. That is acceptable.

I wanted the page to stay put, so I added a tiny enhancement that targets a hidden iframe. This is old-school web plumbing. Not glamorous. Works fine.

```js
(function () {
  const forms = document.querySelectorAll("[data-newsletter-form]");
  if (!forms.length) return;

  const frameName = "buttondown-newsletter-frame";
  let frame = document.querySelector(`iframe[name="${frameName}"]`);
  let activeForm = null;

  if (!(frame instanceof HTMLIFrameElement)) {
    frame = document.createElement("iframe");
    frame.name = frameName;
    frame.title = "Newsletter subscription response";
    frame.hidden = true;
    document.body.appendChild(frame);
  }

  function setStatus(form, message) {
    const status = form
      .closest(".newsletter-signup")
      ?.querySelector("[data-newsletter-status]");

    if (status) {
      status.textContent = message;
    }
  }

  frame.addEventListener("load", function () {
    if (!activeForm) return;

    setStatus(
      activeForm,
      "Almost done. Check your inbox to confirm the subscription. If you do not see it, check spam or junk."
    );
    activeForm.reset();
    activeForm = null;
  });

  forms.forEach((form) => {
    form.addEventListener("submit", function () {
      activeForm = form;
      form.target = frameName;
      setStatus(form, "Submitting. The confirmation email is the important part.");
    });
  });
})();
```

Then load it in the base layout:

{% raw %}
```html
<script
  src="{{ 'assets/newsletter-signup.js' | relative_url }}"
  defer
></script>
```
{% endraw %}

This is progressive enhancement. If the script fails, the form still submits. If the form fails, Buttondown still owns the actual validation and subscription flow. The website remains mostly just HTML, which is often a sign that things have not gone completely off the rails.

## Does This Need API Keys?

No.

Not for this setup.

The Buttondown embed endpoint is public. It is designed for browser-side signup forms. You should not put a Buttondown API key in frontend code.

You would need an API key if you wanted to:

- subscribe users through your own backend
- tag subscribers based on custom logic
- sync subscribers into another system
- trigger custom workflows from a serverless function

For a static blog newsletter signup, that is unnecessary. Let the form post to Buttondown. Let Buttondown send the confirmation email. Go outside. Or at least open fewer tabs.

## Jekyll Is Replaceable Here

This post uses Jekyll because this blog uses Jekyll.

But the actual integration is not a Jekyll integration. It is an HTML form integration.

In React, Vue, Svelte, Astro, Nuxt, Next, Eleventy, or plain HTML, the same pieces apply:

```html
<form
  action="https://buttondown.com/api/emails/embed-subscribe/YOUR_USERNAME"
  method="post"
>
  <input type="email" name="email" required />
  <input type="hidden" name="embed" value="1" />
  <button type="submit">Subscribe</button>
</form>
```

Frameworks mostly change where you put the component and how you style it. They do not change the basic contract with Buttondown.

That is why I like this approach. It is small. It does one thing. It does not ask the blog to become a marketing automation platform, which is generally how a pleasant Sunday becomes a CRM migration.

## Final Checklist

Before calling it done:

- Create the newsletter in Buttondown.
- Confirm the username in the form endpoint.
- Enable double opt-in.
- Add the form where readers naturally finish reading.
- Test light and dark mode.
- Test mobile layout.
- Submit one real email address and confirm the flow works.
- Do not expose an API key.

That is it. A newsletter signup form, with very little ceremony.

Suspicious, but acceptable.
