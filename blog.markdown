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

    {% include components/topic_pills.html %}

    <div class="content-grid">
      {% for post in site.posts %}
        {% unless post.published == false %}
          {% include components/post_card.html post=post %}
        {% endunless %}
      {% endfor %}
    </div>
  </section>
</main>
