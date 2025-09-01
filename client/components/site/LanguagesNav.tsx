import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const languages = [
  { slug: "javascript", label: "JavaScript" },
  { slug: "python", label: "Python" },
  { slug: "html-css", label: "HTML/CSS" },
  { slug: "node", label: "Node.js" },
  { slug: "typescript", label: "TypeScript" },
];

export default function LanguagesNav() {
  const { pathname } = useLocation();
  return (
    <div className="border-b bg-background/80">
      <div className="container h-12 flex items-center gap-1 overflow-x-auto">
        {languages.map((l) => (
          <Link
            key={l.slug}
            to={`/tutoriales/${l.slug}`}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname.startsWith(`/tutoriales/${l.slug}`) &&
                "bg-accent text-accent-foreground",
            )}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
