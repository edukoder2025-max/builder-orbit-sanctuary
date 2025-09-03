import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Search,
  BookOpen,
  Home,
  Newspaper,
  Mail,
  ShoppingCart,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to);
  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader>
          <div className="text-lg font-extrabold tracking-tight">EduKoder</div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Buscar</SidebarGroupLabel>
            <div className="px-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar..." className="pl-10 h-8" />
              </div>
            </div>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/")}>
                    <Link to="/">
                      <Home className="h-4 w-4" /> Inicio
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/tutoriales")}>
                    <Link to="/tutoriales">
                      <BookOpen className="h-4 w-4" /> Tutoriales
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/articulos")}>
                    <Link to="/articulos">
                      <Newspaper className="h-4 w-4" /> Artículos
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/contacto")}>
                    <Link to="/contacto">
                      <Mail className="h-4 w-4" /> Contacto
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/comprar-ebook")}
                  >
                    <Link to="/comprar-ebook">
                      <ShoppingCart className="h-4 w-4" /> Comprar eBook
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="text-xs text-muted-foreground px-2">
            © {new Date().getFullYear()} EduKoder
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="sticky top-0 z-40 border-b bg-background">
          <div className="container h-14 flex items-center gap-3">
            <SidebarTrigger />
            <div className="font-semibold">Menú</div>
          </div>
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
