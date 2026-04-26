# Post Media Images

Use this convention for post hero images, thumbnails, and social preview images.

## Folder Pattern

Prefer slug-named folders for new post assets:

```text
assets/post-media/<post-slug>/
```

Standard generated files:

```text
assets/post-media/<post-slug>/header.webp
assets/post-media/<post-slug>/header-sm.webp
```

Older posts may still use date-named folders such as `assets/post-media/2026-04-26/`. That works because Jekyll only cares about the path in front matter, but slug-named folders are clearer when multiple posts are published on the same date.

## Front Matter

Use the optimized WebP files in post front matter:

```yaml
featured-image: "/assets/post-media/<post-slug>/header.webp"
featured-thumbnail: "/assets/post-media/<post-slug>/header-sm.webp"
```

`featured-image` is used for the post hero and social metadata. `featured-thumbnail` is used for smaller card/thumbnail contexts.

If a post has no custom image, omit these fields and let the site use the default social image.

## Standard Sizes

Generate two WebP variants:

| File | Size | Use |
|---|---:|---|
| `header.webp` | `1600x528` | main post hero and social image |
| `header-sm.webp` | `800x264` | thumbnails/cards |

Both use the same wide aspect ratio. Source images can be larger or a different aspect ratio; crop them intentionally during optimization.

## Optimize A Source Banner

When the user provides a source image such as:

```text
assets/post-media/<post-slug>/header.jpg
```

generate the two optimized WebP files with `sharp`:

```bash
node -e 'import sharp from "sharp"; const input="assets/post-media/<post-slug>/header.jpg"; const out="assets/post-media/<post-slug>"; await sharp(input).resize({ width: 1600, height: 528, fit: "cover", position: sharp.strategy.attention }).webp({ quality: 78, effort: 6 }).toFile(out + "/header.webp"); await sharp(input).resize({ width: 800, height: 264, fit: "cover", position: sharp.strategy.attention }).webp({ quality: 76, effort: 6 }).toFile(out + "/header-sm.webp");'
```

Notes:

- `fit: "cover"` keeps the output dimensions exact.
- `sharp.strategy.attention` usually gives a sensible crop for banners.
- Quality `78` for the large image and `76` for the small image is a good default balance.
- The project already has `sharp` in `package.json`; do not add a new image dependency for this.

## Verify The Output

Check dimensions after generating:

```bash
node -e 'import sharp from "sharp"; for (const file of ["assets/post-media/<post-slug>/header.webp", "assets/post-media/<post-slug>/header-sm.webp"]) { const meta = await sharp(file).metadata(); console.log(`${file}: ${meta.width}x${meta.height}, ${meta.format}`); }'
```

Expected output:

```text
assets/post-media/<post-slug>/header.webp: 1600x528, webp
assets/post-media/<post-slug>/header-sm.webp: 800x264, webp
```

Then run:

```bash
bundle exec jekyll build
```

The build should pass, and the rendered post should reference the optimized WebP paths in the post hero and social metadata.

## Cleanup

After verifying the generated files, delete the original large source image unless the user explicitly wants to keep it.

For example, delete:

```text
assets/post-media/<post-slug>/header.jpg
```

Keep:

```text
assets/post-media/<post-slug>/header.webp
assets/post-media/<post-slug>/header-sm.webp
```

Also remove incidental files such as `.DS_Store` if they appear in the media folder.
