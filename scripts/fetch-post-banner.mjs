#!/usr/bin/env node
/**
 * Fetch a remote banner image, write optimized JPEGs under assets/post-media/<slug>/,
 * and print front matter lines for Jekyll.
 *
 * Usage:
 *   npm install
 *   npm run banner -- --slug ai-consumption-fatigue --url "https://images.unsplash.com/photo-...?w=1600&q=80"
 *
 * Unsplash: use URLs you are allowed to hotlink/download; keep attribution in the post body.
 * CI: do not run this in Netlify unless you commit outputs — prefer running locally then git add.
 */

import sharp from "sharp";
import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

function parseArgs(argv) {
  let slug;
  let url;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--slug") slug = argv[++i];
    else if (argv[i] === "--url") url = argv[++i];
  }
  return { slug, url };
}

async function main() {
  const { slug, url } = parseArgs(process.argv);
  if (!slug || !url) {
    console.error(
      "Usage: npm run banner -- --slug <post-slug> --url <https://...>\n" +
        "Example:\n" +
        '  npm run banner -- --slug ai-consumption-fatigue --url "https://images.unsplash.com/photo-xxx?w=1920&q=80"'
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

  const mainPath = join(outDir, "header.jpg");
  const thumbPath = join(outDir, "header-sm.jpg");

  await sharp(input)
    .rotate()
    .resize({
      width: 1600,
      height: 900,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(mainPath);

  await sharp(input)
    .rotate()
    .resize({
      width: 720,
      height: 405,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(thumbPath);

  const featured = `/assets/post-media/${slug}/header.jpg`;
  const thumb = `/assets/post-media/${slug}/header-sm.jpg`;

  console.log("\nWrote:\n ", mainPath, "\n ", thumbPath);
  console.log("\n--- Paste into post front matter ---\n");
  console.log(`featured-image: "${featured}"`);
  console.log(`featured-thumbnail: "${thumb}"`);
  console.log("\n--- (optional) record source for re-fetch ---\n");
  console.log(`# banner_source_url: "${url}"`);
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
