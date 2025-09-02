import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { createOrder, getOrder } from "./routes/orders";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping });
  });

  // Hero image (Pexels) — proxy to avoid exposing API key on client
  app.get("/api/hero-image", async (req, res) => {
    try {
      const key = process.env.PEXELS_API_KEY || process.env.PEXELS_API || process.env.PEXELS;
      if (!key) {
        return res.json({ url: "/placeholder.svg", alt: "Imagen de programación", credit: "" });
      }

      const q = String(req.query.q || "programming code developer software computer laptop terminal");
      const url = new URL("https://api.pexels.com/v1/search");
      url.searchParams.set("query", q.slice(0, 100));
      url.searchParams.set("per_page", "30");
      url.searchParams.set("orientation", "landscape");
      url.searchParams.set("size", "medium");

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const r = await fetch(url.toString(), {
        headers: { Authorization: key } as Record<string, string>,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!r.ok) {
        return res.json({ url: "/placeholder.svg", alt: "Imagen de programación", credit: "" });
      }

      const data = (await r.json()) as { photos?: Array<{ src?: { landscape?: string; large?: string; original?: string }; alt?: string; photographer?: string }> };
      const photos = Array.isArray(data.photos) ? data.photos : [];
      if (photos.length === 0) {
        return res.json({ url: "/placeholder.svg", alt: "Imagen de programación", credit: "" });
      }

      const photo = photos[Math.floor(Math.random() * photos.length)];
      const imageUrl = photo?.src?.landscape || photo?.src?.large || photo?.src?.original || "/placeholder.svg";
      const alt = photo?.alt || "Imagen relacionada con programación";
      const credit = photo?.photographer ? `Foto de ${photo.photographer} en Pexels` : "";

      res.json({ url: imageUrl, alt, credit });
    } catch (e) {
      res.json({ url: "/placeholder.svg", alt: "Imagen de programación", credit: "" });
    }
  });

  app.get("/api/demo", handleDemo);

  // Orders / Payments
  app.post("/api/orders", createOrder);
  app.get("/api/orders/:id", getOrder);

  // Debug route to list all registered routes
  app.get("/api/debug/routes", (req, res) => {
    const routes: Array<{ path: string; methods: string[] }> = [];

    // @ts-ignore - Accessing internal Express router
    app._router.stack.forEach((middleware: any) => {
      if (middleware.route) {
        // Routes registered directly on the app
        routes.push({
          path: middleware.route.path,
          methods: Object.keys(middleware.route.methods),
        });
      } else if (middleware.name === "router") {
        // Routes added as router
        middleware.handle.stack.forEach((handler: any) => {
          if (handler.route) {
            routes.push({
              path: handler.route.path,
              methods: Object.keys(handler.route.methods),
            });
          }
        });
      }
    });

    res.json({ routes });
  });

  return app;
}
