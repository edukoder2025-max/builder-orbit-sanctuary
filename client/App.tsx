import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import Tutorials from "./pages/Tutorials";
import Snippets from "./pages/Snippets";
import Perfil from "./pages/Perfil";
import Contacto from "./pages/Contacto";
import Favoritos from "./pages/Favoritos";
import Layout from "./components/site/Layout";
import TutorialLanguage from "./pages/TutorialLanguage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/tutoriales" element={<Tutorials />} />
            <Route path="/snippets" element={<Snippets />} />
            <Route path="/articulos" element={<Blog />} />
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/contacto" element={<Contacto />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
