#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";

const BLOG_DIR = path.join(process.cwd(), "public", "blog");
const INDEX_FILE = path.join(BLOG_DIR, "index.json");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readIndex(): { articles: any[] } {
  try {
    return JSON.parse(fs.readFileSync(INDEX_FILE, "utf8"));
  } catch {
    return { articles: [] };
  }
}

function writeIndex(data: { articles: any[] }) {
  fs.writeFileSync(INDEX_FILE, JSON.stringify(data, null, 2));
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function randomTopic() {
  const topics = [
    "optimización de rendimiento en React",
    "buenas prácticas en TypeScript",
    "patrones de diseño en JavaScript",
    "testing con Vitest",
    "hooks avanzados en React",
    "ruteo con React Router",
    "accesibilidad web",
    "CSS moderno con Tailwind",
    "seguridad en aplicaciones web",
    "arquitectura front-end escalable",
  ];
  return topics[Math.floor(Math.random() * topics.length)];
}

const PROMPT = `Escribe un artículo original de programación, apto para Google AdSense, en español, sobre {{TOPIC}}.
Incluye:
- Introducción clara.
- 3–5 secciones con subtítulos (h2) y listas cuando sea útil.
- 1 bloque de código breve y explicativo.
- Recomendaciones prácticas y conclusiones.
Tono didáctico, concreto. Sin relleno, ni contenido repetido. Extensión 600–900 palabras.`;

async function fetchFromProvider(prompt: string) {
  const endpoint = process.env.GM_APY;
  if (!endpoint) return null;
  try {
    let res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) {
      res = await fetch(endpoint);
    }
    const text = await res.text();
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed[0] ?? null;
      if (parsed && typeof parsed === "object") {
        const arr = (parsed.articles || parsed.items || parsed.data || []).filter(Boolean);
        if (arr.length) return arr[0];
        return parsed;
      }
    } catch {
      return { title: "Artículo de programación", content: text };
    }
  } catch {
    return null;
  }
  return null;
}

function localArticle(topic: string) {
  const title = `Guía práctica: ${topic}`;
  const paragraphs = [
    `En este artículo exploramos ${topic} con un enfoque práctico y ejemplos claros que puedes aplicar de inmediato en tus proyectos.`,
    `Para empezar, define objetivos medibles y establece una base sólida: estructura del proyecto, convenciones y herramientas que permitan mantener el código limpio y predecible.`,
    `A continuación, crea pequeñas unidades de trabajo y verifica resultados con pruebas automatizadas. Ajusta gradualmente para mejorar legibilidad, rendimiento y seguridad.`,
    `Cierra con una breve revisión del impacto: mide, documenta y comparte aprendizajes para consolidar buenas prácticas en el equipo.`,
  ];
  const code = `// Ejemplo breve\nfunction ejemplo() {\n  return "Hola, buenas prácticas";\n}`;
  const content = `
<h2>Introducción</h2>
<p>${paragraphs[0]}</p>
<h2>Fundamentos</h2>
<p>${paragraphs[1]}</p>
<h2>Iteración y validación</h2>
<p>${paragraphs[2]}</p>
<pre><code>${code}</code></pre>
<h2>Conclusiones</h2>
<p>${paragraphs[3]}</p>
`;
  const excerpt = `${paragraphs[0]}`.slice(0, 180);
  return { title, content, excerpt, tags: ["programación", "frontend" ] };
}

async function fetchPexelsImage(query: string) {
  const key = process.env.PEXELS_API || process.env.PEXELS_API_KEY || process.env.PEXELS;
  if (!key) {
    return { url: "/placeholder.svg", alt: "Imagen de programación" };
  }
  try {
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "15");
    url.searchParams.set("orientation", "landscape");
    const res = await fetch(url, { headers: { Authorization: key } });
    if (!res.ok) throw new Error(String(res.status));
    const data: any = await res.json();
    const photos = Array.isArray(data.photos) ? data.photos : [];
    if (!photos.length) return { url: "/placeholder.svg", alt: "Imagen de programación" };
    const pick = photos[Math.floor(Math.random() * photos.length)];
    const src = pick.src?.landscape || pick.src?.large || pick.src?.original || "/placeholder.svg";
    const alt = pick.alt || `Foto relacionada con ${query}`;
    return { url: src, alt };
  } catch {
    return { url: "/placeholder.svg", alt: "Imagen de programación" };
  }
}

function htmlTemplate(params: {
  title: string;
  author: string;
  date: string;
  content: string;
  imageUrl: string;
  imageAlt: string;
  excerpt: string;
  slug: string;
  tags: string[];
}) {
  const { title, author, date, content, imageUrl, imageAlt, excerpt, slug, tags } = params;
  const jsonLd = {
    slug,
    title,
    date,
    excerpt,
    tags,
    imageUrl,
    imageAlt,
    author,
    link: `/blog/${slug}.html`,
  };
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${excerpt}" />
  <meta name="author" content="${author}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${excerpt}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${excerpt}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <script type="application/ld+json" id="article-metadata">${JSON.stringify(jsonLd)}</script>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, "Apple Color Emoji", "Segoe UI Emoji"; margin: 0; padding: 0; line-height: 1.6; color: #111827; background: #fff; }
    header { max-width: 960px; margin: 0 auto; padding: 24px 16px 0; }
    .by { color: #2563eb; font-weight: 600; font-size: 12px; letter-spacing: .04em; text-transform: uppercase; }
    h1 { font-size: 34px; line-height: 1.2; margin: 6px 0 8px; }
    .meta { color: #6b7280; font-size: 14px; }
    .cover { width: 100%; height: 320px; object-fit: cover; display: block; margin-top: 12px; }
    main { max-width: 720px; margin: 0 auto; padding: 24px 16px 48px; }
    h2 { font-size: 22px; margin-top: 28px; }
    pre { background: #0b1020; color: #e5e7eb; padding: 14px; border-radius: 8px; overflow: auto; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    p { margin: 12px 0; }
    footer { max-width: 720px; margin: 0 auto 80px; padding: 0 16px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <header>
    <div class="by">creado por edukoder</div>
    <h1>${title}</h1>
    <div class="meta">${new Date(date).toLocaleDateString("es-ES")} • ${tags.join(", ")}</div>
    <img src="${imageUrl}" alt="${imageAlt}" class="cover" />
  </header>
  <main>
    ${content}
  </main>
  <footer>
    © ${new Date(date).getFullYear()} edukoder
  </footer>
</body>
</html>`;
}

async function main() {
  ensureDir(BLOG_DIR);

  const topic = randomTopic();
  const prompt = PROMPT.replace("{{TOPIC}}", topic);

  const provider = await fetchFromProvider(prompt);
  const base = provider ?? localArticle(topic);

  const title = String(base.title || `Artículo sobre ${topic}`);
  const slug = slugify(title + " " + Date.now());
  const date = new Date().toISOString();
  const content = String(base.content || "");
  const excerpt = String(base.excerpt || content.replace(/<[^>]+>/g, "").slice(0, 180));
  const tags = Array.isArray(base.tags)
    ? base.tags
    : String(base.tags || "programación, frontend")
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);

  const { url: imageUrl, alt: imageAlt } = await fetchPexelsImage(`programación ${topic}`);

  const html = htmlTemplate({
    title,
    author: "creado por edukoder",
    date,
    content,
    imageUrl,
    imageAlt,
    excerpt,
    slug,
    tags,
  });

  const outFile = path.join(BLOG_DIR, `${slug}.html`);
  fs.writeFileSync(outFile, html, "utf8");

  const idx = readIndex();
  const map = new Map(idx.articles.map((a) => [a.slug, a]));
  map.set(slug, {
    slug,
    title,
    date,
    tags,
    excerpt,
    imageUrl,
    imageAlt,
    author: "creado por edukoder",
    link: `/blog/${slug}.html`,
  });
  writeIndex({ articles: Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1)) });

  console.log(`Generated article: ${title} -> ${outFile}`);
}

main().catch((err) => {
  console.error("Failed to generate article:", err);
  process.exitCode = 0;
});
