---
layout: default
title: "My Favorite Quotes"
permalink: /quotes/
description: "A curated collection of inspiring quotes"
---

<style>
/* Modern, minimalistic quotes page */
.quotes-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
}

.page-header {
  text-align: center;
  margin-bottom: 4rem;
}

.page-title {
  font-size: 3.5rem;
  font-weight: 300;
  color: #1a1a1a;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 1.375rem;
  color: #666;
  font-weight: 400;
  max-width: 500px;
  margin: 0 auto 2rem;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 3rem;
  padding: 1.5rem;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 1rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.topics-nav {
  margin-bottom: 3rem;
  padding: 1.5rem;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
}

.nav-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.topic-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.topic-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 25px;
  color: #555;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.topic-tag:hover {
  border-color: #007bff;
  color: #007bff;
  text-decoration: none;
  transform: translateY(-1px);
}

.topic-count {
  background: #f0f0f0;
  color: #666;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
}

.topic-emoji,
.section-emoji {
  margin-right: 0.5rem;
  font-size: 1.2em;
}

.topic-with-emoji {
  display: flex;
  align-items: center;
}

.quotes-section {
  margin-bottom: 4rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid #e5e5e5;
}

.quotes-list {
  display: grid;
  gap: 2rem;
}

.quote {
  padding: 2rem;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  cursor: pointer;
}

.quote:hover {
  border-color: #ddd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.quote-profile-pic {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
  flex-shrink: 0;
  margin-top: 0.5rem;
  transition: filter 0.3s ease;
}


.quote-content-wrapper {
  flex: 1;
  min-width: 0;
}

.quote-text {
  font-size: 1.75rem;
  line-height: 1.6;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
  position: relative;
  font-weight: 500;
}

.quote-text::before {
  content: '"';
  font-size: 6rem;
  color: #f0f0f0;
  position: absolute;
  left: -0.5rem;
  top: -2.5rem;
  font-family: Georgia, serif;
  line-height: 1;
  z-index: 0;
}

.quote-content {
  position: relative;
  z-index: 1;
}

  .quote-author {
    font-weight: 600;
    color: #666;
    margin-top: 0.75rem;
    font-size: 1.125rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .quote-profile-pic {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #f0f0f0;
    flex-shrink: 0;
    margin-top: 0.5rem;
  }.quote-author::before {
  content: '— ';
  color: #999;
}

.quote-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.quote-context {
  font-size: 1.5rem;
  color: #777;
  /* font-style: italic; */
  flex: 1;
}

.quote-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #007bff;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.75rem 1.25rem;
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  transition: all 0.2s ease;
  background: #fafafa;
}

.quote-link:hover {
  border-color: #007bff;
  background: #007bff;
  color: #fff;
  text-decoration: none;
  transform: translateY(-1px);
}

.quote-link::after {
  content: '↗';
  font-size: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #888;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #555;
  margin-bottom: 0.5rem;
}

/* Quote Modal */
.quote-modal {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  cursor: pointer;
}

.quote-modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 900px;
  width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  cursor: default;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.quote-modal-main {
  display: flex;
  flex: 1;
  align-items: flex-start;
  gap: 2rem;
  padding: 2rem;
}

.quote-modal-img {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #f0f0f0;
  flex-shrink: 0;
}


.quote-modal-content-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 300px;
}

.quote-modal-body {
  order: 1;
  margin-bottom: 2rem;
}

.quote-modal-header-info {
  order: 2;
  margin-bottom: 1.5rem;
}

.quote-modal-footer {
  order: 3;
  display: flex;
  justify-content: flex-start;
  margin-top: auto;
}

.quote-modal-author {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.quote-modal-context {
  font-size: 2rem;
  color: #666;
  /* font-style: italic; */
  margin: 0;
}

.context-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
}

.context-link:hover {
  color: #0056b3;
  border-bottom-color: #0056b3;
  text-decoration: none;
}

.quote-modal-body {
  order: 1;
  margin-bottom: 2rem;
}

.quote-modal-text {
  font-size: 2.25rem;
  line-height: 1.5;
  color: #1a1a1a;
  position: relative;
  font-weight: 600;
  margin-bottom: 0;
}

.quote-modal-text::before {
  content: '"';
  font-size: 5rem;
  color: #f0f0f0;
  position: absolute;
  left: -0.75rem;
  top: -2rem;
  font-family: Georgia, serif;
  line-height: 1;
  z-index: 0;
}

.quote-modal-text-content {
  position: relative;
  z-index: 1;
}

.quote-modal-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #007bff;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.875rem 1.5rem;
  border: 2px solid #007bff;
  border-radius: 25px;
  transition: all 0.2s ease;
  background: #fff;
}

.quote-modal-link:hover {
  background: #007bff;
  color: #fff;
  text-decoration: none;
  transform: translateY(-1px);
}

.quote-modal-link::after {
  content: '↗';
  font-size: 0.875rem;
}

.quote-modal-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 10;
}

.quote-modal-close:hover {
  background: #f0f0f0;
  color: #333;
}

.quote-modal-navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.quote-modal-nav {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #ddd;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  position: static;
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.quote-modal-nav:hover {
  background: rgba(255, 255, 255, 1);
  border-color: #007bff;
  color: #007bff;
  transform: scale(1.1);
}

.quote-modal-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: scale(0.9);
}

.quote-profile-pic {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
  flex-shrink: 0;
  margin-top: 0.5rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .quotes-page {
    padding: 2rem 1rem;
  }
  
  .page-title {
    font-size: 2.75rem;
  }
  
  .page-subtitle {
    font-size: 1.25rem;
  }
  
  .stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .topic-tags {
    justify-content: center;
  }
  
  .quote {
    padding: 1.5rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .quote-profile-pic {
    width: 60px;
    height: 60px;
    align-self: center;
    margin-top: 0;
  }
  
  .quote-text {
    font-size: 1.5rem;
    line-height: 1.5;
  }
  
  .quote-author {
    font-size: 1rem;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
  
  .quote-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .quote-modal-content {
    width: 95vw;
    max-width: none;
    flex-direction: column;
  }
  
  .quote-modal-main {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
    padding: 1.5rem;
  }
  
  .quote-modal-img {
    width: 200px;
    height: 200px;
    align-self: center;
  }
  
  .quote-modal-content-section {
    min-height: auto;
    text-align: center;
    align-items: center;
    justify-content: center;
  }
  
  .quote-modal-header-info {
    text-align: center;
  }
  
  .quote-modal-body {
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .quote-modal-author {
    font-size: 1.75rem;
  }
  
  .quote-modal-context {
    font-size: 1.125rem;
  }
  
  .quote-modal-text {
    font-size: 1.5rem;
  }
  
  .quote-modal-footer {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .quotes-page {
    padding: 1.5rem 1rem;
  }
  
  .page-title {
    font-size: 2.25rem;
  }
  
  .quote {
    padding: 1.25rem;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .quote-text {
    font-size: 1.375rem;
  }
  
  .quote-profile-pic {
    width: 50px;
    height: 50px;
    align-self: center;
    margin-top: 0;
  }
  
  .quote-text::before {
    font-size: 4rem;
    left: -0.75rem;
    top: -1.5rem;
  }
  
  .quote-modal-main {
    padding: 1.25rem;
  }
  
  .quote-modal-img {
    width: 150px;
    height: 150px;
  }
  
  .quote-modal-content-section {
    text-align: center;
    align-items: center;
  }
  
  .quote-modal-header-info {
    text-align: center;
  }
  
  .quote-modal-author {
    font-size: 1.5rem;
  }
  
  .quote-modal-context {
    font-size: 1rem;
  }
  
  .quote-modal-text {
    font-size: 1.375rem;
  }
  
  .quote-modal-text::before {
    font-size: 3rem;
    left: -0.5rem;
    top: -1rem;
  }
}
</style>

<div class="quotes-page">
  <header class="page-header">
    <h1 class="page-title">My Favorite Quotes</h1>
    <p class="page-subtitle">Quotes and sayings that I've collected throughout the years, organized by category. Some are wise, some are silly, and some I just find inspiring.</p>
    
    <div class="stats">
      <div class="stat">
        <span class="stat-number">{{ site.data.quotes.size | default: 0 }}</span>
        <span class="stat-label">Quotes</span>
      </div>
      <div class="stat">
        <span class="stat-number">{% assign topics_with_quotes = 0 %}{% for topic_data in site.data.quotes_by_topic %}{% assign quotes = topic_data[1] %}{% if quotes.size > 0 %}{% assign topics_with_quotes = topics_with_quotes | plus: 1 %}{% endif %}{% endfor %}{{ topics_with_quotes | default: 0 }}</span>
        <span class="stat-label">Topics</span>
      </div>
      <div class="stat">
        <span class="stat-number">{{ site.data.quotes | map: 'author' | uniq | size | default: 0 }}</span>
        <span class="stat-label">People</span>
      </div>
    </div>
    
    <!-- DEBUG INFO -->
    <div style="background: #f0f0f0; padding: 10px; margin: 10px 0; font-family: monospace; font-size: 12px;">
      <strong>Debug Info:</strong><br>
      site.data exists: {{ site.data | size }}<br>
      site.data.quotes exists: {% if site.data.quotes %}YES{% else %}NO{% endif %}<br>
      site.data.quotes size: {{ site.data.quotes.size | default: "undefined" }}<br>
      site.data.quotes_by_topic exists: {% if site.data.quotes_by_topic %}YES{% else %}NO{% endif %}<br>
      site.data.quotes_by_topic size: {{ site.data.quotes_by_topic.size | default: "undefined" }}<br>
    </div>
  </header>

{% if site.data.quotes_by_topic.size > 0 %}

<nav class="topics-nav"><h2 class="nav-title">Browse by Topic</h2>

<div class="topic-tags">
{% for topic_data in site.data.quotes_by_topic %}
{% assign topic = topic_data[0] %}
{% assign quotes = topic_data[1] %}
{% if quotes.size > 0 %}
<a href="#{{ topic | slugify }}" class="topic-tag">
<span class="topic-with-emoji"><span class="topic-emoji"></span>{{ topic }}</span>
<span class="topic-count">{{ quotes.size }}</span>
</a>
{% endif %}
{% endfor %}
</div>
</nav>

    {% for topic_data in site.data.quotes_by_topic %}
      {% assign topic = topic_data[0] %}
      {% assign quotes = topic_data[1] %}
      {% if quotes.size > 0 %}

      <section class="quotes-section" id="{{ topic | slugify }}">
        <h2 class="section-title"><span class="section-emoji"></span>{{ topic }}</h2>
        <div class="quotes-list">
          {% for quote in quotes %}
            <article class="quote" onclick="openQuoteModal(this)" data-quote="{{ quote.text | escape }}" data-author="{{ quote.author }}" data-context="{{ quote.context | escape }}" data-url="{{ quote.url }}">
              {% assign author_clean = quote.author | split: '(' | first | strip %}
              {% assign author_filename = author_clean | slugify | replace: '-', '_' %}
              {% assign profile_path = '/assets/quote_profiles/' | append: author_filename | append: '.jpg' %}
              <img src="{{ profile_path }}" alt="{{ quote.author }}" class="quote-profile-pic"
                   onerror="this.style.display='none'">

              <div class="quote-content-wrapper">
                <p class="quote-text">
                  <span class="quote-content">{{ quote.text }}</span>
                </p>
                <div class="quote-author">
                  {{ quote.author }}
                </div>
                <div class="quote-meta">
                  {% if quote.context %}
                    <div class="quote-context">{{ quote.context }}</div>
                  {% endif %}
                  {% if quote.url %}
                    <a href="{{ quote.url }}" target="_blank" rel="noopener noreferrer" class="quote-link" onclick="event.stopPropagation()">
                      Source
                    </a>
                  {% endif %}
                </div>
              </div>
            </article>
          {% endfor %}
        </div>
      </section>
      {% endif %}
    {% endfor %}

{% else %}

{% else %}

{% else %}

<div class="empty-state">
<h3>No quotes available yet</h3>
<p>Quotes are being loaded from Google Docs. Please check back soon!</p>
</div>

{% endif %}

<!-- Quote Modal -->
<div id="quoteModal" class="quote-modal" onclick="closeQuoteModal()">
  <div class="quote-modal-content" onclick="event.stopPropagation()">
    <button class="quote-modal-close" onclick="closeQuoteModal()">&times;</button>
    
    <div class="quote-modal-main">
      <img id="quoteModalImg" src="" alt="" class="quote-modal-img">
      
      <div class="quote-modal-content-section">
        <div class="quote-modal-header-info">
          <h3 id="quoteModalAuthor" class="quote-modal-author"></h3>
          <p id="quoteModalContext" class="quote-modal-context"></p>
        </div>
        
        <div class="quote-modal-body">
          <p class="quote-modal-text">
            <span id="quoteModalText" class="quote-modal-text-content"></span>
          </p>
        </div>
        
        <div class="quote-modal-footer">
          <a id="quoteModalLink" href="" target="_blank" rel="noopener noreferrer" class="quote-modal-link" style="display: none;">
            View Source
          </a>
        </div>
      </div>
    </div>
    
    <div class="quote-modal-navigation">
      <button class="quote-modal-nav quote-modal-nav-prev" id="quoteModalPrev">‹</button>
      <button class="quote-modal-nav quote-modal-nav-next" id="quoteModalNext">›</button>
    </div>
  </div>
</div>

</div><script>
// Smooth scrolling for topic navigation
document.addEventListener('DOMContentLoaded', function() {
  // Convert medium types to emojis in all quote contexts
  const quoteContexts = document.querySelectorAll('.quote-context');
  quoteContexts.forEach(context => {
    const originalText = context.textContent;
    context.innerHTML = convertMediumToEmoji(originalText);
  });

// Add emojis to topic tags and section titles
const topicTags = document.querySelectorAll('.topic-tag');
topicTags.forEach(tag => {
const topicText = tag.querySelector('.topic-with-emoji');
if (topicText) {
const topicName = topicText.textContent.trim();
const emojiSpan = tag.querySelector('.topic-emoji');
if (emojiSpan) {
emojiSpan.textContent = getTopicEmoji(topicName);
}
}
});

// Add emojis to section titles
const sectionTitles = document.querySelectorAll('.section-title');
sectionTitles.forEach(title => {
const emojiSpan = title.querySelector('.section-emoji');
if (emojiSpan) {
const topicName = title.textContent.trim();
emojiSpan.textContent = getTopicEmoji(topicName);
}
});

// Add navigation button event listeners
const prevBtn = document.getElementById('quoteModalPrev');
const nextBtn = document.getElementById('quoteModalNext');

if (prevBtn) {
prevBtn.addEventListener('click', function() {
navigateQuote(-1);
});
}

if (nextBtn) {
nextBtn.addEventListener('click', function() {
navigateQuote(1);
});
}

const topicLinks = document.querySelectorAll('.topic-tag');

topicLinks.forEach(link => {
link.addEventListener('click', function(e) {
e.preventDefault();
const targetId = this.getAttribute('href').substring(1);
const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Add temporary highlight
        targetElement.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
        setTimeout(() => {
          targetElement.style.boxShadow = '';
        }, 2000);
      }
    });

});

// Add subtle animations to quotes on scroll

// Add subtle animations to quotes on scroll
const observerOptions = {
threshold: 0.1,
rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.style.opacity = '1';
entry.target.style.transform = 'translateY(0)';
}
});
}, observerOptions);

const quotes = document.querySelectorAll('.quote');
quotes.forEach(quote => {
quote.style.opacity = '0';
quote.style.transform = 'translateY(20px)';
quote.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
observer.observe(quote);
});
});

// Quote Modal Functions
let currentQuoteIndex = 0;
let allQuoteElements = [];

function getTopicEmoji(topicName) {
const topicEmojiMap = {
'love': '❤️',
'pain, struggle and resilience': '💪',
'authenticity': '🎭',
'productivity and focus': '🎯',
'decisions and priorities': '⚖️',
'business': '💼',
'motivation': '🔥',
'stop and think': '🤔',
'health': '🌿',
'time, death and loss': '⏳',
'spirituality': '✨',
'purpose and lifepath': '🗺️',
'work': '💻',
'pedagogy': '🎓',
'materialism and impermanence': '🏺',
'mindfulness and happiness': '🧘',
'responsibilities and balance': '⚖️',
'risk and failure': '🎲',
'systems': '⚙️',
'change': '🦋',
'mindset and optimistic thinking': '🌟',
'discipline': '🥋',
'humility': '🙏',
'inspiration and creativity': '💡',
'money and investments': '💰',
'humor': '😄',
'reading': '📚',
'writing': '✍️',
'misc': '🌐'
};

const lowerTopic = topicName.toLowerCase().trim();
return topicEmojiMap[lowerTopic] || '💭';
}

function convertMediumToEmoji(text) {
if (!text) return text;

// Create a mapping of medium types to emojis
const mediumEmojiMap = {
'song': '🎵',
'music': '🎵',
'track': '🎵',
'album': '💿',
'podcast': '🎙️',
'interview': '🎙️',
'radio': '📻',
'book': '📖',
'novel': '📚',
'poem': '📝',
'ebook': '📱',
'audiobook': '🎧',
'magazine': '📰',
'article': '📄',
'blog': '💻',
'website': '🌐',
'video': '🎬',
'movie': '🎬',
'film': '🎬',
'documentary': '🎥',
'youtube': '📺',
'tv show': '📺',
'series': '📺',
'speech': '🎤',
'lecture': '🎓',
'talk': '💬',
'conference': '👥',
'seminar': '📊',
'course': '🎓',
'class': '🏫',
'game': '🎮',
'app': '📱',
'software': '💻',
'tweet': '🐦',
'social media': '📱',
'instagram': '📸',
'facebook': '👥',
'linkedin': '💼',
'email': '📧',
'letter': '✉️',
'diary': '📓',
'journal': '📔',
'newspaper': '📰',
'quote': '💭',
'saying': '💬',
'proverb': '🧠',
'wisdom': '🧠',
'advice': '💡',
'tip': '💡',
'study': '📚',
'research': '🔬',
'paper': '📄',
'report': '📊',
'presentation': '📋',
'slide': '📊'
};

// Replace content in parentheses with emojis
let processedText = text.replace(/\(([^)]+)\)/g, (match, content) => {
const lowerContent = content.toLowerCase().trim();
const emoji = mediumEmojiMap[lowerContent];
return emoji ? emoji : match; // Return emoji if found, otherwise return original text
});

// Convert URLs to clickable links
processedText = processedText.replace(
/(https?:\/\/[^\s]+)/g,
'<a href="$1" target="_blank" rel="noopener noreferrer" class="context-link">$1</a>'
);

return processedText;

return processedText;
}

function openQuoteModal(quoteElement) {
// Update the list of all quote elements and find current index
allQuoteElements = Array.from(document.querySelectorAll('.quote'));
currentQuoteIndex = allQuoteElements.indexOf(quoteElement);

displayQuoteInModal(quoteElement);
}

function displayQuoteInModal(quoteElement) {
const modal = document.getElementById('quoteModal');
const modalImg = document.getElementById('quoteModalImg');
const modalAuthor = document.getElementById('quoteModalAuthor');
const modalContext = document.getElementById('quoteModalContext');
const modalText = document.getElementById('quoteModalText');
const modalLink = document.getElementById('quoteModalLink');
const prevBtn = document.getElementById('quoteModalPrev');
const nextBtn = document.getElementById('quoteModalNext');

// Get data from the quote element
const quoteText = quoteElement.dataset.quote;
const author = quoteElement.dataset.author;
const context = quoteElement.dataset.context;
const url = quoteElement.dataset.url;

// Get the profile image source
const profileImg = quoteElement.querySelector('.quote-profile-pic');

// Populate modal content
modalText.textContent = quoteText;
modalAuthor.textContent = author;

// Check if image is available and visible
const hasValidImage = profileImg && profileImg.offsetWidth > 0;

if (hasValidImage) {
modalImg.src = profileImg.src;
modalImg.alt = profileImg.alt;
modalImg.style.display = 'block';
} else {
modalImg.style.display = 'none';
}if (context && context.trim()) {
modalContext.innerHTML = convertMediumToEmoji(context);
modalContext.style.display = 'block';
} else {
modalContext.style.display = 'none';
}if (url && url.trim()) {
modalLink.href = url;
modalLink.style.display = 'inline-flex';
} else {
modalLink.style.display = 'none';
}

// Update navigation buttons
prevBtn.disabled = currentQuoteIndex === 0;
nextBtn.disabled = currentQuoteIndex === allQuoteElements.length - 1;

modal.style.display = 'block';

// Prevent body scroll when modal is open
document.body.style.overflow = 'hidden';
}

function navigateQuote(direction) {
const newIndex = currentQuoteIndex + direction;

if (newIndex >= 0 && newIndex < allQuoteElements.length) {
currentQuoteIndex = newIndex;
displayQuoteInModal(allQuoteElements[currentQuoteIndex]);
}
}

function closeQuoteModal() {
const modal = document.getElementById('quoteModal');
modal.style.display = 'none';

// Re-enable body scroll
document.body.style.overflow = 'auto';
}

// Close modal on Escape key and add navigation keys
document.addEventListener('keydown', function(e) {
if (e.key === 'Escape') {
closeQuoteModal();
} else if (e.key === 'ArrowLeft') {
navigateQuote(-1);
} else if (e.key === 'ArrowRight') {
navigateQuote(1);
}
});
</script>
