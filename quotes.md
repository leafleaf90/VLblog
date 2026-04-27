---
layout: default
title: "My Favorite Quotes"
permalink: /quotes/
description: "A curated collection of inspiring quotes"
---

<link rel="stylesheet" href="{{ '/assets/quotes-page.css' | relative_url }}?v={{ site.time | date: '%s' }}" />

<main class="page-container page-container--text" aria-labelledby="quotes-page-title">
<div class="quotes-page">
  <div class="quotes-hero-card">
    <header class="quotes-header">
      <p class="quotes-eyebrow">Commonplace book</p>
      <h1 class="quotes-hero-title" id="quotes-page-title">Words for hard days<span class="milka red">.</span></h1>
      <p class="quotes-lede">Quotes I return to when I need courage, perspective, discipline, or a useful kick in the head.</p>
    </header>

    {% if site.data.quotes.size > 0 %}
    <script type="application/json" id="quotes-hero-data">
    [
    {% for q in site.data.quotes %}
      {% assign author_clean = q.author | split: '(' | first | strip %}
      {% assign author_filename = author_clean | slugify | replace: '-', '_' %}
      {% assign profile_href = '/assets/quote_profiles/' | append: author_filename | append: '.jpg' | relative_url %}
      {
        "text": {{ q.text | jsonify }},
        "author": {{ q.author | jsonify }},
        "context": {{ q.context | default: "" | jsonify }},
        "url": {{ q.url | default: "" | jsonify }},
        "profile": {{ profile_href | jsonify }}
      }{% unless forloop.last %},{% endunless %}
    {% endfor %}
    ]
    </script>

    <section id="featured-quote" class="quotes-feature" hidden>
      <p class="quotes-feature__kicker">Today’s word of wisdom</p>
      <div class="quotes-feature__portrait">
        <img
          id="featured-quote-avatar"
          class="quotes-feature__avatar"
          src=""
          alt=""
          width="176"
          height="176"
          hidden
        />
      </div>
      <div class="quotes-feature__body">
        <blockquote class="quotes-feature__blockquote">
          <p id="featured-quote-text" class="quotes-feature__text"></p>
        </blockquote>
        <p id="featured-quote-caption" class="quotes-feature__caption"></p>
      </div>
    </section>

    <div class="quotes-hero-fallback" id="quotes-hero-fallback">
      <p class="quotes-feature__kicker">Today’s word of wisdom</p>
      <div class="quotes-hero-fallback__row">
        {% assign fq = site.data.quotes | first %}
        {% assign fq_author_clean = fq.author | split: '(' | first | strip %}
        {% assign fq_fn = fq_author_clean | slugify | replace: '-', '_' %}
        {% assign fq_src = '/assets/quote_profiles/' | append: fq_fn | append: '.jpg' | relative_url %}
        <div class="quotes-feature__portrait">
          <img class="quotes-feature__avatar" src="{{ fq_src }}" alt="" width="176" height="176" onerror="var p=this.closest('.quotes-feature__portrait'); var r=this.closest('.quotes-hero-fallback__row'); if(p){p.style.display='none';} if(r){r.classList.add('quotes-hero-fallback--no-portrait');}" />
        </div>
        <div class="quotes-feature__body">
          <blockquote class="quotes-feature__blockquote">
            <p class="quotes-feature__text">{{ fq.text | escape }}</p>
          </blockquote>
          <p class="quotes-feature__caption">— {{ fq.author | escape }}{% if fq.context %}<span class="quotes-feature__context"> · {{ fq.context | escape }}</span>{% endif %}</p>
        </div>
      </div>
    </div>
    {% endif %}

    <div class="quotes-stats">
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
  </div>

{% if site.data.quotes_by_topic.size > 0 %}

<nav class="topics-nav"><h2 class="nav-title">Find words for</h2>

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

</div>
</main>
<script>
function randomQuoteIndex(n) {
  return Math.floor(Math.random() * n);
}

function initFeaturedQuoteHero() {
  const root = document.getElementById("featured-quote");
  const dataEl = document.getElementById("quotes-hero-data");
  const fallback = document.getElementById("quotes-hero-fallback");
  const page = document.querySelector(".quotes-page");
  if (!root || !dataEl) {
    return;
  }

  var quotes;
  try {
    quotes = JSON.parse(dataEl.textContent);
  } catch (e) {
    return;
  }
  if (!Array.isArray(quotes) || quotes.length === 0) {
    return;
  }

  const q = quotes[randomQuoteIndex(quotes.length)];
  const img = document.getElementById("featured-quote-avatar");
  const bq = document.getElementById("featured-quote-text");
  const cap = document.getElementById("featured-quote-caption");

  if (bq) {
    bq.textContent = q.text || "";
  }

  if (cap) {
    cap.textContent = "";
    const spAuthor = document.createElement("span");
    spAuthor.textContent = q.author || "";
    cap.appendChild(spAuthor);
    if (q.context && String(q.context).trim()) {
      const spCtx = document.createElement("span");
      spCtx.className = "quotes-feature__context";
      spCtx.innerHTML = convertMediumToEmoji(String(q.context));
      cap.appendChild(spCtx);
    }
  }

  const profileUrl = q.profile && String(q.profile).trim() ? String(q.profile).trim() : "";
  root.classList.add("quotes-feature--no-avatar");
  if (img) {
    img.hidden = true;
    img.removeAttribute("src");
  }
  if (img && profileUrl) {
    img.alt = q.author ? q.author : "";
    img.addEventListener(
      "load",
      function onFeaturedLoad() {
        img.hidden = false;
        root.classList.remove("quotes-feature--no-avatar");
      },
      { once: true }
    );
    img.addEventListener(
      "error",
      function onFeaturedError() {
        img.hidden = true;
        img.removeAttribute("src");
        img.alt = "";
        root.classList.add("quotes-feature--no-avatar");
      },
      { once: true }
    );
    img.src = profileUrl;
  } else if (img) {
    img.alt = "";
  }

  root.hidden = false;
  if (fallback) {
    fallback.setAttribute("hidden", "");
  }
  if (page) {
    page.classList.add("js-quotes-hero");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initFeaturedQuoteHero();

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
'art': '🎨',
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
}
if (context && context.trim()) {
modalContext.innerHTML = convertMediumToEmoji(context);
modalContext.style.display = 'block';
} else {
modalContext.style.display = 'none';
}
if (url && url.trim()) {
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
