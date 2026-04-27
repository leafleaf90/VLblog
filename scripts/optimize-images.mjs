#!/usr/bin/env node
/**
 * Convert raster images to WebP with sharp (strip metadata, optional downscale).
 * Optional: build 1200×630 WebP for Open Graph. Default fit is `cover` (full frame, center crop);
 * use `--social-fit contain` to letterbox (e.g. a square headshot with colored bars).
 *
 * Examples:
 *   npm run optimize-images -- assets/images/profile_new.png
 *   npm run optimize-images -- assets/images/foo.png assets/images/bar.jpg
 *   npm run optimize-images -- assets/images/profile_new.png --social-card assets/images/og-default.webp
 *   npm run optimize-images -- assets/images/wide_og.png --social-card assets/images/wide-og-1200.webp --social-fit cover
 *
 * Flags:
 *   --quality <1-100>   WebP quality (default: 92)
 *   --max <px>         If the longest edge exceeds this, scale down (default: 1600; 0 = no cap)
 *   --social-card PATH After processing inputs, write one 1200×630 OG image from the first input
 *   --social-fit <mode>  With --social-card: "cover" (center crop, fills 1200×630) or "contain" (letterbox; default cover)
 *   --bg R,G,B         Letterbox background for --social-card in contain mode (default: 0,0,0)
 */

import { stat } from "fs/promises";
import { basename, dirname, extname, join, resolve } from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const REPO = join(__dirname, "..");
const OG_W = 1200;
const OG_H = 630;

function parseArgs(argv) {
  const files = [];
  let quality = 92;
  let maxEdge = 1600;
  let socialCard = null;
  let socialFit = "cover";
  let bg = { r: 0, g: 0, b: 0 };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--quality") {
      quality = Number(argv[++i]);
      continue;
    }
    if (a === "--max") {
      maxEdge = Number(argv[++i]);
      continue;
    }
    if (a === "--social-card") {
      socialCard = argv[++i];
      continue;
    }
    if (a === "--social-fit" || a === "--card-fit") {
      const m = (argv[++i] || "").toLowerCase();
      if (m === "cover" || m === "contain") socialFit = m;
      continue;
    }
    if (a === "--bg") {
      const parts = argv[++i].split(",").map((x) => Number(x.trim()));
      if (parts.length === 3 && parts.every((n) => Number.isFinite(n)))
        bg = { r: parts[0], g: parts[1], b: parts[2] };
      continue;
    }
    if (a.startsWith("-")) {
      console.error(`Unknown flag: ${a}`);
      process.exit(1);
    }
    files.push(join(REPO, a));
  }
  return { files, quality, maxEdge, socialCard, socialFit, bg };
}

const RASTER = new Set([".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff"]);

async function optimizeOne(absPath, { quality, maxEdge }) {
  const ext = extname(absPath).toLowerCase();
  if (!RASTER.has(ext)) {
    console.warn(`Skip (unsupported type): ${absPath}`);
    return;
  }

  const dir = dirname(absPath);
  const base = basename(absPath, ext);
  const outPath = join(dir, `${base}.webp`);
  if (resolve(absPath) === resolve(outPath)) {
    console.log(`Skip (already WebP at output path): ${basename(outPath)}`);
    return;
  }

  let pipeline = sharp(absPath).rotate();

  const meta = await pipeline.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const long = Math.max(w, h);
  if (maxEdge > 0 && long > maxEdge) {
    pipeline = pipeline.resize({
      width: w >= h ? maxEdge : undefined,
      height: h > w ? maxEdge : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  await pipeline.webp({ quality, effort: 6 }).toFile(outPath);

  const inStat = (await stat(absPath)).size;
  const outStat = (await stat(outPath)).size;
  console.log(
    `${basename(absPath)} → ${basename(outPath)} (${(inStat / 1024).toFixed(0)} KB → ${(outStat / 1024).toFixed(0)} KB)`,
  );
}

async function writeSocialCard(absPath, outPath, { quality, socialFit, bg }) {
  const fit = socialFit === "cover" ? "cover" : "contain";
  const pipeline = sharp(absPath).rotate().resize(OG_W, OG_H, {
    fit,
    position: "centre",
    ...(fit === "contain"
      ? { background: { ...bg, alpha: 1 } }
      : {}),
  });

  await pipeline
    .webp({ quality: Math.min(quality, 90), effort: 6 })
    .toFile(join(REPO, outPath));

  const bytes = (await stat(join(REPO, outPath))).size;
  console.log(
    `Social card ${outPath} (${OG_W}×${OG_H}, ${fit}) → ${(bytes / 1024).toFixed(0)} KB`,
  );
}

async function main() {
  const { files, quality, maxEdge, socialCard, socialFit, bg } = parseArgs(
    process.argv,
  );
  if (files.length === 0) {
    console.error(
      "Usage: node scripts/optimize-images.mjs <path-from-repo-root> [...] [--flags]\n" +
        "Example: npm run optimize-images -- assets/images/profile_new.png --social-card assets/images/og-default.webp",
    );
    process.exit(1);
  }
  if (quality < 1 || quality > 100) {
    console.error("--quality must be 1-100");
    process.exit(1);
  }

  for (const f of files) {
    await optimizeOne(f, { quality, maxEdge });
  }

  if (socialCard) {
    const relOut = socialCard.replace(/^\//, "");
    await writeSocialCard(files[0], relOut, { quality, socialFit, bg });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
