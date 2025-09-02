#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const SITE = process.env.SITE_URL || 'https://edukoder.com';

function walk(dir: string, list: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, list);
    } else {
      list.push(full);
    }
  }
  return list;
}

function toUrl(rel: string): string {
  const webPath = rel.replace(/\\/g, '/');
  if (webPath === 'index.html') return SITE + '/';
  return SITE + '/' + webPath;
}

function generate() {
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  const files = walk(PUBLIC_DIR)
    .filter(f => f.toLowerCase().endsWith('.html'))
    .sort();

  const urls = files.map(f => {
    const rel = path.relative(PUBLIC_DIR, f);
    const stat = fs.statSync(f);
    const lastmod = stat.mtime.toISOString();
    return { loc: toUrl(rel), lastmod };
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n  </url>`).join('\n') +
`\n</urlset>\n`;

  const outFile = path.join(PUBLIC_DIR, 'sitemap.xml');
  fs.writeFileSync(outFile, xml, 'utf8');
  console.log(`Sitemap written: ${path.relative(ROOT, outFile)} (${urls.length} urls)`);
}

generate();
