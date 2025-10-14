---
layout: default
permalink: /categories/
title: Categories
---

<div class="page-container">
  <div class="redirect-container" style="text-align: center; padding: var(--spacing-2xl) var(--spacing-md);">
    <h1>Categories</h1>
    <p style="font-size: var(--font-size-lg); color: var(--color-text-secondary); margin-bottom: var(--spacing-xl);">
      We've moved to a better filtering system! You can now explore all posts by category directly on our homepage.
    </p>
    
    <div style="margin-bottom: var(--spacing-xl);">
      <a href="/" class="button" style="margin-right: var(--spacing-sm);">
        🏠 Go to Homepage
      </a>
      <a href="/#recent-heading" class="button" style="background: var(--color-primary); color: white;">
        🔍 Browse by Category
      </a>
    </div>
    
    <div style="background: var(--color-bg-secondary); padding: var(--spacing-lg); border-radius: var(--radius-lg); max-width: 600px; margin: 0 auto;">
      <h3 style="margin-bottom: var(--spacing-md);">✨ New Features:</h3>
      <ul style="text-align: left; color: var(--color-text-secondary);">
        <li><strong>Filter Buttons:</strong> Code, Mindfulness, Life categories</li>
        <li><strong>Sidebar Categories:</strong> Hierarchical topic exploration</li>
        <li><strong>Live Filtering:</strong> Instant results without page reloads</li>
        <li><strong>Post Counts:</strong> See how many posts in each category</li>
      </ul>
    </div>
  </div>
</div>

<script>
// Auto-redirect after 5 seconds
setTimeout(function() {
  window.location.href = '/#recent-heading';
}, 5000);
</script>
