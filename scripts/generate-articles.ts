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
  const categories = {
    'JavaScript': [
      'Patrones de diseño avanzados en JavaScript moderno y su aplicación práctica',
      'Manejo de asincronía en JavaScript: Callbacks, Promesas y Async/Await',
      'Optimización de rendimiento en aplicaciones JavaScript a gran escala',
      'TypeScript avanzado: Tipos genéricos, utilidades y patrones avanzados',
      'Gestión de estado global en aplicaciones JavaScript: Comparativa de soluciones',
      'Programación funcional en JavaScript: Conceptos y patrones avanzados',
      'Web Workers y JavaScript multihilo: Mejorando el rendimiento',
      'JavaScript moderno: Nuevas características de ES2023 y más allá'
    ],
    'Frontend': [
      'Arquitectura de aplicaciones frontend escalables: Patrones y mejores prácticas',
      'Técnicas avanzadas de CSS Grid y Flexbox para diseños complejos',
      'Accesibilidad web avanzada: Más allá de los estándares WCAG',
      'Microfrontends: Estrategias de implementación y casos de uso reales',
      'Renderizado del lado del servidor (SSR) vs Generación de sitios estáticos (SSG)',
      'Web Components: Creando bibliotecas de componentes reutilizables',
      'Animaciones web avanzadas con CSS y JavaScript',
      'Progressive Web Apps (PWA) avanzadas: Estrategias de almacenamiento y sincronización'
    ],
    'React': [
      'Patrones avanzados de React: Render props, HOCs y Custom Hooks',
      'Optimización de rendimiento en aplicaciones React a gran escala',
      'Gestión de estado avanzada con Context API y useReducer',
      'Server Components en React 18: Una guía completa',
      'Testing avanzado en aplicaciones React: Estrategias y herramientas',
      'Microfrontends con React: Implementación y mejores prácticas',
      'React Concurrent Features: Una guía práctica',
      'Patrones de diseño avanzados en aplicaciones empresariales con React'
    ],
    'Backend': [
      'Arquitectura de microservicios: Diseño e implementación con Node.js',
      'Autenticación y autorización avanzadas en APIs RESTful',
      'Buenas prácticas de seguridad en APIs: Más allá de lo básico',
      'Patrones de diseño para APIs escalables y mantenibles',
      'Manejo avanzado de errores y logging en producción',
      'Optimización de consultas SQL y NoSQL para alto rendimiento',
      'Arquitectura orientada a eventos con Node.js y Kafka',
      'Monitoreo y telemetría en aplicaciones backend'
    ],
    'DevOps': [
      'CI/CD avanzado con GitHub Actions: Pipelines complejas y mejores prácticas',
      'Kubernetes para desarrolladores: De principiante a experto',
      'Infraestructura como código con Terraform: Patrones avanzados',
      'Monitoreo y observabilidad en entornos de producción',
      'Estrategias avanzadas de despliegue: Blue/Green, Canary y más',
      'Seguridad en el pipeline de CI/CD: Mejores prácticas',
      'Optimización de contenedores Docker: Tamaño, seguridad y rendimiento',
      'Automatización de pruebas en entornos de integración continua'
    ],
    'Cloud Computing': [
      'Arquitecturas serverless avanzadas con AWS Lambda',
      'Diseño de sistemas altamente disponibles en la nube',
      'Estrategias de migración a la nube: De monolito a microservicios',
      'Seguridad en la nube: Mejores prácticas y patrones',
      'Optimización de costos en la nube: Estrategias avanzadas',
      'Arquitecturas híbridas: Combinando on-premise y nube',
      'Automatización de infraestructura en la nube',
      'Machine Learning en la nube: Implementación y despliegue'
    ],
    'Inteligencia Artificial': [
      'Implementación de modelos de IA en producción: Desafíos y soluciones',
      'Aprendizaje automático con JavaScript: TensorFlow.js y más',
      'Procesamiento del lenguaje natural (NLP) en aplicaciones web',
      'Computer vision en el navegador: Posibilidades y limitaciones',
      'Ética en IA: Consideraciones prácticas para desarrolladores',
      'Optimización de modelos de IA para entornos con recursos limitados',
      'Aprendizaje por refuerzo: Conceptos y aplicaciones prácticas',
      'Generación de código asistida por IA: Estado actual y futuro'
    ],
    'Seguridad Informática': [
      'Seguridad en aplicaciones web: OWASP Top 10 en profundidad',
      'Hacking ético para desarrolladores: Técnicas avanzadas',
      'Protección contra ataques de inyección: Más allá de los ORMs',
      'Seguridad en APIs: Autenticación, autorización y auditoría',
      'Protección de datos sensibles en aplicaciones web',
      'Seguridad en aplicaciones serverless: Riesgos y mitigaciones',
      'Análisis estático de código para identificar vulnerabilidades',
      'Seguridad en la cadena de suministro de software'
    ],
    'Arquitectura de Software': [
      'Arquitecturas limpias: Principios y patrones avanzados',
      'Domain-Driven Design (DDD) en aplicaciones empresariales',
      'Arquitectura hexagonal: Implementación práctica',
      'Event Sourcing y CQRS: Cuándo y cómo implementarlos',
      'Arquitecturas reactivas: Patrones y anti-patrones',
      'Diseño de sistemas distribuidos: Desafíos y soluciones',
      'Arquitectura basada en microservicios: De la teoría a la práctica',
      'Patrones de resiliencia en sistemas distribuidos'
    ],
    'Bases de Datos': [
      'Diseño de esquemas para bases de datos relacionales a gran escala',
      'Patrones de acceso a datos: Repository, DAO y más',
      'Optimización de consultas SQL avanzada',
      'Bases de datos NoSQL: Cuándo usarlas y mejores prácticas',
      'Bases de datos en tiempo real: Firebase, Supabase y alternativas',
      'Migración de bases de datos: Estrategias y herramientas',
      'Bases de datos distribuidas: Conceptos y patrones',
      'Modelado de datos para aplicaciones de análisis y BI'
    ],
    'Testing y Calidad': [
      'Estrategias de testing en aplicaciones modernas',
      'Testing de rendimiento: Herramientas y técnicas avanzadas',
      'Pruebas de integración: Estrategias y mejores prácticas',
      'Test-driven development (TDD) en el mundo real',
      'Contrato de pruebas: Estrategias para microservicios',
      'Automatización de pruebas de UI: Patrones y anti-patrones',
      'Pruebas de carga y estrés: Más allá de lo básico',
      'Calidad del código: Métricas y herramientas de análisis estático'
    ],
    'Metodologías Ágiles': [
      'Scrum avanzado: Técnicas para equipos de alto rendimiento',
      'Kanban en equipos de desarrollo: Más allá del tablero',
      'DevOps y Agile: Integrando prácticas ágiles en operaciones',
      'Gestión de productos digitales: De la idea al despliegue',
      'Agile a escala: SAFe, LeSS y otros marcos',
      'Métricas ágiles: Más allá de la velocidad',
      'Transformación ágil: Retos y estrategias',
      'Agile UX: Integrando diseño y desarrollo ágil'
    ]
  };
  
  const category = Object.keys(categories)[Math.floor(Math.random() * Object.keys(categories).length)];
  const topics = categories[category as keyof typeof categories];
  return topics[Math.floor(Math.random() * topics.length)];
}

const PROMPT = `Escribe un artículo técnico detallado y completo sobre "{{TOPIC}}" con un mínimo de 2000 palabras. El artículo debe seguir esta estructura detallada:

# {{TITLE}}

## Introducción (300-400 palabras)
- Contexto completo del tema y su relevancia actual en la industria
- Objetivos claros del artículo
- Breve descripción de lo que aprenderá el lector
- Importancia del dominio del tema para desarrolladores

## Fundamentos Teóricos (400-500 palabras)
- Explicación profunda de los conceptos fundamentales
- Terminología clave con definiciones claras
- Bases teóricas necesarias para entender el tema
- Diagramas o ejemplos conceptuales cuando sea apropiado

## Implementación Práctica (600-800 palabras)
- Guía paso a paso con ejemplos de código detallados
- Explicación línea por línea del código cuando sea necesario
- Mejores prácticas y patrones recomendados
- Consideraciones de rendimiento y optimización
- Manejo de errores y casos límite

## Casos de Uso del Mundo Real (300-400 palabras)
- Ejemplos de aplicaciones prácticas
- Estudios de caso relevantes
- Lecciones aprendidas de implementaciones reales
- Problemas comunes y cómo solucionarlos

## Optimización y Buenas Prácticas (300-400 palabras)
- Técnicas avanzadas de optimización
- Seguridad y consideraciones de privacidad
- Escalabilidad y mantenibilidad
- Herramientas y recursos recomendados

## Conclusión (200-300 palabras)
- Resumen de puntos clave
- Pasos siguientes y recursos para profundizar
- Invitación a la discusión y preguntas
- Llamado a la acción (suscribirse, dejar comentarios, etc.)

## Recursos Adicionales
- Enlaces a documentación oficial
- Libros recomendados
- Cursos y tutoriales relacionados
- Herramientas útiles

### Requisitos Adicionales:
1. El artículo debe tener un tono profesional pero accesible
2. Incluir al menos 3 bloques de código bien documentados
3. Usar ejemplos prácticos y realistas
4. Incluir metáforas o analogías para explicar conceptos complejos
5. Mencionar herramientas y bibliotecas relevantes
6. Incluir consejos prácticos y trucos profesionales
7. Proporcionar referencias y enlaces a fuentes confiables
8. Optimizado para SEO con palabras clave relevantes
9. Estructurado con encabezados jerárquicos (H2, H3, H4)
10. Incluir preguntas frecuentes cuando sea apropiado

El contenido debe ser original, detallado y de alto valor para desarrolladores profesionales. Evita contenido genérico o superficial.`;

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
        const arr = (
          parsed.articles ||
          parsed.items ||
          parsed.data ||
          []
        ).filter(Boolean);
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
  const title = `Guía completa: ${topic}`;
  const slug = slugify(title + ' ' + Date.now());
  const date = new Date().toISOString();
  
  // Generate a more comprehensive article structure
  const sections = [
    {
      title: 'Introducción',
      content: `
        <p>En el mundo del desarrollo de software moderno, ${topic.toLowerCase()} se ha convertido en un aspecto fundamental para garantizar la calidad, seguridad y mantenibilidad de nuestras aplicaciones. Este artículo tiene como objetivo proporcionarte una guía completa y práctica sobre este tema crucial.</p>
        <p>A lo largo de este artículo, exploraremos los conceptos fundamentales, mejores prácticas y ejemplos concretos que te permitirán dominar ${topic.toLowerCase()} en tus proyectos de desarrollo.</p>
      `
    },
    {
      title: 'Conceptos Fundamentales',
      content: `
        <p>Antes de sumergirnos en la implementación, es esencial comprender los conceptos clave relacionados con ${topic.toLowerCase()}:</p>
        <ul>
          <li><strong>Definición</strong>: Explicación clara del concepto principal.</li>
          <li><strong>Importancia</strong>: Por qué este tema es relevante en el desarrollo actual.</li>
          <li><strong>Beneficios</strong>: Ventajas de implementar correctamente estas prácticas.</li>
          <li><strong>Desafíos comunes</strong>: Problemas frecuentes y cómo abordarlos.</li>
        </ul>
      `
    },
    {
      title: 'Implementación Práctica',
      content: `
        <p>Vamos a ver un ejemplo práctico de cómo implementar ${topic.toLowerCase()} en un proyecto real:</p>
        <pre><code class="language-javascript">// Ejemplo de implementación
const implementar${topic.replace(/\s+/g, '')} = (parametros) => {
  // Código de ejemplo
  console.log("Implementando: " + "${topic}");
  
  // Lógica principal
  const resultado = {
    exito: true,
    mensaje: "${topic} implementado correctamente",
    timestamp: new Date().toISOString()
  };
  
  return resultado;
};

// Uso del ejemplo
const resultado = implementar${topic.replace(/\s+/g, '')}();
console.log(resultado);</code></pre>
      `
    },
    {
      title: 'Mejores Prácticas',
      content: `
        <p>Para aprovechar al máximo ${topic.toLowerCase()}, te recomendamos seguir estas mejores prácticas:</p>
        <ol>
          <li><strong>Documentación clara</strong>: Mantén una documentación actualizada.</li>
          <li><strong>Pruebas exhaustivas</strong>: Implementa pruebas unitarias y de integración.</li>
          <li><strong>Seguridad</strong>: Sigue los principios de seguridad básicos.</li>
          <li><strong>Rendimiento</strong>: Optimiza el código para un mejor rendimiento.</li>
          <li><strong>Mantenibilidad</strong>: Escribe código limpio y fácil de mantener.</li>
        </ol>
      `
    },
    {
      title: 'Casos de Uso Reales',
      content: `
        <p>${topic} se aplica en diversos escenarios del desarrollo de software. Algunos ejemplos incluyen:</p>
        <ul>
          <li>Desarrollo de APIs RESTful</li>
          <li>Aplicaciones web escalables</li>
          <li>Sistemas distribuidos</li>
          <li>Plataformas en la nube</li>
          <li>Aplicaciones móviles</li>
        </ul>
      `
    },
    {
      title: 'Conclusión',
      content: `
        <p>En este artículo hemos explorado en profundidad ${topic.toLowerCase()}, desde sus conceptos fundamentales hasta su implementación práctica. Como hemos visto, dominar este tema es esencial para cualquier desarrollador que busque crear aplicaciones robustas, seguras y mantenibles.</p>
        <p>Te animamos a seguir profundizando en este tema y a aplicar estos conceptos en tus proyectos. Si tienes alguna pregunta o comentario, no dudes en compartirlo en la sección de comentarios.</p>
      `
    },
    {
      title: 'Recursos Adicionales',
      content: `
        <p>Para seguir aprendiendo sobre ${topic.toLowerCase()}, te recomendamos los siguientes recursos:</p>
        <ul>
          <li><a href="https://developer.mozilla.org" target="_blank" rel="noopener noreferrer">Documentación oficial de MDN Web Docs</a></li>
          <li><a href="https://www.freecodecamp.org/" target="_blank" rel="noopener noreferrer">FreeCodeCamp - Cursos gratuitos</a></li>
          <li><a href="https://www.udemy.com/" target="_blank" rel="noopener noreferrer">Cursos en Udemy</a></li>
          <li><a href="https://github.com/" target="_blank" rel="noopener noreferrer">Proyectos de código abierto en GitHub</a></li>
        </ul>
      `
    }
  ];

  // Generate the full content
  const content = sections.map(section => 
    `<h2>${section.title}</h2>\n${section.content}`
  ).join('\n\n');

  // Generate a more detailed excerpt
  const excerpt = `Guía completa sobre ${topic.toLowerCase()}. Aprende los conceptos fundamentales, mejores prácticas y ejemplos prácticos para implementar ${topic.toLowerCase()} en tus proyectos de desarrollo de software.`;

  return {
    title,
    content,
    excerpt,
    slug,
    date,
    tags: [topic.split(':')[0].trim(), 'programación', 'desarrollo web', 'tutorial'],
    author: 'Equipo de Desarrollo',
    imageUrl: '/placeholder.svg',
    imageAlt: `Imagen representativa de ${topic.toLowerCase()}`,
    readingTime: `${Math.ceil(content.split(' ').length / 200)} min read`
  };
}

async function fetchPexelsImage(query: string) {
  // Try multiple possible environment variable names for Pexels API key
  const key = process.env.PEXELS_API_KEY || 
              process.env.PEXELS_API || 
              process.env.PEXELS ||
              process.env.NEXT_PUBLIC_PEXELS_API_KEY;
  
  // Default fallback if no API key is found
  if (!key) {
    console.warn('No Pexels API key found. Using placeholder image.');
    return { 
      url: "/placeholder.svg", 
      alt: `Imagen de ${query}`,
      credit: ""
    };
  }

  try {
    // Create a more specific query by adding "programming" and limiting to tech-related terms
    const searchQuery = `programming ${query}`.substring(0, 100); // Ensure query is not too long
    
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", searchQuery);
    url.searchParams.set("per_page", "15");
    url.searchParams.set("orientation", "landscape");
    url.searchParams.set("size", "medium"); // Prefer medium size for better loading
    
    console.log(`Fetching Pexels image for query: ${searchQuery}`);
    
    const res = await fetch(url.toString(), { 
      headers: { 
        'Authorization': key,
        'User-Agent': 'Edukoder/1.0 (https://edukoder.com)'
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000)
    });
    
    if (!res.ok) {
      console.error(`Pexels API error: ${res.status} ${res.statusText}`);
      throw new Error(`Pexels API returned ${res.status}`);
    }
    
    const data = await res.json() as { photos?: Array<{
      src: {
        landscape?: string;
        large?: string;
        original?: string;
      };
      alt?: string;
      photographer?: string;
      photographer_url?: string;
    }> };
    
    const photos = Array.isArray(data.photos) ? data.photos : [];
    
    if (photos.length === 0) {
      console.warn('No photos found for query:', searchQuery);
      return { 
        url: "/placeholder.svg", 
        alt: `Imagen de ${query}`,
        credit: ""
      };
    }
    
    // Randomly select a photo from the results
    const photo = photos[Math.floor(Math.random() * photos.length)];
    
    // Prefer landscape, then large, then original
    const imageUrl = photo.src?.landscape || 
                    photo.src?.large || 
                    photo.src?.original || 
                    "/placeholder.svg";
    
    // Create alt text and photo credit
    const alt = photo.alt || `Imagen relacionada con ${query}`;
    const credit = photo.photographer 
      ? `Foto de ${photo.photographer} en Pexels`
      : "";
    
    console.log(`Selected image: ${imageUrl}`);
    
    return { 
      url: imageUrl, 
      alt,
      credit
    };
    
  } catch (error) {
    console.error('Error fetching image from Pexels:', error);
    return { 
      url: "/placeholder.svg", 
      alt: `Imagen de ${query}`,
      credit: ""
    };
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
  credit?: string;
}) {
  const {
    title,
    author,
    date,
    content,
    imageUrl,
    imageAlt,
    excerpt,
    slug,
    tags = [],
    credit = ""
  } = params;

  const formattedDate = new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": excerpt,
    "datePublished": date,
    "author": {
      "@type": "Person",
      "name": author
    },
    "image": imageUrl,
    "publisher": {
      "@type": "Organization",
      "name": "Edukoder",
      "logo": {
        "@type": "ImageObject",
        "url": "https://edukoder.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://edukoder.com/blog/${slug}.html`
    }
  };

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} | Edukoder Blog</title>
  <meta name="description" content="${excerpt.replace(/"/g, '&quot;')}" />
  <meta name="author" content="${author}" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${excerpt.replace(/"/g, '&quot;')}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:url" content="https://edukoder.com/blog/${slug}.html" />
  <meta property="og:site_name" content="Edukoder Blog" />
  <meta property="article:published_time" content="${date}" />
  ${tags.map(tag => `<meta property="article:tag" content="${tag}" />`).join('\n  ')}
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${excerpt.replace(/"/g, '&quot;')}" />
  <meta name="twitter:image" content="${imageUrl}" />
  
  <!-- Schema.org -->
  <script type="application/ld+json">
    ${JSON.stringify(jsonLd, null, 2)}
  </script>
  
  <style>
    :root {
      --primary: #3b82f6;
      --primary-dark: #2563eb;
      --text: #1f2937;
      --text-light: #6b7280;
      --bg: #ffffff;
      --border: #e5e7eb;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
      line-height: 1.6;
      color: var(--text);
      background-color: var(--bg);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .container {
      max-width: 768px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    header {
      padding: 3rem 0 2rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 2rem;
    }
    
    h1 {
      font-size: 2.25rem;
      line-height: 1.2;
      margin: 1rem 0;
      color: #111827;
    }
    
    .meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: var(--text-light);
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }
    
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1.5rem 0;
    }
    
    .tag {
      display: inline-block;
      background-color: #e0f2fe;
      color: #0369a1;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      text-decoration: none;
    }
    
    .featured-image {
      width: 100%;
      height: auto;
      border-radius: 0.5rem;
      margin: 2rem 0;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    
    .image-credit {
      display: block;
      text-align: right;
      font-size: 0.75rem;
      color: var(--text-light);
      margin-top: 0.25rem;
    }
    
    .content {
      line-height: 1.7;
    }
    
    .content h2 {
      font-size: 1.5rem;
      margin: 2.5rem 0 1rem;
      color: #111827;
    }
    
    .content h3 {
      font-size: 1.25rem;
      margin: 2rem 0 1rem;
      color: #1f2937;
    }
    
    .content p {
      margin: 1.25rem 0;
    }
    
    .content a {
      color: var(--primary);
      text-decoration: none;
      border-bottom: 1px solid var(--primary);
      transition: all 0.2s ease;
    }
    
    .content a:hover {
      color: var(--primary-dark);
      border-bottom-color: var(--primary-dark);
    }
    
    pre {
      background: #1e293b;
      color: #f8fafc;
      padding: 1.25rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 1.5rem 0;
      font-size: 0.875rem;
      line-height: 1.5;
    }
    
    code {
      font-family: 'Fira Code', 'Menlo', 'Monaco', 'Courier New', monospace;
      background: #f3f4f6;
      padding: 0.2em 0.4em;
      border-radius: 0.25em;
      font-size: 0.9em;
    }
    
    pre code {
      background: transparent;
      padding: 0;
      border-radius: 0;
      font-size: 1em;
    }
    
    blockquote {
      border-left: 4px solid var(--primary);
      padding: 0.5rem 0 0.5rem 1rem;
      margin: 1.5rem 0;
      color: var(--text-light);
      font-style: italic;
    }
    
    ul, ol {
      margin: 1.25rem 0;
      padding-left: 1.5rem;
    }
    
    li {
      margin: 0.5rem 0;
    }
    
    footer {
      margin-top: 4rem;
      padding: 2rem 0;
      border-top: 1px solid var(--border);
      text-align: center;
      color: var(--text-light);
      font-size: 0.875rem;
    }
    
    @media (max-width: 640px) {
      h1 {
        font-size: 1.75rem;
      }
      
      .content h2 {
        font-size: 1.375rem;
      }
      
      .content h3 {
        font-size: 1.125rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${title}</h1>
      <div class="meta">
        <span>${formattedDate}</span>
        <span>•</span>
        <span>${author}</span>
      </div>
      
      <div class="tags">
        ${tags.map(tag => `<a href="/blog/tag/${slugify(tag)}" class="tag">${tag}</a>`).join('\n        ')}
      </div>
      
      <img 
        src="${imageUrl}" 
        alt="${imageAlt}" 
        class="featured-image"
        loading="lazy"
        width="1200"
        height="630"
      >
      ${credit ? `<span class="image-credit">${credit}</span>` : ''}
    </header>
    
    <main class="content">
      ${content}
    </main>
    
    <footer>
      <p>© ${new Date().getFullYear()} Edukoder. Todos los derechos reservados.</p>
    </footer>
  </div>
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
  const excerpt = String(
    base.excerpt || content.replace(/<[^>]+>/g, "").slice(0, 180),
  );
  const tags = Array.isArray(base.tags)
    ? base.tags
    : String(base.tags || "programación, frontend")
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);

  const { url: imageUrl, alt: imageAlt, credit } = await fetchPexelsImage(
    `programación ${topic}`,
  );

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
    credit,
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
  writeIndex({
    articles: Array.from(map.values()).sort((a, b) =>
      a.date < b.date ? 1 : -1,
    ),
  });

  console.log(`Generated article: ${title} -> ${outFile}`);
}

main().catch((err) => {
  console.error("Failed to generate article:", err);
  process.exitCode = 0;
});
