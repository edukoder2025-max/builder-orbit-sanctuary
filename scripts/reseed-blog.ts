#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import dotenv from "dotenv";

dotenv.config();

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "public", "blog");
const INDEX_FILE = path.join(BLOG_DIR, "index.json");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getTsxBin() {
  const bin = process.platform === "win32" ? "tsx.cmd" : "tsx";
  const local = path.join(ROOT, "node_modules", ".bin", bin);
  return fs.existsSync(local) ? local : bin; // fallback to global
}

function quote(s: string) {
  if (process.platform !== "win32") return s;
  if (/\s|[&|<>^]/.test(s)) return `"${s.replace(/"/g, '\\"')}"`;
  return s;
}

function runTsx(scriptRelPath: string, args: string[] = []) {
  const tsxBin = getTsxBin();
  const scriptPath = path.join(ROOT, scriptRelPath);

  if (process.platform === "win32") {
    const cmd = `${quote(tsxBin)} ${quote(scriptPath)} ${args.map(quote).join(" ")}`.trim();
    const res = spawnSync(cmd, {
      stdio: "inherit",
      env: process.env,
      cwd: ROOT,
      shell: true,
    });
    if (res.error) throw res.error;
    if (typeof res.status === "number" && res.status !== 0) {
      throw new Error(`Command failed: ${cmd} (exit ${res.status})`);
    }
    return;
  }

  const res = spawnSync(tsxBin, [scriptPath, ...args], {
    stdio: "inherit",
    env: process.env,
    cwd: ROOT,
    shell: false,
  });
  if (res.error) throw res.error;
  if (typeof res.status === "number" && res.status !== 0) {
    throw new Error(`Command failed: ${tsxBin} ${scriptPath} (exit ${res.status})`);
  }
}

function parseArgs(argv: string[]) {
  const out: { clean: boolean; count: number; retrofit: boolean } = { clean: false, count: 3, retrofit: false };
  for (const a of argv.slice(2)) {
    if (a === "--clean") out.clean = true;
    else if (a === "--retrofit") out.retrofit = true;
    else if (a.startsWith("--count=")) out.count = Math.max(0, parseInt(a.split("=")[1] || "3", 10) || 3);
  }
  return out;
}

function cleanBlog() {
  ensureDir(BLOG_DIR);
  const files = fs.readdirSync(BLOG_DIR);
  for (const f of files) {
    if (f.endsWith('.html') || f.endsWith('.md')) {
      fs.unlinkSync(path.join(BLOG_DIR, f));
    }
  }
  if (fs.existsSync(INDEX_FILE)) fs.unlinkSync(INDEX_FILE);
}

const FAVICON_SVG = "<link rel=\"icon\" type=\"image/svg+xml\" href=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%23ffffff'/%3E%3Ctext x='16' y='46' font-family='Segoe UI,Inter,Arial,sans-serif' font-weight='800' font-size='36' fill='%230ea5e9'%3EE%3C/text%3E%3Ctext x='34' y='46' font-family='Segoe UI,Inter,Arial,sans-serif' font-weight='800' font-size='36' fill='%23111827'%3EK%3C/text%3E%3C/svg%3E\" />";
const FAVICON_ICO = "<link rel=\"shortcut icon\" href=\"/favicon.ico\" />";
const ADS_META = "<meta name=\"google-adsense-account\" content=\"ca-pub-5704376838710588\" />";
const ADS_SCRIPT = "<script async src=\"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5704376838710588\" crossorigin=\"anonymous\"></script>";

function retrofitHtmlHead(html: string): string {
  const hasHead = /<head[^>]*>/i.test(html);
  if (!hasHead) return html; 

  let updated = html;
  const headCloseIdx = updated.search(/<\/head>/i);
  if (headCloseIdx === -1) return html;

  const headOpenIdx = updated.search(/<head[^>]*>/i);
  const headContent = updated.slice(headOpenIdx, headCloseIdx);

  const needsFaviconSvg = !/rel=["']icon["'][^>]*image\/svg\+xml/i.test(headContent);
  const needsFaviconIco = !/rel=["']shortcut icon["']/i.test(headContent);
  const needsAdsMeta = !/name=["']google-adsense-account["']/i.test(headContent);
  const needsAdsScript = !/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/i.test(headContent);

  const inject = [
    needsFaviconSvg ? FAVICON_SVG : "",
    needsFaviconIco ? FAVICON_ICO : "",
    needsAdsMeta ? ADS_META : "",
    needsAdsScript ? ADS_SCRIPT : "",
  ].filter(Boolean).join("\n");

  if (!inject) return html;

  updated = updated.replace(/<\/head>/i, `${inject}\n</head>`);
  return updated;
}

function retrofitAllBlogHtml() {
  ensureDir(BLOG_DIR);
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.toLowerCase().endsWith('.html'));
  let touched = 0;
  for (const f of files) {
    const full = path.join(BLOG_DIR, f);
    const original = fs.readFileSync(full, 'utf8');
    const retro = retrofitHtmlHead(original);
    if (retro !== original) {
      fs.writeFileSync(full, retro, 'utf8');
      touched++;
    }
  }
  console.log(`Retrofit complete. Updated ${touched} file(s).`);
}

async function main() {
  ensureDir(BLOG_DIR);

  const { clean, count, retrofit } = parseArgs(process.argv);
  console.log(`Reseed blog: clean=${clean} count=${count} retrofit=${retrofit}`);

  if (clean) {
    console.log("Cleaning blog directory and index.json...");
    cleanBlog();
  }

  if (!process.env.PEXELS_API_KEY && !process.env.PEXELS_API && !process.env.PEXELS && !process.env.NEXT_PUBLIC_PEXELS_API_KEY) {
    console.warn("[warn] No Pexels API key found in env (.env). Image selection will use placeholder.");
  }
  if (!process.env.GM_APY) {
    console.warn("[warn] No GM_APY endpoint configured. Falling back to local article template.");
  }

  if (count > 0) {
    console.log(`Generating ${count} article(s)...`);
    for (let i = 0; i < count; i++) {
      runTsx(path.join("scripts", "generate-articles.ts"));
    }

    console.log("Rebuilding blog index...");
    runTsx(path.join("scripts", "update-blog-index.ts"));
  }

  if (retrofit || count === 0) {
    console.log("Retrofitting existing article HTML heads (favicon + AdSense)...");
    retrofitAllBlogHtml();
  }

  console.log("Done reseeding blog.");
}

main().catch((err) => {
  console.error("Reseed failed:", err);
  process.exit(1);
});
