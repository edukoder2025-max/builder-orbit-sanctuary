import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bookmark, Copy } from "lucide-react";
import type { Tutorial } from "@/hooks/useTutorials";
import { useCallback } from "react";

export function TutorialCard({
  t,
  favorite = false,
  onToggleFavorite,
}: {
  t: Tutorial;
  favorite?: boolean;
  onToggleFavorite?: (slug: string) => void;
}) {
  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(t.content);
    } catch {}
  }, [t.content]);

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-start justify-between gap-3">
          <span className="hover:underline decoration-dotted underline-offset-4">
            {t.title}
          </span>
          <button
            type="button"
            aria-label={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            onClick={() => onToggleFavorite?.(t.slug)}
            className="p-1 rounded hover:bg-accent"
          >
            <Bookmark
              className={"h-4 w-4 transition-colors " + (favorite ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}
              fill={favorite ? "currentColor" : "none"}
            />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {t.excerpt}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {t.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">Ver ejemplo</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t.excerpt}</p>
                  {t.explain && (
                    <div className="text-sm leading-relaxed">
                      <div className="font-medium">Cómo se compone el código</div>
                      <p className="text-muted-foreground mt-1 whitespace-pre-wrap">
                        {t.explain}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-medium text-muted-foreground">Código de ejemplo</div>
                    <Button variant="secondary" size="sm" onClick={copyCode}>
                      <Copy className="h-3.5 w-3.5 mr-1" /> Copiar
                    </Button>
                  </div>
                  <pre className="rounded-md bg-muted p-4 text-sm overflow-x-auto">
                    <code>{t.content}</code>
                  </pre>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
