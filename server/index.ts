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

  app.get("/api/demo", handleDemo);

  // Orders / Payments
  app.post("/api/orders", createOrder);
  app.get("/api/orders/:id", getOrder);

  // Debug route to list all registered routes
  app.get("/api/debug/routes", (req, res) => {
    const routes: Array<{path: string, methods: string[]}> = [];
    
    // @ts-ignore - Accessing internal Express router
    app._router.stack.forEach((middleware: any) => {
      if (middleware.route) {
        // Routes registered directly on the app
        routes.push({
          path: middleware.route.path,
          methods: Object.keys(middleware.route.methods)
        });
      } else if (middleware.name === 'router') {
        // Routes added as router
        middleware.handle.stack.forEach((handler: any) => {
          if (handler.route) {
            routes.push({
              path: handler.route.path,
              methods: Object.keys(handler.route.methods)
            });
          }
        });
      }
    });
    
    res.json({ routes });
  });

  return app;
}
