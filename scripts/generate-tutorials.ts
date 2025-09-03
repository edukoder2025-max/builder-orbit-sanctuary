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

function looksLikeUrl(s: string) {
  if (!s) return false;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(s)) return true;
  return /[./]/.test(s); // contains dot or slash
}

function extractJsonFromText(t: string): any | null {
  try {
    return JSON.parse(t);
  } catch {}
  const m = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (m) {
    try {
      return JSON.parse(m[1]);
    } catch {}
  }
  return null;
}

async function generateFromGoogle({ apiKey, model, limit }: { apiKey: string; model: string; limit: number }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const prompt = `Genera ${limit} minitutoriales de programación variados como JSON puro en español con el siguiente formato:
[
  {
    "title": "...",
    "excerpt": "...",
    "explain": "Descripción paso a paso",
    "content": "<código copiable>",
    "language": "javascript|python|html|css|ts|node",
    "tags": ["..."],
    "date": "ISO-8601"
  }
]
Solo responde con JSON válido. Evita texto adicional.`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  } as any;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!r.ok) throw new Error(`Google API error: ${r.status}`);
    const data = (await r.json()) as any;
    // Try to extract text
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = extractJsonFromText(text) ?? [];
    return Array.isArray(parsed) ? parsed : parsed?.tutorials || [];
  } catch (e) {
    clearTimeout(timeout);
    console.error("Google generation failed:", (e as Error).message);
    return [];
  }
}

async function main() {
  const endpointRaw = (process.env.GM_APY_TUTORIALS || process.env.GM_APY || "").trim();
  if (!endpointRaw || endpointRaw === "***") {
    console.log("GM_APY_TUTORIALS/GM_APY not set or masked (***), skipping tutorial generation.");
    return;
  }

  const db = readJson();
  const map = new Map<string, any>(db.tutorials.map((t) => [t.slug, t]));

  let items: any[] = [];

  if (looksLikeUrl(endpointRaw)) {
    // URL mode (existing behavior)
    const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(endpointRaw);
    const candidate = hasScheme ? endpointRaw : `https://${endpointRaw}`;

    let endpoint = "";
    try {
      endpoint = new URL(candidate).toString();
    } catch {
      console.log(`GM_APY_TUTORIALS/GM_APY is not a valid URL: ***. Skipping.`);
      return;
    }

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
    } catch {
      const res = await safeFetch(endpoint);
      text = await res.text();
    }

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
  } else {
    // API key mode → Google Generative Language API
    const apiKey = endpointRaw;
    const model = (process.env.GM_MODEL || "gemini-1.5-flash-8b").trim();
    const limit = Math.max(1, Math.min(50, Number(process.env.GM_LIMIT || 10)));
    items = await generateFromGoogle({ apiKey, model, limit });
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

main().catch((e) => {
  console.error(e);
  process.exitCode = 0; // don't fail the workflow
});
