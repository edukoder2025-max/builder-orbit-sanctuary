import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bookmark } from "lucide-react";
import type { Tutorial } from "@/hooks/useTutorials";

export function TutorialCard({ t }: { t: Tutorial }) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-start justify-between gap-3">
          <span className="hover:underline decoration-dotted underline-offset-4">{t.title}</span>
          <Bookmark className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">{t.excerpt}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {t.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
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
                      <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{t.explain}</p>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Código de ejemplo</div>
                  <pre className="rounded-md bg-muted p-4 text-sm overflow-x-auto"><code>{t.content}</code></pre>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
