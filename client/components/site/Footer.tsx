import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="font-extrabold tracking-tight text-lg">EduKoder</div>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Minitutoriales y artículos para aprender programación de forma
            rápida y práctica.
          </p>
          <div className="mt-4 text-sm">
            <div>
              <span className="font-medium">Email:</span>{" "}
              <a className="hover:underline" href="mailto:edukoder2025@gmail.com">edukoder2025@gmail.com</a>
            </div>
            <div>
              <span className="font-medium">Tel:</span>{" "}
              <a className="hover:underline" href="tel:+543541237972">+54 3541237972</a>
            </div>
          </div>
        </div>
        <div>
          <div className="font-semibold">Secciones</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/tutoriales" className="hover:underline">
                Tutoriales
              </Link>
            </li>
            <li>
              <Link to="/articulos" className="hover:underline">
                Artículos
              </Link>
            </li>
            <li>
              <Link to="/comprar-ebook" className="hover:underline">
                Comprar eBook
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-semibold">Comunidad</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Twitter
              </a>
            </li>
            <li>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Discord
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} EduKoder. Compartiendo conocimiento rápido
        y accesible.
      </div>
    </footer>
  );
}
