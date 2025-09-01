# Workflow de GitHub para crear minitutoriales por lenguaje

Este proyecto carga los minitutoriales desde `public/data/tutorials.json`. Cada tarjeta tiene botón "Ver ejemplo" que abre un modal con la descripción y el código.

## Qué hará el Action
- Llamará a la API privada `GM_APY` (secreto en GitHub) para obtener nuevos minitutoriales.
- Normalizará cada item al formato:
```json
{
  "slug": "js-fetch-basico",
  "title": "...",
  "excerpt": "...",
  "explain": "Descripción de cómo se compone el código (paso a paso)",
  "content": "...",
  "language": "javascript|python|html|css|ts|node",
  "tags": ["..."],
  "date": "ISO-8601"
}
```
- Insertará/actualizará `public/data/tutorials.json` (merge por `slug`).
- El sitio mostrará automáticamente las nuevas tarjetas en:
  - /tutoriales (todas)
  - /tutoriales/javascript, /tutoriales/python, /tutoriales/html-css, /tutoriales/node, /tutoriales/typescript

### Instrucciones para el prompt de generación (recomendado)
Incluye en el prompt al proveedor (GM_APY) lo siguiente:
- Genera minitutoriales cortos con: título, excerpt de 1–2 líneas, explain con 3–6 pasos que describan la composición del código, y el código de ejemplo listo para copiar.
- Devuelve también el lenguaje ("javascript", "python", "html", "css", "ts" o "node"), tags y una fecha ISO.
- Mantén el explain en texto plano legible (sin HTML), con listas numeradas o párrafos.

## Pasos para configurarlo
1) Mover el workflow a la carpeta de Actions (ACL nos impidió hacerlo automáticamente):
   - Copia `ci/generate-articles.yml` a `.github/workflows/generate-articles.yml`.

2) En tu repo en GitHub ve a Settings → Secrets and variables → Actions → New repository secret:
   - Nombre: `GM_APY`
   - Valor: URL de tu API que devuelve minitutoriales.

3) Ajusta el generador para minitutoriales (opcional):
   - Si tu API devuelve campos distintos, edita `scripts/generate-articles.ts` y crea un script similar `scripts/generate-tutorials.ts` que escriba en `public/data/tutorials.json` con el formato anterior.

4) Ejecuta el workflow:
   - Actions → "Generate Articles" → Run workflow.
   - También corre en cron semanal: `0 8 * * 1` (lunes 08:00 UTC).

## Ejemplo de script para actualizar `tutorials.json`
Crea `scripts/generate-tutorials.ts` (similar al de artículos):
```ts
import fs from 'node:fs';
import path from 'node:path';

const FILE = path.join(process.cwd(), 'public', 'data', 'tutorials.json');
function readJson() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return { tutorials: [] }; } }
function writeJson(data:any){ fs.writeFileSync(FILE, JSON.stringify(data,null,2)); }
function slugify(s:string){return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');}

async function main(){
  const res = await fetch(process.env.GM_APY!);
  const incoming = await res.json(); // Normaliza a array
  const db = readJson();
  const bySlug = new Map(db.tutorials.map((t:any)=>[t.slug,t]));
  for (const it of incoming){
    const title = String(it.title||'Minitutorial');
    const slug = slugify(it.slug||title);
    const lang = String(it.language||'javascript').toLowerCase();
    const t = {
      slug,
      title,
      excerpt: String(it.excerpt||it.summary||''),
      content: String(it.content||''),
      language: lang as any,
      tags: Array.isArray(it.tags)? it.tags : [],
      date: new Date().toISOString(),
    };
    bySlug.set(slug, t); // upsert
  }
  writeJson({ tutorials: Array.from(bySlug.values()) });
}
main();
```
Luego añade un paso al workflow después de instalar dependencias:
```yaml
- name: Generate tutorials
  env:
    GM_APY: ${{ secrets.GM_APY }}
  run: pnpm tsx scripts/generate-tutorials.ts
```
Eso actualizará `public/data/tutorials.json` y el sitio renderizará las nuevas tarjetas con su modal.
