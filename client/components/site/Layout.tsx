import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./SiteSidebar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppSidebar>
        <main>
          <Outlet />
        </main>
        <Footer />
      </AppSidebar>
    </div>
  );
}
