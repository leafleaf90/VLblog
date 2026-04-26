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

## Light / dark theme

- **`html[data-theme="dark"|"light"]`** is set by an inline script in `_includes/theme-head.html` (runs before paint: reads `localStorage["vlblog-theme"]`, else `prefers-color-scheme`).
- **Toggle:** navbar control (`#themeToggle`) with sun/moon icons; logic in `assets/theme-toggle.js` (persists choice in `localStorage`; clear that key to follow the OS again).
- **Styles:** `assets/styles.css` — `:root` keeps light defaults; `html[data-theme="dark"]` overrides semantic CSS variables plus a few components (navbar, cards, sidebar, slider, filters, contact modal).

## Project Structure

```
_layouts/         # home.html, post.html, default.html
_includes/        # components/blog_post_card.html, agent_prompt.html, agent_reply.html (LLM UI mockups)
_posts/           # Markdown posts (YYYY-MM-DD-slug.md)
_drafts/          # Unpublished drafts
_plugins/         # google_docs_posts.rb, remote_banner_sync.rb (Drive import + remote hero → WebP)
_data/            # google_docs_posts_cache.json, agent_prompts.yml, agent_replies.yml (named UI snippets)
docs/             # contributor notes; see agent-prompt-mockups.md, agent-reply-mockups.md
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
featured-image: "https://images.unsplash.com/photo-.../..."   # or local /assets/post-media/<slug>/header.webp
featured-thumbnail: "https://images.unsplash.com/photo-.../..."   # optional; remote sync can rewrite both
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
| **Mindfulness** | productivity, minimalism, mindfulness, motivation, books, writing |
| **Life** | ai, travel, thailand, movies |

Posts with categories outside these groups appear in "other" and are visible only under "all".

## Post Media Images

Use slug-named folders for new post assets and optimize source banners into `header.webp` (`1600x528`) and `header-sm.webp` (`800x264`). See `docs/post-media-images.md` for the full convention, `sharp` command, verification steps, and cleanup rules.

## Google Docs → Posts Integration

Posts can be authored in Google Docs and auto-imported at build time via `_plugins/google_docs_posts.rb`.

- Docs must contain YAML front matter at the top (same fields as above). You may use **Unsplash `https://` URLs** for `featured-image` / `featured-thumbnail`; `_plugins/remote_banner_sync.rb` runs after import and calls `scripts/sync-remote-banner-images.mjs` to download (allowed hosts only), write WebP under `assets/post-media/<slug>/`, and patch `_posts` on disk before render.
- Service account credentials: file at repo root per `_config.yml` (`google_docs_posts_service_account_json`, e.g. `google-service-account.json`, gitignored) **or** env var `GOOGLE_DOCS_POSTS_SERVICE_ACCOUNT_JSON`
- Cache stored in `_data/google_docs_posts_cache.json`; docs only re-exported when modified
- **Step-by-step publish workflow** (Docs → Unsplash → build → Git): see **`GOOGLE_DOCS_POSTS_SETUP.md`** → *Complete publish workflow*.

**On Netlify**, set the env var `GOOGLE_DOCS_POSTS_SERVICE_ACCOUNT_JSON` to the full JSON content of the service account key.

## Quotes Page

`quotes.md` — content is static/manually maintained Markdown. There is also infrastructure in `_config.yml` (`quotes_google_docs_url`) for fetching quotes from a published Google Doc, but the current page content is hardcoded.

## Agent prompt mockups in posts

Illustrated Cursor-style / Claude-style / Gemini-style **composer** boxes (static HTML, no JS) for example prompts: `_includes/components/agent_prompt.html`, `_data/agent_prompts.yml`, [`docs/agent-prompt-mockups.md`](docs/agent-prompt-mockups.md).

Illustrated **AI reply** blocks (Gemini-style sparkle + actions + rule; Cursor-style status line + panel): `_includes/components/agent_reply.html`, `_data/agent_replies.yml`, [`docs/agent-reply-mockups.md`](docs/agent-reply-mockups.md).

## Sensitive Files

- `google-service-account.json` — **never commit**; already in `.gitignore`
- Netlify env vars hold the service account JSON for CI builds

## Deployment

Push to `main` triggers a Netlify build automatically. Build command: **`npm ci && bundle exec jekyll build`** (`netlify.toml`). Publish dir: `_site/`. Remote banner sync needs Node + `sharp` from `npm ci`.

## Netlify Forms

Contact form uses Netlify Forms (no backend needed). The form is in `_layouts/home.html` with `name="contact"`.
