# Google Docs Posts Import Setup

This guide explains how to import blog posts from a Google Drive folder into \_posts/ during Jekyll builds.

## 1) Enable Drive API + Create Service Account

1. Create or select a Google Cloud project.
2. Enable the Google Drive API.
3. Create a Service Account.
4. Create a JSON key for that service account.
5. Share your Drive folder with the service account email.

## 2) Configure This Repo

Add settings to \_config.yml (already added):

```yaml
google_docs_posts_folder_id: "1hPZx27UyCHyvV-S1K74uoPQCcuYmVAOS"
google_docs_posts_service_account_json: "service-account.json"
```

Place the JSON key file at the repo root as service-account.json (already gitignored), or set an env var:

```
GOOGLE_DOCS_POSTS_SERVICE_ACCOUNT_JSON=/absolute/path/to/service-account.json
```

You can also pass the full JSON content in the env var instead of a path.

## 3) Install Gems

```bash
bundle install
```

## 4) Required Front Matter in Each Doc

At the top of each Google Doc, include YAML front matter:

```yaml
---
title: "Post Title"
slug: "post-title-slug"
date: "2026-02-21"
layout: post
published: true
categories: ["writing", "ai"]
description: "Short summary used in cards and meta tags."
featured-image: "/assets/post-media/post-title-slug/header.jpg"
featured-thumbnail: "/assets/post-media/post-title-slug/header-sm.jpg"
---
```

Required fields: title, slug, date. If published is false, the doc is skipped.

## 5) Build

```bash
bundle exec jekyll build
```

## Notes

- Posts are written to \_posts/YYYY-MM-DD-slug.md.
- Posts overwrite only when the Google Doc modified time is newer.
- Cache path is set in `_config.yml` as `google_docs_posts_cache_path` (default in this repo: `_data/google_docs_posts_cache.json`).
- If two docs share the same slug, only the first one will be used.
- Put the opening `---` at the **top** of the document (only blank lines above it). Use **straight ASCII** `"` quotes in YAML, not curly “smart” quotes from Docs.
- The importer normalizes BOM, CRLF, smart quotes, and `---` lines drawn with en/em dashes; if import still fails, read the **GoogleDocs Posts:** warning in the build log (YAML errors vs missing `---` block).
- If the log says **no line of only `---`**: Google Docs often splits `---` across list items or converts it to a horizontal rule. Type **three hyphens alone on one line**, then Enter, twice (opening and closing). Use **Format → Clear formatting** on those lines, or paste `---` from a plain-text editor. The build log includes a short **export preview** so you can see what Drive actually returned.
- Drive’s **Markdown export** often turns delimiter lines into **`\---`** (backslash + hyphens). The importer normalizes those back to `---` before parsing. If the preview still shows `\---` and import fails, re-save the Doc and rebuild so the cache re-fetches.
