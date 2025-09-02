#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "public", "blog");
const INDEX_FILE = path.join(BLOG_DIR, "index.json");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function tryReadHtmlMetadata(p: string) {
  try {
    const raw = fs.readFileSync(p, "utf8");
    const m = raw.match(/<script[^>]*id=["']article-metadata["'][^>]*>([\s\S]*?)<\/script>/i);
    if (m && m[1]) {
      const meta = JSON.parse(m[1].trim());
      return {
        slug: String(meta.slug || path.parse(p).name),
        title: String(meta.title || path.parse(p).name),
        date: String(meta.date || new Date().toISOString()),
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        excerpt: String(meta.excerpt || ""),
        imageUrl: String(meta.imageUrl || ""),
        imageAlt: String(meta.imageAlt || ""),
        author: String(meta.author || ""),
        link: String(meta.link || "/blog/" + path.parse(p).name + ".html"),
      };
    }
    const t = raw.match(/<title>([^<]+)<\/title>/i)?.[1] || path.parse(p).name;
    const d = raw.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1] || "";
    return {
      slug: path.parse(p).name,
      title: t,
      date: new Date().toISOString(),
      tags: [],
      excerpt: d,
      imageUrl: "",
      imageAlt: "",
      author: "",
      link: "/blog/" + path.parse(p).name + ".html",
    };
  } catch {
    return null;
  }
}

function buildIndex() {
  ensureDir(BLOG_DIR);
  const mdFiles = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  const htmlFiles = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".html"));

  const fromMd = mdFiles.map((file) => {
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
      imageUrl: "",
      imageAlt: "",
      author: "",
      link: "/blog/" + slug + ".md",
    };
  });

  const fromHtml = htmlFiles
    .map((file) => tryReadHtmlMetadata(path.join(BLOG_DIR, file)))
    .filter(Boolean) as any[];

  const map = new Map<string, any>();
  [...fromMd, ...fromHtml].forEach((a) => map.set(a.slug, a));
  const articles = Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1));

  fs.writeFileSync(INDEX_FILE, JSON.stringify({ articles }, null, 2));
  return articles.length;
}

const count = buildIndex();
console.log(`Indexed ${count} articles.`);
