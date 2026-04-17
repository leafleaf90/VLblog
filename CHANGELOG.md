# Changelog

## 2026-04-17

### Added
- `CLAUDE.md` — project context file for AI-assisted development
- `.claude/settings.json` — pre-allowed read/build/git operations for agents
- `_data/categories.yml` — single source of truth for category group → category mapping
- `_drafts/POST_TEMPLATE.md` — starter template with all front matter fields

### Changed
- `_layouts/home.html` — filter buttons, post card classification, and sidebar now loop over `site.data.categories` instead of hardcoded category lists; initial JS filter reads from data file; contact form CSS removed (moved to styles.css)
- `assets/styles.css` — contact form CSS appended here (was inline in home.html, now loads on all pages)
- `_includes/components/blog_post_card.html` — fixed `post.is_series` → `include.post.is_series` (series badge was never rendering); thumbnail now derived from `featured-image` if `featured-thumbnail` not set
- `_config.yml` — removed duplicate `google_docs_posts_folder_id` block; added note that `google-service-account.json` is stale and needs regeneration
- `netlify.toml` — removed `/* → /index.html` catch-all redirect (was masking all 404s with HTTP 200)
- `_plugins/google_docs_posts.rb` — plugin now respects `google_docs_posts_enabled` config flag
- `.gitignore` — added `**/.DS_Store`
- `_drafts/POST_TEMPLATE.md` — removed `featured-thumbnail` field; it is now derived automatically

### Removed
- `emoji_fix.js` — orphaned file; `getTopicEmoji` function is already defined inline in `quotes.md`
- `.DS_Store`, `assets/.DS_Store`, `assets/quote_profiles/.DS_Store` — untracked from git

### Regression notes
- **Netlify redirect removal**: URLs that previously silently redirected to the homepage now return real 404s. Verify no live links relied on that behaviour before deploying.
- **Contact form CSS relocation**: CSS now loads via `styles.css` (before layout inline styles) rather than after. Mitigated by `!important` throughout, but `default.html` has its own contact modal styles that now interact differently.
- **Thumbnail derivation**: Existing posts are unaffected (all have `featured-thumbnail` set). Future Google Docs posts that set `featured-image` but not `featured-thumbnail` will have the thumbnail derived as `*-sm.jpg` — that file must exist, and the derivation only handles `.jpg` extensions.
