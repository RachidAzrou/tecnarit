import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import MobileNavbar from "@/components/layout/mobile-navbar";
import Sidebar from "@/components/layout/sidebar";
import tecnaritLogo from "../assets/tecnarit-logo.png";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return (
    <Route path={path}>
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        
        {/* Mobile logo header - centered logo voor mobiel */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-10 flex items-center justify-center border-b border-border bg-card px-4 py-2">
          <div className="flex-1 flex justify-center items-center h-12 overflow-hidden">
            <img src={tecnaritLogo} alt="TECNARIT" className="h-full w-full object-contain" />
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-auto pt-16 pb-20 lg:pt-0 lg:pb-4">
          <Component />
        </div>
        
        {/* Mobile navbar at bottom */}
        <MobileNavbar />
      </div>
    </Route>
  );
}
