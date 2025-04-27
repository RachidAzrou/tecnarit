import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Home, Search, Plus, LogOut, User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import tecnaritLogo from "../../assets/tecnarit-logo.png";

export default function MobileNavbar() {
  const { logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-10">
      <div className="flex items-center justify-around h-16">
        <TooltipProvider>
          {/* Home/Dashboard button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-12 w-12 rounded-full ${location === '/' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                onClick={() => setLocation('/')}
              >
                <Home className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Dashboard</p>
            </TooltipContent>
          </Tooltip>

          {/* Search button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-12 w-12 rounded-full ${location.includes('search=true') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                onClick={() => {
                  window.history.pushState({}, "", "?search=true");
                  setLocation('/?search=true');
                }}
              >
                <Search className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Zoeken</p>
            </TooltipContent>
          </Tooltip>

          {/* Add candidate button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default" 
                size="icon" 
                className="h-14 w-14 rounded-full tecnarit-blue-bg -mt-5 shadow-lg"
                onClick={() => setLocation('/candidates/new')}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Kandidaat Toevoegen</p>
            </TooltipContent>
          </Tooltip>

          {/* Profile button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-12 w-12 rounded-full text-muted-foreground"
                onClick={() => setLocation('/profile')}
              >
                <User className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Profiel</p>
            </TooltipContent>
          </Tooltip>

          {/* Logout button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-12 w-12 rounded-full text-muted-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Uitloggen</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}