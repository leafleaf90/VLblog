---
layout: default
title: "Blog"
permalink: /blog/
description: >-
  All posts from Viktor Lövgren on software development, tools, digital sanity,
  productivity, and side projects.
---

<main class="page-container" aria-labelledby="blog-archive-heading">
  <section class="content-area">
    <h1 id="blog-archive-heading" class="section-title">All Posts</h1>
    <p>
      Notes on software, tools, productivity, and the small operational hazards
      of trying to make useful things.
    </p>

    <div class="topic-nav-block">
      <p class="topic-nav-block__label">Browse by specific topic</p>
      <nav class="topic-links" aria-label="Specific topic pages">
        <a href="/topics/jekyll/">Jekyll</a>
        <a href="/topics/vue/">Vue</a>
        <a href="/topics/nuxt/">Nuxt</a>
        <a href="/topics/firebase/">Firebase</a>
        <a href="/topics/javascript/">JavaScript</a>
        <a href="/topics/productivity/">Productivity</a>
        <a href="/topics/digital-minimalism/">Digital Minimalism</a>
        <a href="/topics/ai-tools/">AI Tools</a>
      </nav>
    </div>

    <div class="content-grid">
      {% for post in site.posts %}
        {% unless post.published == false %}
          {% include components/blog_post_card.html post=post %}
        {% endunless %}
      {% endfor %}
    </div>
  </section>
</main>
