import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Home, Users, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MobileNavbar() {
  const { logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => {
    if (path === "/" && !window.location.search.includes('search=true')) {
      return true;
    }
    
    if (path === "/candidates/new" && location === "/candidates/new") {
      return true;
    }
    
    if (path === "/?search=true" && window.location.search.includes('search=true')) {
      return true;
    }
    
    return false;
  };

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border h-16 lg:hidden z-50">
      <div className="grid grid-cols-4 h-full">
        <Button 
          variant="ghost" 
          className={`flex flex-col items-center justify-center rounded-none h-full ${isActive("/") ? "bg-primary/10 text-primary" : ""}`}
          onClick={() => navigateTo("/")}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Dashboard</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className={`flex flex-col items-center justify-center rounded-none h-full ${isActive("/candidates/new") ? "bg-primary/10 text-primary" : ""}`}
          onClick={() => navigateTo("/candidates/new")}
        >
          <Users className="h-5 w-5" />
          <span className="text-xs mt-1">Toevoegen</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className={`flex flex-col items-center justify-center rounded-none h-full ${isActive("/?search=true") ? "bg-primary/10 text-primary" : ""}`}
          onClick={() => navigateTo("/?search=true")}
        >
          <Search className="h-5 w-5" />
          <span className="text-xs mt-1">Zoeken</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="flex flex-col items-center justify-center rounded-none h-full"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs mt-1">Uitloggen</span>
        </Button>
      </div>
    </div>
  );
}