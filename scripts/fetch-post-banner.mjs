#!/usr/bin/env node
/**
 * Download a remote banner, write compressed WebP (+ optional JPEG) under
 * assets/post-media/<slug>/, print front matter lines for Jekyll.
 *
 * Usage:
 *   npm install
 *   npm run banner -- --slug ai-consumption-fatigue --url "https://images.unsplash.com/photo-...?w=1600&q=80"
 *
 * Optional:
 *   --post _posts/2026-04-19-ai-consumption-fatigue.md   (default: find by slug in _posts)
 *   --write-yaml        patch featured-image / featured-thumbnail / banner_source_url
 *   --dry-run           with --write-yaml: print diff only, do not write post file
 *   --jpeg              also write header.jpg + header-sm.jpg (YAML still uses WebP)
 *   --max 1600          max width for hero (default 1600)
 *   --thumb 720         max width for card thumb (default 720)
 *
 * Unsplash: only use images you are licensed to use; keep attribution in the post when required.
 */

import sharp from "sharp";
import { mkdir, writeFile, readFile, readdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { writeBannerWebpFromBuffer } from "./lib/write-banner-webp.mjs";
import {
  escapeRegex,
  setYamlField,
  stripYamlField,
} from "./lib/banner-yaml.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const POSTS_DIR = join(REPO_ROOT, "_posts");

function parseArgs(argv) {
  const out = {
    slug: undefined,
    url: undefined,
    post: undefined,
    writeYaml: false,
    dryRun: false,
    jpeg: false,
    max: 1600,
    thumb: 720,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--slug") out.slug = argv[++i];
    else if (a === "--url") out.url = argv[++i];
    else if (a === "--post") out.post = argv[++i];
    else if (a === "--write-yaml") out.writeYaml = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--jpeg") out.jpeg = true;
    else if (a === "--max") out.max = Number(argv[++i], 10) || 1600;
    else if (a === "--thumb") out.thumb = Number(argv[++i], 10) || 720;
  }
  return out;
}

async function resolvePostPath(slug, explicitPost) {
  if (explicitPost) {
    const p = explicitPost.startsWith("/")
      ? explicitPost
      : join(REPO_ROOT, explicitPost);
    return p;
  }
  const names = await readdir(POSTS_DIR);
  const slugRe = new RegExp(
    `^slug:\\s*["']?${escapeRegex(slug)}["']?\\s*$`,
    "m"
  );
  for (const name of names) {
    if (!name.endsWith(".md") && !name.endsWith(".markdown")) continue;
    const p = join(POSTS_DIR, name);
    const raw = await readFile(p, "utf8");
    if (!raw.startsWith("---")) continue;
    const end = raw.indexOf("\n---\n", 4);
    if (end === -1) continue;
    const fm = raw.slice(4, end);
    if (slugRe.test(fm)) return p;
  }
  for (const name of names) {
    if (name.includes(slug)) return join(POSTS_DIR, name);
  }
  return null;
}

async function patchPostFrontMatter(
  postPath,
  { featuredImage, featuredThumbnail, bannerSourceUrl, dryRun }
) {
  const raw = await readFile(postPath, "utf8");
  if (!raw.startsWith("---")) {
    console.error("Post file has no YAML front matter:", postPath);
    process.exit(1);
  }
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) {
    console.error("Could not find closing --- for front matter:", postPath);
    process.exit(1);
  }
  let fm = raw.slice(4, end);
  fm = stripYamlField(fm, "banner_source_url");
  fm = setYamlField(fm, "featured-image", featuredImage);
  fm = setYamlField(fm, "featured-thumbnail", featuredThumbnail);
  fm = setYamlField(fm, "banner_source_url", bannerSourceUrl);
  const body = raw.slice(end + 5);
  const updated = `---\n${fm}\n---\n${body}`;
  if (dryRun) {
    console.log("\n--- dry-run: would write front matter ---\n");
    console.log(fm);
    console.log("\n--- end ---\n");
    return;
  }
  await writeFile(postPath, updated, "utf8");
  console.log("\nUpdated front matter in:", postPath);
}

async function main() {
  const {
    slug,
    url,
    post: postArg,
    writeYaml,
    dryRun,
    jpeg,
    max: maxW,
    thumb: thumbW,
  } = parseArgs(process.argv);

  if (!slug || !url) {
    console.error(
      "Usage: npm run banner -- --slug <post-slug> --url <https://...> [options]\n" +
        "Options:\n" +
        "  --post _posts/2026-04-19-ai-consumption-fatigue.md\n" +
        "  --write-yaml [--dry-run]\n" +
        "  --jpeg              (also write .jpg siblings)\n" +
        "  --max 1600 --thumb 720\n"
    );
    process.exit(1);
  }

  const res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "VLBLOG-fetch-post-banner/1.0 (local authoring)" },
  });
  if (!res.ok) {
    console.error(`Download failed: HTTP ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const input = Buffer.from(await res.arrayBuffer());
  const outDir = join(REPO_ROOT, "assets", "post-media", slug);
  await mkdir(outDir, { recursive: true });

  const { featured, thumb } = await writeBannerWebpFromBuffer(
    input,
    REPO_ROOT,
    slug,
    { maxW, thumbW }
  );

  const paths = [join(outDir, "header.webp"), join(outDir, "header-sm.webp")];

  if (jpeg) {
    const heroJpg = join(outDir, "header.jpg");
    const thumbJpg = join(outDir, "header-sm.jpg");
    await sharp(input)
      .rotate()
      .resize({
        width: maxW,
        height: Math.round((maxW * 9) / 16),
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(heroJpg);
    await sharp(input)
      .rotate()
      .resize({
        width: thumbW,
        height: Math.round((thumbW * 9) / 16),
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(thumbJpg);
    paths.push(heroJpg, thumbJpg);
  }

  console.log("\nWrote:\n", paths.join("\n "));
  console.log("\n--- Front matter (WebP) ---\n");
  console.log(`featured-image: "${featured}"`);
  console.log(`featured-thumbnail: "${thumb}"`);
  console.log(`banner_source_url: "${url}"`);
  console.log("");

  if (writeYaml) {
    const postPath = await resolvePostPath(slug, postArg);
    if (!postPath) {
      console.error(
        "Could not resolve post file. Pass --post _posts/your-file.md"
      );
      process.exit(1);
    }
    await patchPostFrontMatter(postPath, {
      featuredImage: featured,
      featuredThumbnail: thumb,
      bannerSourceUrl: url,
      dryRun,
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
