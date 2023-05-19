---
layout: default
permalink: /categories/
title: Categories
---

<div id="archives">
{% for category in site.categories %}
 <div class="older-posts gradient-bg">
  <div class="posts-container">
    {% capture category_name %}{{ category | first }}{% endcapture %}
    <div style="font-style:capitalize" id="#{{ category_name | slugize }}"></div>
<div style="display:flex; align-items:center; justify-content:center"><h3 style="text-transform:capitalize">{{ category_name }}</h3> <img
    src="/assets/images/categories/{{category_name}}.svg"
    style="height: 25px; padding-left: 10px;"
    alt=""
  /></div>
    <a name="{{ category_name | slugize }}"></a>
    {% for post in site.categories[category_name] %}

    {% include
      components/blog_post_card.html post=post %}

    {% endfor %}

  </div>
  </div>
{% endfor %}
</div>
