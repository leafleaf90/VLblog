#!/usr/bin/env node
/**
 * Remove lingering white/light matte around a cutout (e.g. profile on hero).
 *
 * Strategy:
 * 1) Sample average RGB along the image border (assumes corners are background).
 * 2) Flood-fill from all border pixels: any pixel within --fuzz (Euclidean RGB distance)
 *    from that background becomes fully transparent.
 * 3) Edge soften: pixels still opaque but very close to white + low saturation, and
 *    touching transparent pixels, get alpha reduced (kills hair halo not reached by flood).
 *
 * Usage:
 *   npm run defringe -- --input assets/images/profile.png --output assets/images/profile-clean.png
 *   npm run defringe -- --input assets/images/profile.png --in-place
 *     (writes profile.backup.png then overwrites input)
 *
 * Tune if needed: --fuzz 55 --halo-lum 210 --halo-sat 55
 *
 * Dark-background cutouts also run: global neutral de-matte, bright fringe next to
 * transparency (kills 1–2px hair halos), and two haloCleanup passes.
 */

import sharp from "sharp";
import { copyFile, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..");

function parseArgs(argv) {
  let input = join(REPO, "assets/images/profile.png");
  let output;
  let inPlace = false;
  let fuzz = 52;
  let haloLum = 208;
  let haloSat = 56;
  let borderRing = 4;
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--input") input = join(REPO, argv[++i]);
    else if (a === "--output") output = join(REPO, argv[++i]);
    else if (a === "--in-place") inPlace = true;
    else if (a === "--fuzz") fuzz = Number(argv[++i], 10) || 52;
    else if (a === "--halo-lum") haloLum = Number(argv[++i], 10) || 236;
    else if (a === "--halo-sat") haloSat = Number(argv[++i], 10) || 42;
    else if (a === "--border") borderRing = Number(argv[++i], 10) || 4;
  }
  if (inPlace) output = input;
  else if (!output)
    output = input.replace(/(\.[^.]+)$/, "-defringed$1");
  return { input, output, inPlace, fuzz, haloLum, haloSat, borderRing };
}

function colorDist(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function sampleBorderBg(data, w, h, ring) {
  let sr = 0;
  let sg = 0;
  let sb = 0;
  let n = 0;
  const add = (x, y) => {
    const o = (y * w + x) * 4;
    sr += data[o];
    sg += data[o + 1];
    sb += data[o + 2];
    n++;
  };
  for (let x = 0; x < w; x++) {
    for (let t = 0; t < ring; t++) {
      add(x, t);
      add(x, h - 1 - t);
    }
  }
  for (let y = 0; y < h; y++) {
    for (let t = 0; t < ring; t++) {
      add(t, y);
      add(w - 1 - t, y);
    }
  }
  return [sr / n, sg / n, sb / n];
}

function floodTransparent(data, w, h, bg, fuzz) {
  const visited = new Uint8Array(w * h);
  const q = [];
  const idx = (x, y) => y * w + x;
  const tryPush = (x, y) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const i = idx(x, y);
    if (visited[i]) return;
    const o = i * 4;
    const d = colorDist(data[o], data[o + 1], data[o + 2], bg[0], bg[1], bg[2]);
    if (d > fuzz) return;
    visited[i] = 1;
    data[o + 3] = 0;
    q.push([x, y]);
  };
  for (let x = 0; x < w; x++) {
    for (let t = 0; t < Math.min(2, h); t++) {
      tryPush(x, t);
      tryPush(x, h - 1 - t);
    }
  }
  for (let y = 0; y < h; y++) {
    for (let t = 0; t < Math.min(2, w); t++) {
      tryPush(t, y);
      tryPush(w - 1 - t, y);
    }
  }
  let qi = 0;
  while (qi < q.length) {
    const [x, y] = q[qi++];
    tryPush(x + 1, y);
    tryPush(x - 1, y);
    tryPush(x, y + 1);
    tryPush(x, y - 1);
  }
}

function haloCleanup(data, w, h, lumMin, satMax) {
  const alpha0 = (x, y) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return false;
    return data[(y * w + x) * 4 + 3] === 0;
  };
  const hasTransparentNeighbor = (x, y) => {
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (dx === 0 && dy === 0) continue;
        if (alpha0(x + dx, y + dy)) return true;
      }
    }
    return false;
  };
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const o = (y * w + x) * 4;
      if (data[o + 3] === 0) continue;
      if (!hasTransparentNeighbor(x, y)) continue;
      const r = data[o];
      const g = data[o + 1];
      const b = data[o + 2];
      const mx = Math.max(r, g, b);
      const mn = Math.min(r, g, b);
      const lum = (r + g + b) / 3;
      const sat = mx - mn;
      if (lum >= lumMin && sat <= satMax) {
        const t = Math.min(1, (lum - lumMin) / (255 - lumMin));
        data[o + 3] = Math.round(data[o + 3] * (1 - 0.92 * t));
      }
    }
  }
}

/**
 * Hard-kill obvious matte: bright + grayish + touches transparency (hair JPEG edge).
 */
function killBrightFringeTouchingTransparent(data, w, h) {
  const alpha0 = (x, y) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return false;
    return data[(y * w + x) * 4 + 3] === 0;
  };
  const hasTransparentNeighbor = (x, y) => {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (dx === 0 && dy === 0) continue;
        if (alpha0(x + dx, y + dy)) return true;
      }
    }
    return false;
  };
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const o = (y * w + x) * 4;
      if (data[o + 3] === 0) continue;
      if (!hasTransparentNeighbor(x, y)) continue;
      const r = data[o];
      const g = data[o + 1];
      const b = data[o + 2];
      const mx = Math.max(r, g, b);
      const mn = Math.min(r, g, b);
      const lum = (r + g + b) / 3;
      const sat = mx - mn;
      if (mn >= 105 && lum >= 168 && sat <= 62) {
        data[o + 3] = 0;
      }
    }
  }
}

/**
 * When the image border is already dark (hero on navy), white halos are not
 * connected to the border flood. Remove neutral "paper white" pixels anywhere.
 */
function globalNeutralWhiteDeMatte(data, w, h, lumMin, satMax) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      if (data[o + 3] === 0) continue;
      const r = data[o];
      const g = data[o + 1];
      const b = data[o + 2];
      const mx = Math.max(r, g, b);
      const mn = Math.min(r, g, b);
      const lum = (r + g + b) / 3;
      const sat = mx - mn;
      if (lum < lumMin || sat > satMax) continue;
      const t = Math.min(1, (lum - lumMin) / Math.max(1, 255 - lumMin));
      const keep = 1 - 0.94 * t * t;
      data[o + 3] = Math.max(0, Math.round(data[o + 3] * keep));
    }
  }
}

async function main() {
  const { input, output, inPlace, fuzz, haloLum, haloSat, borderRing } =
    parseArgs(process.argv);

  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const buf = Buffer.from(data);

  const bg = sampleBorderBg(buf, w, h, borderRing);
  console.log("Sampled border background (avg RGB):", bg.map((v) => v.toFixed(1)));

  floodTransparent(buf, w, h, bg, fuzz);

  const borderLum = (bg[0] + bg[1] + bg[2]) / 3;
  if (borderLum < 90) {
    console.log(
      "Dark border detected — applying neutral white / low-sat de-matte for halos."
    );
    globalNeutralWhiteDeMatte(buf, w, h, 222, 44);
    globalNeutralWhiteDeMatte(buf, w, h, 214, 52);
    killBrightFringeTouchingTransparent(buf, w, h);
  }

  haloCleanup(buf, w, h, haloLum, haloSat);
  haloCleanup(buf, w, h, Math.max(180, haloLum - 18), Math.min(68, haloSat + 8));

  if (inPlace) {
    const backupPath = input.replace(/(\.[^.]+)$/, ".backup$1");
    await copyFile(input, backupPath);
    console.log("Backup:", backupPath);
  }

  await mkdir(dirname(output), { recursive: true });
  await sharp(buf, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(output);

  console.log("Wrote:", output);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
