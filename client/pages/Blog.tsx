import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type BlogItem = {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  tags: string[];
  imageUrl?: string;
  imageAlt?: string;
  author?: string;
  link?: string;
};

export default function Blog() {
  const [items, setItems] = useState<BlogItem[]>([]);
  useEffect(() => {
    fetch("/blog/index.json")
      .then((r) => r.json())
      .then((d) => setItems((d.articles || []) as BlogItem[]))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight">Artículos</h1>
      <p className="text-muted-foreground mt-1">
        Consejos generales: buenas prácticas, productividad y tendencias.
      </p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Card key={it.slug} className="hover:shadow-md transition-shadow overflow-hidden">
            {it.imageUrl && (
              <img
                src={it.imageUrl}
                alt={it.imageAlt || it.title}
                className="w-full h-40 object-cover"
                loading="lazy"
              />
            )}
            <CardHeader className="pb-2">
              <div className="text-[10px] uppercase tracking-wider text-primary font-semibold">creado por edukoder</div>
              <CardTitle className="text-xl mt-1">{it.title}</CardTitle>
              <div className="text-xs text-muted-foreground">
                {new Date(it.date).toLocaleDateString()}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {it.excerpt}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {it.tags?.slice(0, 4).map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
              <div className="mt-4">
                <Button asChild size="sm">
                  <a href={it.link || `/blog/${it.slug}.html`} target="_blank" rel="noopener noreferrer">
                    Leer artículo
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-sm text-muted-foreground">
            Aún no hay artículos. El workflow de GitHub los generará automáticamente.
          </div>
        )}
      </div>
    </div>
  );
}
