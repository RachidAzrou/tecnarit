import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home,
  Users,
  LogOut,
  Search
} from "lucide-react";
import tecnaritLogo from "@assets/Color logo with background.png";

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (id: string) => {
    // Check for query parameters
    const hasSearchParam = window.location.search.includes('search=true');
    
    // Voor Dashboard - active wanneer op root pagina zonder search param
    if (id === "dashboard" && location === "/" && !hasSearchParam) {
      return true;
    }
    
    // Voor Kandidaat toevoegen
    if (id === "candidate-add" && location === "/candidates/new") {
      return true;
    }
    
    // Voor Kandidaat zoeken - active wanneer search param aanwezig is
    if (id === "candidate-search" && location === "/" && hasSearchParam) {
      return true;
    }
    
    return false;
  };

  const navItems = [
    { id: "dashboard", path: "/", label: "Dashboard", icon: <Home className="mr-3 h-5 w-5" /> },
    { id: "candidate-add", path: "/candidates/new", label: "Kandidaat toevoegen", icon: <Users className="mr-3 h-5 w-5" /> },
    { id: "candidate-search", path: "/?search=true", label: "Kandidaat zoeken", icon: <Search className="mr-3 h-5 w-5" /> },
  ];

  return (
    <>
      {/* Permanente sidebar */}
      <div className="fixed top-0 bottom-0 left-0 z-40 flex min-h-0 flex-1 flex-col border-r border-border bg-card w-64">
        {/* Logo Container - Volledig gevuld */}
        <div className="flex flex-shrink-0 border-b border-border h-16 overflow-hidden p-0 bg-white">
          <div className="w-full h-full p-0 m-0">
            <img src={tecnaritLogo} alt="TECNARIT" className="h-full w-full object-contain" />
          </div>
        </div>
        
        {/* User Profile Section - Now at the top */}
        <div className="flex flex-shrink-0 border-b border-border p-4">
          <div className="flex items-center w-full">
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarImage src="" alt={user?.username} />
              <AvatarFallback className="gradient-bg text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </AvatarFallback>
            </Avatar>
            <div className="ml-3 flex-grow">
              <p className="text-sm font-medium gradient-text">{user?.username}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Section */}
        <div className="flex flex-1 flex-col overflow-y-auto pt-2 pb-4">
          <nav className="flex-1 space-y-1 px-2">
            {navItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => {
                  window.location.href = item.path;
                  if (onClose) onClose();
                }}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  isActive(item.id)
                    ? "gradient-bg text-white font-medium"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span className={isActive(item.id) ? "text-white" : "text-primary"}>
                  {item.icon}
                </span>
                <span className="ml-2">{item.label}</span>
              </div>
            ))}
          </nav>
          
          {/* Uitloggen knop - nu onderaan de sidebar */}
          <div className="mt-auto border-t border-border pt-2 px-2">
            <div 
              onClick={handleLogout}
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer text-foreground hover:bg-muted"
            >
              <span className="text-primary">
                <LogOut className="h-5 w-5" />
              </span>
              <span className="ml-2">Uitloggen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lege container om ruimte te behouden voor de inhoud */}
      <div className="hidden lg:block w-64"></div>
    </>
  );
}
