import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tutorials, categories } from "@/data/tutorials";

export default function Tutorials() {
  const [params] = useSearchParams();
  const cat = params.get("categoria");
  const list = tutorials.filter((t) => (cat ? t.tags.includes(cat) || t.language === cat : true));
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight">Tutoriales</h1>
      <p className="text-muted-foreground mt-1">Lista por categorías y lenguajes. Cada uno es corto y práctico.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Badge key={c.slug} variant={cat === c.slug ? "default" : "secondary"}>
            <Link to={`?categoria=${c.slug}`}>{c.name}</Link>
          </Badge>
        ))}
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => (
          <Card key={t.slug}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{t.title}</CardTitle>
              <div className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground line-clamp-3">{t.excerpt}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {t.tags.slice(0, 4).map((tg) => (
                  <Badge key={tg} variant="outline">{tg}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {list.length === 0 && (
          <div className="col-span-full text-sm text-muted-foreground">No se encontraron resultados.</div>
        )}
      </div>
    </div>
  );
}
