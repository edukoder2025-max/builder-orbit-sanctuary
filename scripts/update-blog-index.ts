#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "public", "blog");
const INDEX_FILE = path.join(BLOG_DIR, "index.json");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function buildIndex() {
  ensureDir(BLOG_DIR);
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  const articles = files
    .map((file) => {
      const p = path.join(BLOG_DIR, file);
      const raw = fs.readFileSync(p, "utf8");
      const { data, content } = matter(raw);
      const slug = path.parse(file).name;
      return {
        slug,
        title: String(data.title || slug),
        date: String(data.date || new Date().toISOString()),
        tags: Array.isArray(data.tags) ? data.tags : [],
        excerpt: String(data.excerpt || content.slice(0, 160)),
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  fs.writeFileSync(INDEX_FILE, JSON.stringify({ articles }, null, 2));
  return articles.length;
}

const count = buildIndex();
console.log(`Indexed ${count} articles.`);
