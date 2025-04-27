import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home,
  Users,
  BarChart3,
  DownloadCloud,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import tecnaritLogo from "@assets/Color logo with background.png";

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
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
    <div className={`flex min-h-0 flex-1 flex-col border-r border-border bg-card transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo Container */}
      <div className="flex flex-shrink-0 items-center px-4 py-3 justify-between border-b border-border">
        {!collapsed ? (
          <div className="flex-1 flex justify-center">
            <img src={tecnaritLogo} alt="TECNARIT" className="h-12 w-auto object-contain" />
          </div>
        ) : (
          <div className="flex-1 flex justify-center">
            <div className="gradient-text text-2xl font-bold">T</div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-full text-primary hover:text-primary/80 ml-2"
          onClick={toggleSidebar}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* User Profile Section - Now at the top */}
      <div className="flex flex-shrink-0 border-b border-border p-4">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'w-full'}`}>
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarImage src="" alt={user?.username} />
            <AvatarFallback className="gradient-bg text-white">{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="ml-3 flex-grow">
              <p className="text-sm font-medium gradient-text">{user?.username}</p>
              <Button
                variant="link"
                className="px-0 h-auto text-xs font-medium text-primary hover:text-primary/80"
                onClick={handleLogout}
              >
                <LogOut className="h-3 w-3 mr-1" /> Uitloggen
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation Section */}
      <div className="flex flex-1 flex-col overflow-y-auto pt-2 pb-4">
        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((item) => (
            <Link 
              key={item.id} 
              href={item.path}
              onClick={onClose}
            >
              <a className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive(item.id)
                  ? "gradient-bg text-white font-medium"
                  : "text-foreground hover:bg-muted"
              }`}>
                <span className={isActive(item.id) ? "text-white" : "text-primary"}>
                  {item.icon}
                </span>
                {!collapsed && item.label}
              </a>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
