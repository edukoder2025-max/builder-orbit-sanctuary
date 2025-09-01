import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Moon, SunMedium, Search } from "lucide-react";
import { useEffect, useState } from "react";

function ThemeToggle() {
  const [theme, setTheme] = useState<string>(() =>
    typeof window === "undefined"
      ? "system"
      : localStorage.getItem("theme") || "system",
  );
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle("dark", isDark);
    localStorage.setItem("theme", theme);
  }, [theme]);
  return (
    <div className="flex items-center gap-1">
      <Button
        variant={theme === "light" ? "default" : "outline"}
        size="icon"
        aria-label="Tema claro"
        onClick={() => setTheme("light")}
      >
        <SunMedium className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === "dark" ? "default" : "outline"}
        size="icon"
        aria-label="Tema oscuro"
        onClick={() => setTheme("dark")}
      >
        <Moon className="h-4 w-4" />
      </Button>
    </div>
  );
}

const nav = [
  { to: "/tutoriales", label: "Tutoriales" },
  { to: "/snippets", label: "Snippets" },
  { to: "/articulos", label: "Artículos" },
  { to: "/favoritos", label: "Favoritos" },
  { to: "/perfil", label: "Perfil" },
  { to: "/contacto", label: "Contacto" },
];

export default function Header() {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container h-16 flex items-center gap-4">
        <Link to="/" className="font-extrabold tracking-tight text-xl">
          <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">
            Edu
          </span>
          Koder
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                location.pathname.startsWith(n.to) &&
                  "bg-accent text-accent-foreground",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." className="pl-10 w-64" />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
