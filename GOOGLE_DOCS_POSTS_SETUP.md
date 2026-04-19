# Google Docs Posts Import Setup

This guide explains how to import blog posts from a Google Drive folder into posts/ during Jekyll builds, how **remote hero images** (e.g. Unsplash URLs) are turned into local WebP on build, and how to keep **Google Docs**, **Git**, and **Netlify** aligned.

## Complete publish workflow (Google Docs + Unsplash → Git → Netlify)

Use this checklist whenever a post is **ready to ship** from Google Docs, including when `featured-image` / `featured-thumbnail` are **full Unsplash `https://` URLs**.

### A. In Google Docs (finalize the source)

1. **Write and edit** the full post in your Doc (headings, body, lists as you want them exported).
2. Put **YAML front matter at the very top** of the document: a line that is only `---`, then your keys, then a line that is only `---`, then the rest of the article. Nothing important above the first `---` except optional blank lines.
3. **Required keys** (minimum): `title`, `slug`, `date`. Also use `layout: post`, `published: true`, plus `categories` and `description` so cards, filters, and SEO look right.
4. **Hero images — Unsplash path (recommended for first publish):** set `featured-image` and/or `featured-thumbnail` to the **full `https://images.unsplash.com/...` URLs** you are allowed to use. On each Jekyll build, **remote banner sync** downloads once (allowed hosts only), writes `assets/post-media/<slug>/header.webp` and `header-sm.webp`, and rewrites that post’s `_posts` file to `**/assets/post-media/...`** paths plus `banner_source_url`.
  **Or** if you already generated files locally, you can put the **local** paths in the Doc from the start (see example in [§4](#4-required-front-matter-in-each-doc)).
5. **Optional:** `featured: true` to surface the post in the homepage **Trending** slider (when it fits your editorial rules).
6. **Attribution:** if your Unsplash license requires it, add photo credit (and link) in the **post body**, not only in YAML.
7. **YAML hygiene:** use **straight ASCII** `"` quotes in YAML, not curly smart quotes. Opening/closing `---` must be **three plain hyphens** on their own lines (not a horizontal rule or broken list). If import fails, check the build log **GoogleDocs Posts:** line and the export preview.

### B. Drive and credentials

1. Confirm the Doc lives in the **Drive folder** configured in `_config.yml` as `google_docs_posts_folder_id`, and that folder is **shared** with the service account email.
2. For **Netlify**, set `**GOOGLE_DOCS_POSTS_SERVICE_ACCOUNT_JSON`** to the **full JSON** of the key (or use a file path locally — see [§2](#2-configure-this-repo)). Locally, `google_docs_posts_service_account_json` in `_config.yml` points at `google-service-account.json` at the repo root (gitignored).

### C. Ship the site (CI)

1. **Push** to the branch Netlify builds (e.g. `main`). Netlify runs `**npm ci && bundle exec jekyll build`** (`netlify.toml`): installs Node deps (**Sharp**), then Jekyll.
2. During `**jekyll build`**, in order: the Google Docs generator may refresh `_posts/*.md` from Drive; then `**remote_banner_sync`** runs and calls `**npm run sync-banners**` logic (`scripts/sync-remote-banner-images.mjs`) so any post whose front matter still has an **allowed** `https` image URL gets images written under `assets/post-media/<slug>/` and that markdown file **updated on the build machine**.
3. The published site (`_site/`) uses the **local** image paths and built assets. **Netlify does not commit** those `_posts` / `assets` edits back to GitHub.

### D. Keep Git and Google Docs in sync (recommended)

1. **After a successful deploy**, pull nothing automatic from Netlify for Git — your repo may still show **Unsplash URLs** in YAML until you sync locally (step 14) or hand-edit.
2. **On your laptop:** `npm install` (once per clone), ensure credentials for Drive import if you want a full mirror, then run `**bundle exec jekyll build`** (or `**npm run sync-banners`** if `_posts` already contains the post with remote URLs). This runs the same remote sync and patches `_posts` and `assets/post-media/` **in your working tree**.
3. **Commit and push:** `git add` the updated `_posts/YYYY-MM-DD-slug.md`, `assets/post-media/<slug>/`, and any lockfiles if changed; commit; push. That makes **Git** match what you want for the next build and avoids re-downloading the same image every CI run when the Doc no longer forces remote URLs.
4. **Update the Google Doc’s YAML** to the **same** `featured-image`, `featured-thumbnail`, and `banner_source_url` lines as in Git after sync. Otherwise the **next** Drive import can overwrite `_posts` with the old Unsplash URLs again (builds will still work, but CI will re-fetch every time the doc wins the cache).

### E. Overrides and manual tools

1. **Disable remote download:** set `remote_banner_sync_enabled: false` in `_config.yml`, or `**SKIP_REMOTE_BANNER_SYNC=1`** for a one-off build.
2. **Allowed image hosts** are listed under `remote_banner_sync_allowed_hosts` in `_config.yml` (defaults to Unsplash). Add hostnames if you use another CDN.
3. **Manual fetch** without relying on build order:
  `npm run banner -- --slug <slug> --url "https://..." --write-yaml`  
    (targets one post file; see script header in `scripts/fetch-post-banner.mjs`.)

---

## 1) Enable Drive API + Create Service Account

1. Create or select a Google Cloud project.
2. Enable the Google Drive API.
3. Create a Service Account.
4. Create a JSON key for that service account.
5. Share your Drive folder with the service account email.

## 2) Configure This Repo

Add settings to config.yml (already added):

```yaml
google_docs_posts_folder_id: "1hPZx27UyCHyvV-S1K74uoPQCcuYmVAOS"
google_docs_posts_service_account_json: "service-account.json"
```

Place the JSON key file at the repo root as `**google-service-account.json**` (filename in `_config.yml`; gitignored), or set an env var:

```
GOOGLE_DOCS_POSTS_SERVICE_ACCOUNT_JSON=/absolute/path/to/service-account.json
```

You can also pass the full JSON content in the env var instead of a path.

## 3) Install Gems

```bash
bundle install
```

## 4) Required front matter in each Doc

At the top of each Google Doc, include YAML front matter between two `---` lines.

**Option A — Unsplash (or other allowed HTTPS URL) in the Doc; build will fetch and rewrite**

```yaml
---
title: "Post Title"
slug: "post-title-slug"
date: "2026-02-21"
layout: post
published: true
categories: ["writing", "ai"]
description: "Short summary used in cards and meta tags."
featured-image: "https://images.unsplash.com/photo-xxxxxxxx?w=2000&q=80&auto=format&fit=crop"
featured-thumbnail: "https://images.unsplash.com/photo-xxxxxxxx?w=800&q=80&auto=format&fit=crop"
featured: false
---
```

Remote sync uses `**featured-image` first** if it is `https:`; otherwise `**featured-thumbnail`**. It generates both local WebP files from that one download and sets both keys to `/assets/post-media/<slug>/header.webp` and `header-sm.webp`, plus `**banner_source_url`**.

**Option B — Local WebP paths (after you have run a build or `npm run banner` once)**

```yaml
---
title: "Post Title"
slug: "post-title-slug"
date: "2026-02-21"
layout: post
published: true
categories: ["writing", "ai"]
description: "Short summary used in cards and meta tags."
featured-image: "/assets/post-media/post-title-slug/header.webp"
featured-thumbnail: "/assets/post-media/post-title-slug/header-sm.webp"
banner_source_url: "https://images.unsplash.com/photo-xxxxxxxx?..."
---
```

Required fields: **title**, **slug**, **date**. If `published` is `false`, the doc is skipped.

## 5) Build (local or Netlify)

```bash
npm install          # once per clone; Netlify uses npm ci
bundle exec jekyll build
```

On each build, `**remote_banner_sync**` (see `_config.yml`) runs **after** the Google Docs importer. If any `_posts` file still has an **https** `featured-image` or `featured-thumbnail` on an **allowed host**, Node downloads it once, writes `assets/post-media/<slug>/header.webp` (+ thumb), and rewrites that post’s front matter to local paths. To skip: `**SKIP_REMOTE_BANNER_SYNC=1`** or `**remote_banner_sync_enabled: false`**. To run only the image scan: `**npm run sync-banners**`.

**Git:** Netlify does not push patched `_posts` / `assets` back to Git — see [complete workflow §D](#d-keep-git-and-google-docs-in-sync-recommended).

## Notes

- Posts are written to posts/YYYY-MM-DD-slug.md.
- Posts overwrite only when the Google Doc modified time is newer.
- Cache path is set in `_config.yml` as `google_docs_posts_cache_path` (default in this repo: `_data/google_docs_posts_cache.json`).
- If two docs share the same slug, only the first one will be used.
- Put the opening `---` at the **top** of the document (only blank lines above it). Use **straight ASCII** `"` quotes in YAML, not curly “smart” quotes from Docs.
- The importer normalizes BOM, CRLF, smart quotes, and `---` lines drawn with en/em dashes; if import still fails, read the **GoogleDocs Posts:** warning in the build log (YAML errors vs missing `---` block).
- If the log says **no line of only `---`**: Google Docs often splits `---` across list items or converts it to a horizontal rule. Type **three hyphens alone on one line**, then Enter, twice (opening and closing). Use **Format → Clear formatting** on those lines, or paste `---` from a plain-text editor. The build log includes a short **export preview** so you can see what Drive actually returned.
- Drive’s **Markdown export** often turns delimiter lines into `**\---`** (backslash + hyphens). The importer normalizes those back to `---` before parsing. If the preview still shows `\---` and import fails, re-save the Doc and rebuild so the cache re-fetches.

