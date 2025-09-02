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
import Contacto from "./pages/Contacto";
import Layout from "./components/site/Layout";
import TutorialLanguage from "./pages/TutorialLanguage";
import ComprarEbook from "./pages/ComprarEbook";

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
            <Route path="/tutoriales/:lang" element={<TutorialLanguage />} />
            <Route path="/articulos" element={<Blog />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/comprar-ebook" element={<ComprarEbook />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
