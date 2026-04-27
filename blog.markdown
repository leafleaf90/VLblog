---
layout: default
title: "Blog"
permalink: /blog/
description: >-
  All posts from Viktor Lövgren on software development, tools, digital sanity,
  productivity, and side projects.
---

<main class="page-container page-container--text blog-page" aria-labelledby="blog-archive-heading">
  <section class="content-area">
    <header class="books-page__header">
      <h1 id="blog-archive-heading">Blog<span class="milka red">.</span></h1>
      <p>
        Notes on software, tools, productivity, and the small operational hazards
        of trying to make useful things.
      </p>
    </header>

    <h2 id="posts-list-heading" class="section-title left-align">All Posts</h2>
    {% include components/post_browse.html page_context="blog" %}
  </section>
</main>
