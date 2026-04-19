/** Shared YAML line helpers for post front matter patches */

export function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function setYamlField(block, key, value) {
  const lines = block.split("\n");
  const keyRe = new RegExp(`^(${escapeRegex(key)}):\\s.*$`);
  let found = false;
  const next = lines.map((line) => {
    if (keyRe.test(line)) {
      found = true;
      return `${key}: "${value}"`;
    }
    return line;
  });
  if (!found) next.push(`${key}: "${value}"`);
  return next.join("\n");
}

export function stripYamlField(block, key) {
  const keyRe = new RegExp(`^${escapeRegex(key)}:\\s.*$`);
  return block
    .split("\n")
    .filter((line) => !keyRe.test(line))
    .join("\n");
}

export function parseFrontMatterBlock(raw) {
  if (!raw || !raw.startsWith("---")) return null;
  const n = raw.replace(/\r\n/g, "\n");
  const end = n.indexOf("\n---\n", 4);
  if (end !== -1) {
    return {
      fm: n.slice(4, end),
      body: n.slice(end + 5),
    };
  }
  // Closing --- at EOF without a following newline (Jekyll accepts this; indexOf("\n---\n") misses it)
  const m = n.match(/^---\n([\s\S]*?)\n---\s*$/);
  if (m) {
    return { fm: m[1], body: "" };
  }
  return null;
}

/** Read a single `key: value` line from a front matter block (key may contain hyphens). */
export function extractFmValue(fm, key) {
  const re = new RegExp(`^${escapeRegex(key)}:\\s*(.*)$`, "m");
  const m = fm.match(re);
  if (!m) return null;
  let v = m[1].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v;
}

export function extractSlugFromFilename(basename) {
  const m = basename.match(/^\d{4}-\d{2}-\d{2}-(.+)\.(md|markdown)$/i);
  return m ? m[1] : basename.replace(/\.(md|markdown)$/i, "");
}
