import { useMemo } from "react";
import { useEffect, useMemo, useState } from "react";
import LanguagesNav from "@/components/site/LanguagesNav";
import { TutorialCard } from "@/components/TutorialCard";
import { useTutorials, Tutorial } from "@/hooks/useTutorials";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";

function buildTagList(items: Tutorial[]) {
  const map = new Map<string, number>();
  for (const t of items) {
    for (const tag of t.tags) {
      map.set(tag, (map.get(tag) || 0) + 1);
    }
  }
  return Array.from(map.entries())
    .sort((a, b) => (a[1] < b[1] ? 1 : -1))
    .map(([tag]) => tag);
}

function matchesQuery(t: Tutorial, q: string) {
  if (!q) return true;
  const s = q.toLowerCase();
  return (
    t.title.toLowerCase().includes(s) ||
    t.excerpt.toLowerCase().includes(s) ||
    t.content.toLowerCase().includes(s) ||
    t.tags.some((x) => x.toLowerCase().includes(s))
  );
}

function hasAllTags(t: Tutorial, selected: string[]) {
  if (selected.length === 0) return true;
  const set = new Set(t.tags.map((x) => x.toLowerCase()));
  return selected.every((tg) => set.has(tg.toLowerCase()));
}

export default function Tutorials() {
  const { tutorials } = useTutorials();
  const { isFavorite, toggle } = useFavorites();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [onlyFavs, setOnlyFavs] = useState(false);

  const allTags = useMemo(() => buildTagList(tutorials), [tutorials]);

  // Reset selected tags if tutorials change and tags disappear
  useEffect(() => {
    setSelectedTags((prev) => prev.filter((t) => allTags.includes(t)));
  }, [allTags]);

  const list = useMemo(() => {
    let arr = tutorials.slice();
    arr = arr.filter((t) => matchesQuery(t, query) && hasAllTags(t, selectedTags));
    if (onlyFavs) arr = arr.filter((t) => isFavorite(t.slug));
    if (sort === "latest") arr.sort((a, b) => (a.date < b.date ? 1 : -1));
    if (sort === "oldest") arr.sort((a, b) => (a.date > b.date ? 1 : -1));
    if (sort === "title") arr.sort((a, b) => a.title.localeCompare(b.title, "es"));
    return arr;
  }, [tutorials, query, selectedTags, sort, onlyFavs, isFavorite]);

  return (
    <div>
      <LanguagesNav />
      <div className="container py-10">
        <h1 className="text-3xl font-bold tracking-tight">Todos los tutoriales</h1>
        <p className="text-muted-foreground mt-1">Explora, filtra y guarda tus favoritos.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Buscar por título, tag o contenido..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Más recientes</SelectItem>
                <SelectItem value="oldest">Más antiguos</SelectItem>
                <SelectItem value="title">Por título</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <div className="text-sm text-muted-foreground">Filtrar por tags:</div>
          {allTags.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  setSelectedTags((prev) =>
                    prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
                  )
                }
              >
                <Badge className={cn(active && "bg-primary text-primary-foreground border-primary")} variant={active ? "default" : "outline"}>
                  {tag}
                </Badge>
              </button>
            );
          })}
          {allTags.length === 0 && (
            <div className="text-sm text-muted-foreground">No hay tags disponibles.</div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Switch id="only-favs" checked={onlyFavs} onCheckedChange={setOnlyFavs} />
          <label htmlFor="only-favs" className="text-sm">Solo favoritos</label>
          <div className="ml-auto text-sm text-muted-foreground">{list.length} resultados</div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <TutorialCard key={t.slug} t={t} favorite={isFavorite(t.slug)} onToggleFavorite={toggle} />
          ))}
          {list.length === 0 && (
            <div className="col-span-full text-sm text-muted-foreground">No se encontraron resultados.</div>
          )}
        </div>
      </div>
    </div>
  );
}
