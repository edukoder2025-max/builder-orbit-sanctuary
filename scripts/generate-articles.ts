#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";

const BLOG_DIR = path.join(process.cwd(), "public", "blog");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function writeMarkdown({
  title,
  content,
  tags,
  excerpt,
}: {
  title: string;
  content: string;
  tags: string[];
  excerpt: string;
}) {
  const slug = slugify(title);
  const date = new Date().toISOString();
  const fm = `---\ntitle: ${title}\ndate: ${date}\ntags: [${tags.map((t) => `\"${t}\"`).join(", ")}]\nexcerpt: ${excerpt}\n---`;
  const body = `${fm}\n\n${content}\n`;
  const file = path.join(BLOG_DIR, `${slug}.md`);
  fs.writeFileSync(file, body, "utf8");
  return { slug, title, date, tags, excerpt };
}

async function main() {
  ensureDir(BLOG_DIR);
  const endpoint = process.env.GM_APY;
  if (!endpoint) {
    console.log("GM_APY not set, skipping article generation.");
    return;
  }
  try {
    const res = await fetch(endpoint);
    const text = await res.text();
    let articles: any[] = [];
    try {
      const parsed = JSON.parse(text);
      articles = Array.isArray(parsed) ? parsed : parsed.articles || [];
    } catch {
      const parts = text
        .split(/\n-{3,}\n/g)
        .map((s) => s.trim())
        .filter(Boolean);
      articles = parts.map((p, i) => ({
        title: `Artículo ${i + 1}`,
        content: p,
        tags: ["general"],
        excerpt: p.slice(0, 160),
      }));
    }
    const created = articles.slice(0, 10).map((a) => {
      const title = String(a.title || "Artículo");
      const content = String(a.content || a.body || "");
      const tags = Array.isArray(a.tags)
        ? a.tags
        : String(a.tags || "")
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean);
      const excerpt = String(a.excerpt || a.summary || content.slice(0, 160));
      return writeMarkdown({ title, content, tags, excerpt });
    });
    console.log(`Generated ${created.length} articles.`);
  } catch (err) {
    console.error("Failed to generate articles:", err);
    process.exitCode = 0; // Does not fail the workflow; index is updated later
  }
}

main();
