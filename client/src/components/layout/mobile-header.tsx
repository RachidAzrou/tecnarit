import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Download, FileSpreadsheet, FileText, ArrowLeft, Plus, User, Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MobileHeader() {
  const [location, setLocation] = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [showActions, setShowActions] = useState(false);
  const [actionButtons, setActionButtons] = useState<React.ReactNode | null>(null);

  // Update page title and determine which action buttons to show
  useEffect(() => {
    // URL query parameter controleren 
    const hasSearchParam = window.location.search.includes('search=true');
    let actions = null;
    
    if (location === '/' && !hasSearchParam) {
      setPageTitle("Dashboard");
      // Dashboard acties: Export
      actions = (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 px-3">
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => alert('CSV Export')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              <span>Exporteer als CSV</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert('PDF Export')}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Exporteer als PDF</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
      setShowActions(true);
    } else if (location === '/profile') {
      setPageTitle("Profiel");
      setShowActions(false);
    } else if (location === '/candidates/new') {
      setPageTitle("Kandidaat Toevoegen");
      actions = (
        <Button 
          variant="default" 
          size="sm" 
          className="h-9 px-3 tecnarit-blue-bg"
          onClick={() => document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }))}
        >
          <Save className="h-4 w-4 mr-1" /> Opslaan
        </Button>
      );
      setShowActions(true);
    } else if (location.includes('search=true') || hasSearchParam) {
      setPageTitle("Kandidaten zoeken");
      actions = (
        <Button 
          variant="default" 
          size="sm" 
          className="h-9 px-3 tecnarit-blue-bg"
          onClick={() => setLocation('/candidates/new')}
        >
          <Plus className="h-4 w-4 mr-1" /> Kandidaat
        </Button>
      );
      setShowActions(true);
    } else if (location.includes('/candidates/') && location.includes('/edit')) {
      setPageTitle("Kandidaat Bewerken");
      actions = (
        <Button 
          variant="default" 
          size="sm" 
          className="h-9 px-3 tecnarit-blue-bg"
          onClick={() => document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }))}
        >
          <Save className="h-4 w-4 mr-1" /> Opslaan
        </Button>
      );
      setShowActions(true);
    } else if (location.includes('/candidates/')) {
      setPageTitle("Kandidaat Details");
      const id = location.split('/')[2];
      actions = (
        <Button 
          variant="default" 
          size="sm" 
          className="h-9 px-3 tecnarit-blue-bg"
          onClick={() => setLocation(`/candidates/${id}/edit`)}
        >
          <Edit className="h-4 w-4 mr-1" /> Bewerken
        </Button>
      );
      setShowActions(true);
    } else {
      setPageTitle("TECNARIT");
      setShowActions(false);
    }

    setActionButtons(actions);
  }, [location, setLocation]);

  return (
    <div className="lg:hidden py-3 px-5 sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="flex justify-between items-center">
        {/* Terug knop indien niet op homepage */}
        {location !== '/' && !location.includes('search=true') ? (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2 p-1 h-9 w-9"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-9"></div> // Placeholder voor layout
        )}
        
        {/* Pagina titel */}
        <h1 className="text-xl font-bold text-center tecnarit-text-gradient flex-1 mx-2">
          {pageTitle}
        </h1>
        
        {/* Actieknoppen */}
        {showActions ? (
          <div className="flex gap-2">
            {actionButtons}
          </div>
        ) : (
          <div className="w-9"></div> // Placeholder voor layout
        )}
      </div>
    </div>
  );
}
