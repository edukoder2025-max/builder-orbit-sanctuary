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

function isGoogleApiKey(v: string) {
  return /^AIza[0-9A-Za-z_\-]{20,}$/.test(v.trim());
}

function extractFirstJsonBlock(text: string): string {
  const fence = /```json\n([\s\S]*?)```/i.exec(text);
  if (fence && fence[1]) return fence[1].trim();
  const braceStart =
    text.indexOf("[") >= 0 ? text.indexOf("[") : text.indexOf("{");
  const braceEnd = Math.max(text.lastIndexOf("]"), text.lastIndexOf("}"));
  if (braceStart >= 0 && braceEnd > braceStart)
    return text.slice(braceStart, braceEnd + 1).trim();
  return text.trim();
}

async function fetchFromGemini(key: string, prompt: string, limit: number) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(key)}`;
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${prompt}\n\nRequisitos de salida estrictos:\n- Devuelve SOLO JSON válido (no incluyas comentarios ni backticks).\n- Estructura: {\n  \"tutorials\": [\n    { \"title\": string, \"excerpt\": string, \"explain\": string, \"content\": string, \"language\": \"javascript|python|html|css|ts|node\", \"tags\": string[], \"date\": string }\n  ]\n}\n- Genera exactamente ${limit} items.\n- language debe ser uno de: javascript, python, html, css, ts, node.\n- date en formato ISO-8601.`,
          },
        ],
      },
    ],
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const data = (await res.json()) as any;
    const textParts: string[] = [];
    const candidates = Array.isArray(data?.candidates) ? data.candidates : [];
    for (const c of candidates) {
      const parts = c?.content?.parts || [];
      for (const p of parts)
        if (typeof p?.text === "string") textParts.push(p.text);
    }
    if (textParts.length === 0) throw new Error("Gemini response empty");
    return textParts.join("\n\n");
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

async function main() {
<<<<<<< HEAD
  const endpointRaw = (process.env.GM_APY_TUTORIALS || process.env.GM_APY || "").trim();
  if (!endpointRaw || endpointRaw === "***") {
    console.log("GM_APY_TUTORIALS/GM_APY not set or masked (***), skipping tutorial generation.");
=======
  const raw = (process.env.GM_APY || "").trim();
  if (!raw || raw === "***") {
    console.log(
      "GM_APY not set or masked (***), skipping tutorial generation.",
    );
>>>>>>> f476a8f321a7dd85e31c7a7ef48ccd73828e8abd
    return;
  }

  const limit = Math.min(
    Math.max(parseInt(String(process.env.GM_LIMIT || "20"), 10) || 20, 1),
    100,
  );
  const defaultPrompt =
    "Genera una lista de minitutoriales de programación prácticos y breves para principiantes e intermedios. Cada item debe incluir un título claro, un resumen, una explicación paso a paso y un bloque de código copiable (content). Alterna entre los lenguajes: javascript, ts, python, html, css y node. Añade 2-4 tags relevantes por item. Evita repeticiones. Contexto educativo: site edukoder.com.";
  const userPrompt = (process.env.GM_PROMPT || defaultPrompt).trim();

<<<<<<< HEAD
  let endpoint = "";
  try {
    endpoint = new URL(candidate).toString();
  } catch {
    console.log(`GM_APY_TUTORIALS/GM_APY is not a valid URL: ***. Skipping.`);
=======
  let text = "";

  if (isGoogleApiKey(raw)) {
    try {
      const aiText = await fetchFromGemini(raw, userPrompt, limit);
      text = extractFirstJsonBlock(aiText);
    } catch (e) {
      console.log("Gemini request failed. Skipping tutorial generation.");
      return;
    }
  } else {
    console.log(
      "GM_APY must be a valid Google API key (starts with AIza). Skipping.",
    );
>>>>>>> f476a8f321a7dd85e31c7a7ef48ccd73828e8abd
    return;
  }

  const db = readJson();
  const map = new Map<string, any>(db.tutorials.map((t) => [t.slug, t]));

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
    const language = normalizeLanguage(
      String(it.language || it.lang || "javascript"),
    );
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
  console.log("Tutorial generation finished with non-fatal errors. Skipping.");
  process.exitCode = 0;
});
