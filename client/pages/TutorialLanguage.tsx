import { useMemo } from "react";
import { useParams } from "react-router-dom";
import LanguagesNav from "@/components/site/LanguagesNav";
import { useTutorials, Tutorial } from "@/hooks/useTutorials";
import { TutorialCard } from "@/components/TutorialCard";

function matchLanguage(slug: string, t: Tutorial) {
  if (slug === "javascript") return t.language === "javascript";
  if (slug === "python") return t.language === "python";
  if (slug === "html-css") return t.language === "html" || t.language === "css";
  if (slug === "node") return t.language === "node";
  if (slug === "typescript") return t.language === "ts";
  return false;
}

export default function TutorialLanguage() {
  const params = useParams();
  const { tutorials } = useTutorials();
  const list = useMemo(() => tutorials.filter((t) => matchLanguage(params.lang || "", t)), [tutorials, params.lang]);

  return (
    <div>
      <LanguagesNav />
      <div className="container py-10">
        <h1 className="text-3xl font-bold tracking-tight capitalize">{(params.lang || '').replace('-', ' ')}</h1>
        <p className="text-muted-foreground mt-1">Minitutoriales cortos y prácticos con ejemplos.</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <TutorialCard key={t.slug} t={t} />
          ))}
          {list.length === 0 && (
            <div className="col-span-full text-sm text-muted-foreground">No hay minitutoriales aún para este lenguaje.</div>
          )}
        </div>
      </div>
    </div>
  );
}
