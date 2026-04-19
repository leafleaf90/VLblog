#!/usr/bin/env node
/**
 * Scan _posts for http(s) featured-image / featured-thumbnail, download once,
 * write WebP under assets/post-media/<slug>/, patch front matter on disk.
 *
 * Invoked by Jekyll plugin remote_banner_sync (after Google Docs import) or manually:
 *   node scripts/sync-remote-banner-images.mjs
 *   node scripts/sync-remote-banner-images.mjs --site-root /path/to/repo
 *
 * Env (optional, set by Jekyll plugin):
 *   REMOTE_BANNER_SYNC_ALLOWED_HOSTS=images.unsplash.com,cdn.unsplash.com
 *     If set, only these hostnames may be fetched. If unset, any https URL is allowed.
 */

import { writeFile, readFile, readdir, mkdir, unlink } from "fs/promises";
import { join, basename } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { writeBannerWebpFromBuffer } from "./lib/write-banner-webp.mjs";
import {
  parseFrontMatterBlock,
  setYamlField,
  stripYamlField,
  extractFmValue,
  extractSlugFromFilename,
} from "./lib/banner-yaml.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  let siteRoot = join(__dirname, "..");
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--site-root") siteRoot = argv[++i];
  }
  return { siteRoot };
}

function isRemoteRef(value) {
  if (!value || typeof value !== "string") return false;
  const v = value.trim();
  return v.startsWith("https://") || v.startsWith("http://");
}

function slugFromFmOrFile(fm, filename) {
  const s = extractFmValue(fm, "slug");
  if (s && s.trim()) return s.trim();
  return extractSlugFromFilename(filename);
}

function allowedHostsFromEnv() {
  const raw = process.env.REMOTE_BANNER_SYNC_ALLOWED_HOSTS;
  if (!raw || !raw.trim()) return [];
  return raw.split(",").map((h) => h.trim()).filter(Boolean);
}

function urlAllowed(urlStr, hosts) {
  let u;
  try {
    u = new URL(urlStr);
  } catch {
    return false;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return false;
  if (hosts.length === 0) return u.protocol === "https:";
  return hosts.some((h) => u.hostname === h || u.hostname.endsWith("." + h));
}

function pickRemoteUrl(fm) {
  const fi = extractFmValue(fm, "featured-image");
  const ft = extractFmValue(fm, "featured-thumbnail");
  if (isRemoteRef(fi)) return fi.trim();
  if (isRemoteRef(ft)) return ft.trim();
  return null;
}

async function syncOnePost(absPath, repoRoot, allowedHosts) {
  const raw = await readFile(absPath, "utf8");
  const parsed = parseFrontMatterBlock(raw);
  if (!parsed) return false;

  const url = pickRemoteUrl(parsed.fm);
  if (!url) return false;

  if (!urlAllowed(url, allowedHosts)) {
    console.warn(
      `[RemoteBannerSync] Skip (URL not allowed): ${basename(absPath)} — ${url}`
    );
    return false;
  }

  const slug = slugFromFmOrFile(parsed.fm, basename(absPath));
  if (!slug) {
    console.warn(`[RemoteBannerSync] Skip (no slug): ${basename(absPath)}`);
    return false;
  }

  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "VLBLOG-sync-remote-banner-images/1.0 (Jekyll build)",
    },
  });
  if (!res.ok) {
    console.warn(
      `[RemoteBannerSync] HTTP ${res.status} for ${basename(absPath)}: ${url}`
    );
    return false;
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const { featured, thumb } = await writeBannerWebpFromBuffer(
    buf,
    repoRoot,
    slug
  );

  let fm = parsed.fm;
  fm = stripYamlField(fm, "banner_source_url");
  fm = setYamlField(fm, "featured-image", featured);
  fm = setYamlField(fm, "featured-thumbnail", thumb);
  fm = setYamlField(fm, "banner_source_url", url);

  const next = `---\n${fm}\n---\n${parsed.body}`;
  await writeFile(absPath, next, "utf8");

  console.log(
    `[RemoteBannerSync] ${basename(absPath)} → ${featured} (from ${url})`
  );
  return true;
}

async function main() {
  const { siteRoot } = parseArgs(process.argv);
  const postsDir = join(siteRoot, "_posts");
  const cacheDir = join(siteRoot, ".jekyll-cache");
  const changedFile = join(cacheDir, "remote_banner_changed.txt");

  await mkdir(cacheDir, { recursive: true });
  await writeFile(changedFile, "", "utf8");

  const allowedHosts = allowedHostsFromEnv();
  const names = await readdir(postsDir);
  const changed = [];

  for (const name of names) {
    if (!name.endsWith(".md") && !name.endsWith(".markdown")) continue;
    const absPath = join(postsDir, name);
    try {
      const ok = await syncOnePost(absPath, siteRoot, allowedHosts);
      if (ok) changed.push(join("_posts", name));
    } catch (e) {
      console.warn(`[RemoteBannerSync] ${name}: ${e.message}`);
    }
  }

  if (changed.length) {
    await writeFile(changedFile, changed.join("\n") + "\n", "utf8");
  } else {
    try {
      await unlink(changedFile);
    } catch {
      /* empty */
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
