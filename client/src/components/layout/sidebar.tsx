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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import tecnaritLogo from "../../assets/tecnarit-logo.png";

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

  const isActive = (path: string) => {
    if (path === "/" && location === "/") {
      return true;
    }
    if (path !== "/" && location.startsWith(path)) {
      return true;
    }
    return false;
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: <Home className="mr-3 h-5 w-5" /> },
    { path: "/candidates/new", label: "Kandidaat toevoegen", icon: <Users className="mr-3 h-5 w-5" /> },
    { path: "/candidates", label: "Kandidaat zoeken", icon: <Users className="mr-3 h-5 w-5" /> },
    { path: "/export", label: "Exporteer", icon: <DownloadCloud className="mr-3 h-5 w-5" /> },
  ];

  return (
    <div className={`flex min-h-0 flex-1 flex-col border-r border-border bg-card transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4 justify-between">
          {!collapsed && <img src={tecnaritLogo} alt="TECNARIT" className="h-12" />}
          {collapsed && <div className="gradient-text text-2xl font-bold">T</div>}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full text-primary hover:text-primary/80"
            onClick={toggleSidebar}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="mt-5 flex-1 space-y-1 px-2">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              onClick={onClose}
            >
              <a className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive(item.path)
                  ? "gradient-bg text-white font-medium"
                  : "text-foreground hover:bg-muted"
              }`}>
                <span className={isActive(item.path) ? "text-white" : "text-primary"}>
                  {item.icon}
                </span>
                {!collapsed && item.label}
              </a>
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex flex-shrink-0 border-t border-border p-4">
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
    </div>
  );
}
