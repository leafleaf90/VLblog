# SEO/GEO TODO

Follow-up ideas from the SEO/GEO audit. These are intentionally not all implemented in the first pass.

## Content Quality

- Rewrite short post descriptions so each one explains the problem, audience, and outcome.
- Add "What you'll learn" sections to practical/tutorial posts where it helps scanning and generative summaries.
- Add more contextual internal links inside post bodies, especially between related Jekyll, Vue, Nuxt, Firebase, and productivity posts.
- Add `updated_date` to older technical posts when they are reviewed and still accurate.

## Topic Architecture

- Add topic landing pages for strong clusters:
  - Jekyll
  - Nuxt
  - Vue
  - Firebase
  - JavaScript
  - Productivity
  - Digital minimalism
  - AI/tools
- Link topic pages from the blog archive, post metadata, and sidebar/category UI.
- Consider adding short topic introductions that explain why the topic appears on this site and which posts are best starting points.

## Structured Data

- Add image width/height front matter to older posts with custom featured images after verifying the source dimensions.
- Consider `Article`/`TechArticle` subtype testing for tutorial-heavy posts. Current `BlogPosting` is safe and broadly supported.
- Consider adding `sameAs` links for GitHub/LinkedIn/Mastodon if those profiles are public and intended to represent the author entity.

## Technical SEO

- Externalize the contact modal JavaScript if the base layout keeps growing.
- Review Core Web Vitals after the scroll-driven profile animation is deployed, especially on mobile.
- Add more explicit dimensions to post body images where layout shift appears.
- Review old remote image paths and convert important remaining JPEG/PNG post media to local optimized WebP.

## Feeds And Discovery

- Review RSS feed title/description output after the new blog archive and newsletter signup are live.
- Consider linking the Buttondown archive more visibly from the newsletter block or footer.
- Submit the cleaned sitemap in Google Search Console after deploy.
