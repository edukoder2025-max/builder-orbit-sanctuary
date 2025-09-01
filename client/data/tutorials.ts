export type Tutorial = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  language: "javascript" | "python" | "html" | "css" | "ts" | "node";
  tags: string[];
  date: string; // ISO
};

export const categories = [
  { slug: "javascript", name: "JavaScript" },
  { slug: "python", name: "Python" },
  { slug: "html-css", name: "HTML/CSS" },
  { slug: "node", name: "Node.js" },
  { slug: "typescript", name: "TypeScript" },
  { slug: "api", name: "APIs" },
];

export const tutorials: Tutorial[] = [
  {
    slug: "js-fetch-basico",
    title: "Cómo hacer un fetch en JavaScript",
    excerpt:
      "Aprende a consumir una API con fetch y manejar respuestas y errores de forma sencilla.",
    content: `fetch('https://api.example.com/users')\n  .then(r => { if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })\n  .then(data => console.log(data))\n  .catch(err => console.error(err));`,
    language: "javascript",
    tags: ["api", "fetch", "promesas"],
    date: new Date().toISOString(),
  },
  {
    slug: "py-validar-email",
    title: "Validar un email en Python",
    excerpt:
      "Usa expresiones regulares para comprobar si un email tiene un formato válido.",
    content:
      "" +
      "import re\n" +
      "pattern = r'^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'\n" +
      "def es_email(s: str) -> bool:\n" +
      "    return re.match(pattern, s) is not None\n" +
      "print(es_email('hola@ejemplo.com'))\n",
    language: "python",
    tags: ["regex", "validación", "strings"],
    date: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    slug: "html-centrar-div",
    title: "Centrar un div con CSS",
    excerpt: "Dos formas modernas: grid y flexbox, con soporte amplio.",
    content:
      ".center { display: grid; place-items: center; min-height: 100vh; }\n/* o */\n.wrapper { display:flex; align-items:center; justify-content:center; min-height:100vh; }",
    language: "css",
    tags: ["css", "layout", "flexbox", "grid"],
    date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    slug: "ts-tipos-basicos",
    title: "Tipos básicos en TypeScript",
    excerpt: "Declara tipos para variables y funciones para evitar errores en tiempo de compilación.",
    content:
      "type User = { id:number; name:string }\nconst u: User = { id: 1, name: 'Ana' }\nfunction square(n: number): number { return n*n }",
    language: "ts",
    tags: ["typescript", "tipos", "funciones"],
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    slug: "node-express-api",
    title: "API mínima con Express",
    excerpt: "Crea una ruta GET y devuelve JSON desde Node.js con Express.",
    content:
      "import express from 'express'\nconst app = express()\napp.get('/api/ping', (req,res)=> res.json({ ok:true }))\napp.listen(3000)\n",
    language: "node",
    tags: ["node", "express", "api"],
    date: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
  {
    slug: "js-arrays-map",
    title: "Map sobre arrays",
    excerpt: "Transforma cada elemento de un array de forma sencilla con Array.prototype.map.",
    content: "const arr = [1,2,3]\nconst dobles = arr.map(n => n*2)\nconsole.log(dobles)",
    language: "javascript",
    tags: ["arrays", "map", "funcional"],
    date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
];
