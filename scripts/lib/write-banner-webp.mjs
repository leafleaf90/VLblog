/**
 * Shared: resize downloaded raster to hero + thumb WebP under assets/post-media/<slug>/
 */
import sharp from "sharp";
import { mkdir } from "fs/promises";
import { join } from "path";

export async function writeBannerWebpFromBuffer(
  inputBuffer,
  repoRoot,
  slug,
  { maxW = 1600, thumbW = 720 } = {}
) {
  const outDir = join(repoRoot, "assets", "post-media", slug);
  await mkdir(outDir, { recursive: true });

  const heroWebp = join(outDir, "header.webp");
  const thumbWebp = join(outDir, "header-sm.webp");

  const box = (w) => ({
    width: w,
    height: Math.round((w * 9) / 16),
    fit: "inside",
    withoutEnlargement: true,
  });

  await sharp(inputBuffer)
    .rotate()
    .resize(box(maxW))
    .webp({ quality: 82, effort: 5 })
    .toFile(heroWebp);

  await sharp(inputBuffer)
    .rotate()
    .resize(box(thumbW))
    .webp({ quality: 80, effort: 5 })
    .toFile(thumbWebp);

  return {
    heroPath: heroWebp,
    thumbPath: thumbWebp,
    featured: `/assets/post-media/${slug}/header.webp`,
    thumb: `/assets/post-media/${slug}/header-sm.webp`,
  };
}
