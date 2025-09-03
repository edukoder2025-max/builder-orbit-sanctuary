#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";

const FILE = path.join(process.cwd(), "public", "data", "tutorials.json");

function readJson(): { tutorials: any[] } {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
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
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
function normalizeLanguage(
  s: string,
): "javascript" | "python" | "html" | "css" | "ts" | "node" {
  const x = (s || "").toLowerCase();
  if (["js", "javascript", "ecmascript"].includes(x)) return "javascript";
  if (["ts", "typescript"].includes(x)) return "ts";
  if (["py", "python"].includes(x)) return "python";
  if (["html", "html-css", "html5"].includes(x)) return "html";
  if (["css", "tailwind"].includes(x)) return "css";
  if (["node", "nodejs", "node.js"].includes(x)) return "node";
  return "javascript";
}

async function safeFetch(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return res;
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

async function main() {
  const endpointRaw = (process.env.GM_APY || "").trim();
  if (!endpointRaw || endpointRaw === "***") {
    console.log("GM_APY not set or masked (***), skipping tutorial generation.");
    return;
  }

  // Accept inputs without scheme by defaulting to https:// and then validate
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(endpointRaw);
  const candidate = hasScheme ? endpointRaw : `https://${endpointRaw}`;

  let endpoint = "";
  try {
    const u = new URL(candidate);
    // Basic hostname validation: allow localhost, IPs, or domains with a dot
    const host = u.hostname || "";
    const isLocalhost = host === "localhost";
    const isIp = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host);
    const hasDot = host.includes(".");
    if (!(isLocalhost || isIp || hasDot)) {
      console.log("GM_APY hostname looks invalid. Skipping tutorial generation.");
      return;
    }
    endpoint = u.toString();
  } catch {
    console.log(`GM_APY is not a valid URL: ***. Skipping.`);
    return;
  }

  const db = readJson();
  const map = new Map<string, any>(db.tutorials.map((t) => [t.slug, t]));

  // Try POST first (provider may accept prompts/options); fallback to GET
  let text = "";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    let res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "tutorials", limit: 50 }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      res = await safeFetch(endpoint);
    }
    text = await res.text();
  } catch (e) {
    try {
      const res = await safeFetch(endpoint);
      text = await res.text();
    } catch (inner) {
      console.log("Could not reach GM_APY endpoint. Skipping tutorial generation.");
      return;
    }
  }

  let items: any[] = [];
  try {
    const parsed = JSON.parse(text);
    items = Array.isArray(parsed)
      ? parsed
      : parsed.tutorials || parsed.items || parsed.data || [];
  } catch {
    items = text
      .split(/\n-{3,}\n/g)
      .map((s, i) => ({ title: `Minitutorial ${i + 1}`, content: s.trim() }));
  }

  for (const it of items) {
    const title = String(it.title || it.heading || "Minitutorial").trim();
    const slug = slugify(String(it.slug || title));
    const language = normalizeLanguage(String(it.language || it.lang || "javascript"));
    const nowIso = new Date().toISOString();
    const t = {
      slug,
      title,
      excerpt: String(it.excerpt || it.summary || ""),
      explain: String(it.explain || it.explanation || ""),
      content: String(it.content || it.code || ""),
      language,
      tags: Array.isArray(it.tags)
        ? it.tags
        : String(it.tags || "")
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
      date: String(it.date || nowIso),
    };
    map.set(slug, t);
  }

  const tutorials = Array.from(map.values()).sort((a, b) =>
    a.date < b.date ? 1 : -1,
  );
  writeJson({ tutorials });
  console.log(`Upserted ${items.length} tutorials. Total: ${tutorials.length}`);
}

main().catch(() => {
  // Ensure CI does not fail due to this optional step
  console.log("Tutorial generation finished with non-fatal errors. Skipping.");
  process.exitCode = 0;
});
