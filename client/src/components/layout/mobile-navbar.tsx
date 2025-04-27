import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Home, Search, Plus, LogOut } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function MobileNavbar() {
  const { logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");

  // Update page title based on current location and query parameters
  useEffect(() => {
    // URL query parameter controleren 
    const hasSearchParam = window.location.search.includes('search=true');
    
    // State bijwerken op basis van URL om consistent te zijn
    if (hasSearchParam && location === '/') {
      // Dit zorgt ervoor dat op de zoekpagina de toestand altijd consistent is
      setLocation('/?search=true');
    }
    
    if (location === '/' && !hasSearchParam) {
      setPageTitle("Dashboard");
    } else if (location === '/profile') {
      setPageTitle("Profiel");
    } else if (location === '/candidates/new') {
      setPageTitle("Kandidaat Toevoegen");
    } else if (location.includes('search=true') || hasSearchParam) {
      setPageTitle("Kandidaten zoeken");
    } else if (location.includes('/candidates/') && location.includes('/edit')) {
      setPageTitle("Kandidaat Bewerken");
    } else if (location.includes('/candidates/')) {
      setPageTitle("Kandidaat Details");
    } else {
      setPageTitle("TECNARIT");
    }
  }, [location, setLocation]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Functie om naar de kandidaten zoekpagina te navigeren
  const goToSearch = () => {
    window.location.href = "/?search=true";
  };

  // Functie om naar kandidaat toevoegen te navigeren
  const goToAddCandidate = () => {
    setLocation('/candidates/new');
  };

  // Functie om naar dashboard te navigeren
  const goToDashboard = () => {
    setLocation("/");
  };

  return (
    <>
      {/* Mobiele navigatiebalk */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-10">
        <div className="flex items-center justify-around h-16">
          <TooltipProvider>
            {/* Home/Dashboard button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={location === '/' && !location.includes('search=true') && !window.location.search.includes('search=true') ? "default" : "ghost"}
                  size="icon" 
                  className={`${location === '/' && !location.includes('search=true') && !window.location.search.includes('search=true') ? 'h-14 w-14 rounded-full tecnarit-blue-bg -mt-5 shadow-lg' : 'h-12 w-12 rounded-full text-muted-foreground'}`}
                  onClick={goToDashboard}
                >
                  <Home className={`${location === '/' && !location.includes('search=true') && !window.location.search.includes('search=true') ? 'h-6 w-6 text-white' : 'h-5 w-5'}`} />
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
                  variant={location.includes('search=true') || window.location.search.includes('search=true') ? "default" : "ghost"}
                  size="icon" 
                  className={`${location.includes('search=true') || window.location.search.includes('search=true') ? 'h-14 w-14 rounded-full tecnarit-blue-bg -mt-5 shadow-lg' : 'h-12 w-12 rounded-full text-muted-foreground'}`}
                  onClick={goToSearch}
                >
                  <Search className={`${location.includes('search=true') || window.location.search.includes('search=true') ? 'h-6 w-6 text-white' : 'h-5 w-5'}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Kandidaten zoeken</p>
              </TooltipContent>
            </Tooltip>

            {/* Add candidate button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={location === '/candidates/new' ? "default" : "ghost"}
                  size="icon" 
                  className={`${location === '/candidates/new' ? 'h-14 w-14 rounded-full tecnarit-blue-bg -mt-5 shadow-lg' : 'h-12 w-12 rounded-full text-muted-foreground'}`}
                  onClick={goToAddCandidate}
                >
                  <Plus className={`${location === '/candidates/new' ? 'h-6 w-6 text-white' : 'h-5 w-5'}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Kandidaat Toevoegen</p>
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
    </>
  );
}