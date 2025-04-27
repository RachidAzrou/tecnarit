import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Home, Search, Plus, LogOut, User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function MobileNavbar() {
  const { logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");

  // Update page title based on current location
  useEffect(() => {
    if (location === '/') {
      setPageTitle("Dashboard");
    } else if (location === '/profile') {
      setPageTitle("Profiel");
    } else if (location === '/candidates/new') {
      setPageTitle("Kandidaat Toevoegen");
    } else if (location.includes('search=true')) {
      setPageTitle("Zoeken");
    } else if (location.includes('/candidates/') && location.includes('/edit')) {
      setPageTitle("Kandidaat Bewerken");
    } else if (location.includes('/candidates/')) {
      setPageTitle("Kandidaat Details");
    } else {
      setPageTitle("TECNARIT");
    }
  }, [location]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Functie om naar de zoekpagina te navigeren
  const goToSearch = () => {
    setLocation("/");
    // Push history state na een korte time-out om de routing de tijd te geven
    setTimeout(() => {
      window.history.pushState({}, "", "?search=true");
      // Trigger handmatig de status update voor de zoekmodus
      if (window.location.search.includes('search=true')) {
        const searchEvent = new Event('searchmodechanged');
        window.dispatchEvent(searchEvent);
      }
    }, 10);
  };

  // Functie om naar kandidaat toevoegen te navigeren
  const goToAddCandidate = () => {
    setLocation('/candidates/new');
  };

  // Functie om naar het dashboard te navigeren
  const goToDashboard = () => {
    setLocation('/');
  };

  // Functie om naar het profiel te navigeren
  const goToProfile = () => {
    setLocation('/profile');
  };

  return (
    <>
      {/* Pagina titel in mobiele header */}
      <div className="lg:hidden fixed top-16 left-0 right-0 bg-transparent z-5 py-2">
        <h1 className="text-center text-2xl font-bold tecnarit-blue-text">
          {pageTitle}
        </h1>
      </div>
      
      {/* Mobiele navigatiebalk */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-10">
        <div className="flex items-center justify-around h-16">
          <TooltipProvider>
            {/* Search button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-12 w-12 rounded-full ${location.includes('search=true') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                  onClick={goToSearch}
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
                  variant="ghost" 
                  size="icon" 
                  className={`h-12 w-12 rounded-full ${location === '/candidates/new' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                  onClick={goToAddCandidate}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Kandidaat Toevoegen</p>
              </TooltipContent>
            </Tooltip>

            {/* Home/Dashboard button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="default" 
                  size="icon" 
                  className="h-14 w-14 rounded-full tecnarit-blue-bg -mt-5 shadow-lg"
                  onClick={goToDashboard}
                >
                  <Home className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Dashboard</p>
              </TooltipContent>
            </Tooltip>

            {/* Profile button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-12 w-12 rounded-full ${location === '/profile' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                  onClick={goToProfile}
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
    </>
  );
}