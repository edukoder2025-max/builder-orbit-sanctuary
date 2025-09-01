#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

const FILE = path.join(process.cwd(), 'public', 'data', 'tutorials.json');

function readJson(): { tutorials: any[] } {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    return { tutorials: [] };
  }
}
function writeJson(data: any) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}
function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
function normalizeLanguage(s: string): 'javascript'|'python'|'html'|'css'|'ts'|'node' {
  const x = (s || '').toLowerCase();
  if (['js','javascript','ecmascript'].includes(x)) return 'javascript';
  if (['ts','typescript'].includes(x)) return 'ts';
  if (['py','python'].includes(x)) return 'python';
  if (['html'].includes(x)) return 'html';
  if (['css'].includes(x)) return 'css';
  if (['node','nodejs','node.js'].includes(x)) return 'node';
  return 'javascript';
}

async function main() {
  const endpoint = process.env.GM_APY;
  if (!endpoint) {
    console.log('GM_APY not set, skipping tutorial generation.');
    return;
  }
  const db = readJson();
  const map = new Map<string, any>(db.tutorials.map((t) => [t.slug, t]));

  const res = await fetch(endpoint);
  const text = await res.text();
  let items: any[] = [];
  try {
    const parsed = JSON.parse(text);
    items = Array.isArray(parsed) ? parsed : (parsed.tutorials || parsed.items || []);
  } catch {
    items = text.split(/\n-{3,}\n/g).map((s, i) => ({ title: `Minitutorial ${i+1}`, content: s.trim() }));
  }

  for (const it of items) {
    const title = String(it.title || it.heading || 'Minitutorial');
    const slug = slugify(String(it.slug || title));
    const language = normalizeLanguage(String(it.language || 'javascript'));
    const nowIso = new Date().toISOString();
    const t = {
      slug,
      title,
      excerpt: String(it.excerpt || it.summary || ''),
      explain: String(it.explain || it.explanation || ''),
      content: String(it.content || it.code || ''),
      language,
      tags: Array.isArray(it.tags) ? it.tags : String(it.tags || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      date: String(it.date || nowIso),
    };
    map.set(slug, t);
  }

  const tutorials = Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
  writeJson({ tutorials });
  console.log(`Upserted ${items.length} tutorials. Total: ${tutorials.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 0; // don't fail the workflow
});
