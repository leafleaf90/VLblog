# VLBLOG — Claude Code Context

Personal blog for Viktor Lövgren at [viktorlovgren.com](https://www.viktorlovgren.com).

## Stack

- **Jekyll 4.3.1** + Minima theme
- **Ruby 3.1.0** (see `.ruby-version`)
- **Netlify** for hosting and form handling
- **Google Drive API** for importing posts from Google Docs

## Development

```bash
bundle exec jekyll serve   # runs on port 9999
bundle exec jekyll build   # production build to _site/
```

Config change requires server restart (`_config.yml` is not live-reloaded).

## Project Structure

```
_layouts/         # home.html, post.html, default.html
_includes/        # components/blog_post_card.html
_posts/           # Markdown posts (YYYY-MM-DD-slug.md)
_drafts/          # Unpublished drafts
_plugins/         # google_docs_posts.rb — custom Jekyll generator
_data/            # google_docs_posts_cache.json
assets/
  styles.css      # Main stylesheet
  post-media/     # Post images, organized by post slug/date
  images/         # Site-wide images (profile, logos)
  quote_profiles/ # Philosopher portraits for quotes page
```

## Post Front Matter

Required: `title`, `slug`, `date`

```yaml
---
title: "Post Title"
slug: "post-title-slug"
date: "2026-02-21"
layout: post
published: true
categories: ["coding"]        # see Categories section below
description: "Short summary used in cards and meta tags."
featured-image: "/assets/post-media/post-title-slug/header.jpg"
featured-thumbnail: "/assets/post-media/post-title-slug/header-sm.jpg"
featured: true                # optional: shows in homepage trending slider
is_series: true               # optional: enables series links footer
series_title: "Series Name"   # required if is_series: true
updated_date: "2026-03-01"    # optional: shown in post header
---
```

## Categories

The homepage filters and sidebar group posts into three buckets:

| Group | Categories |
|---|---|
| **Code** | coding, vue, nuxt, firebase, javascript, jekyll, hosting, dart, flutter, openai |
| **Mindfulness** | productivity, minimalism, mindfulness, motivation, books |
| **Life** | travel, thailand, movies |

Posts with categories outside these groups appear in "other" and are visible only under "all".

## Google Docs → Posts Integration

Posts can be authored in Google Docs and auto-imported at build time via `_plugins/google_docs_posts.rb`.

- Docs must contain YAML front matter at the top (same fields as above)
- Service account credentials read from `google-service-account.json` at repo root **or** env var `GOOGLE_DOCS_POSTS_SERVICE_ACCOUNT_JSON`
- Cache stored in `_data/google_docs_posts_cache.json`; docs only re-exported when modified
- See `GOOGLE_DOCS_POSTS_SETUP.md` for full setup instructions

**On Netlify**, set the env var `GOOGLE_DOCS_POSTS_SERVICE_ACCOUNT_JSON` to the full JSON content of the service account key.

## Quotes Page

`quotes.md` — content is static/manually maintained Markdown. There is also infrastructure in `_config.yml` (`quotes_google_docs_url`) for fetching quotes from a published Google Doc, but the current page content is hardcoded.

## Sensitive Files

- `google-service-account.json` — **never commit**; already in `.gitignore`
- Netlify env vars hold the service account JSON for CI builds

## Deployment

Push to `main` triggers a Netlify build automatically. Build command: `bundle exec jekyll build`. Publish dir: `_site/`.

## Netlify Forms

Contact form uses Netlify Forms (no backend needed). The form is in `_layouts/home.html` with `name="contact"`.
