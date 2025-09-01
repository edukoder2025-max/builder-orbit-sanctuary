import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Bookmark, Code2, Search, Star } from "lucide-react";
import { tutorials, categories, Tutorial } from "@/data/tutorials";

export default function Index() {
  const latest = useMemo(() => {
    return [...tutorials].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100/80 via-cyan-50 to-white dark:from-sky-900/20 dark:via-cyan-900/10 dark:to-transparent" />
        <div className="container relative py-20 lg:py-28">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-yellow-500" />
                Minitutoriales en español • Gratis
              </div>
              <h1 className="mt-5 text-4xl/tight font-extrabold tracking-tight sm:text-5xl/tight">
                Aprende programación en pasos cortos y simples
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-prose">
                EduKoder es una biblioteca de minitutoriales, recetas y artículos para aprender con ejemplos claros y código copiable.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg">
                  <Link to="/tutoriales" className="group">
                    Explorar tutoriales
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/articulos">Leer artículos</Link>
                </Button>
              </div>
              <div className="mt-6 relative max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Busca: bucles, APIs, arrays..." className="pl-10" />
                <p className="mt-2 text-xs text-muted-foreground">Búsqueda inteligente con autocompletado</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {categories.slice(0, 6).map((c) => (
                  <Badge key={c.slug} variant="secondary" className="text-sm">
                    <Link to={`/tutoriales?categoria=${c.slug}`}>{c.name}</Link>
                  </Badge>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-sky-500/10 p-3 text-sky-600 dark:text-sky-400">
                    <Code2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Ejemplo rápido</p>
                    <p className="text-sm text-muted-foreground">Fetch en JavaScript</p>
                  </div>
                </div>
                <pre className="mt-4 rounded-md bg-muted p-4 text-sm overflow-x-auto"><code>{`fetch('https://api.example.com/data')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);`}</code></pre>
                <div className="mt-3 text-xs text-muted-foreground">Copiable y probado</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Últimos minitutoriales</h2>
            <p className="text-muted-foreground">De 2 a 5 minutos de lectura, con código y ejemplo funcional.</p>
          </div>
          <Button asChild variant="ghost">
            <Link to="/tutoriales" className="inline-flex items-center gap-1">Ver todos <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((t: Tutorial) => (
            <Card key={t.slug} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-start justify-between gap-3">
                  <Link to={`/tutoriales?slug=${t.slug}`} className="hover:underline decoration-dotted underline-offset-4">
                    {t.title}
                  </Link>
                  <Bookmark className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2">{t.excerpt}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {t.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container pb-20">
        <div className="rounded-lg border bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Newsletter semanal</h3>
            <p className="text-muted-foreground">Suscríbete para recibir minitutoriales y recetas rápidas.</p>
          </div>
          <form action="#" className="w-full sm:w-auto flex gap-2">
            <Input type="email" placeholder="tu@email.com" required className="w-full sm:w-72" />
            <Button type="submit">Suscribirme</Button>
          </form>
        </div>
      </section>
    </div>
  );
}
