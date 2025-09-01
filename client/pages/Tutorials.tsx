import { useMemo } from "react";
import LanguagesNav from "@/components/site/LanguagesNav";
import { TutorialCard } from "@/components/TutorialCard";
import { useTutorials } from "@/hooks/useTutorials";

export default function Tutorials() {
  const { tutorials } = useTutorials();
  const list = useMemo(() => tutorials, [tutorials]);
  return (
    <div>
      <LanguagesNav />
      <div className="container py-10">
        <h1 className="text-3xl font-bold tracking-tight">
          Todos los tutoriales
        </h1>
        <p className="text-muted-foreground mt-1">
          Explora por lenguaje usando el nav superior.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <TutorialCard key={t.slug} t={t} />
          ))}
          {list.length === 0 && (
            <div className="col-span-full text-sm text-muted-foreground">
              No se encontraron resultados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
