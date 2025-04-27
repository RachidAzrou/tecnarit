import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2, Plus, Search, Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import CandidateTable from "@/components/candidate/candidate-table";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import { Candidate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function CandidateList() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sortOrder, setSortOrder] = useState("name_asc");
  const { toast } = useToast();

  const { data: candidates, isLoading, error } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  const handleAddCandidate = () => {
    setLocation("/candidates/new");
  };
  
  // Functie voor het exporteren van kandidaten naar CSV
  const exportToCSV = (candidates: Candidate[]) => {
    // Headers voor de CSV
    const headers = [
      "Voornaam", 
      "Achternaam", 
      "E-mail", 
      "Telefoon", 
      "LinkedIn",
      "Jaren Ervaring",
      "Status", 
      "Onbeschikbaar Tot", 
      "Klant",
      "Notities"
    ];
    
    // Format DateTime to string
    const formatDate = (date: Date | null) => {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleDateString('nl-NL');
    };
    
    // Converteren van kandidaten naar rijen
    const rows = candidates.map(candidate => [
      candidate.firstName,
      candidate.lastName,
      candidate.email,
      candidate.phone || "",
      candidate.linkedinProfile || "",
      candidate.yearsOfExperience ? candidate.yearsOfExperience.toString() : "",
      candidate.status,
      formatDate(candidate.unavailableUntil),
      candidate.client || "",
      candidate.notes || ""
    ]);
    
    // Combineren van headers en rijen
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    // Creëer een Blob van de CSV data
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    
    // Creëer een download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `tecnarit-kandidaten-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.display = "none";
    document.body.appendChild(link);
    
    // Klik op de link om het bestand te downloaden
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export succesvol",
      description: `${candidates.length} kandidaten geëxporteerd naar CSV`,
    });
  };
  
  // Export naar PDF
  const exportToPDF = () => {
    toast({
      title: "PDF Export",
      description: "PDF export-functionaliteit komt binnenkort beschikbaar.",
    });
  };

  const filterCandidates = (candidates: Candidate[]) => {
    if (!candidates) return [];

    // Filter by search query
    let filtered = candidates.filter((candidate) => {
      const fullName = `${candidate.firstName} ${candidate.lastName}`.toLowerCase();
      return (
        fullName.includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (candidate.linkedinProfile && candidate.linkedinProfile.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });

    // Filter by status
    if (status && status !== "all") {
      filtered = filtered.filter(
        (candidate) => candidate.status === status
      );
    }

    // Sort candidates
    return [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case "name_asc":
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case "name_desc":
          return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
        case "experience_asc":
          const expA = a.yearsOfExperience || 0;
          const expB = b.yearsOfExperience || 0;
          return expA - expB;
        case "experience_desc":
          const expDescA = a.yearsOfExperience || 0;
          const expDescB = b.yearsOfExperience || 0;
          return expDescB - expDescA;
        default:
          return 0;
      }
    });
  };

  const filteredCandidates = candidates ? filterCandidates(candidates) : [];

  return (
    <div className="flex h-screen overflow-hidden bg-primary-50">
      <div className="hidden lg:flex lg:flex-shrink-0 w-64">
        <Sidebar />
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <MobileHeader />

        <div className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold gradient-text">Kandidaten</h1>
                <div className="flex space-x-2">
                  {filteredCandidates.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="border-primary/30">
                          <Download className="h-4 w-4 mr-2" />
                          Exporteer
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => exportToCSV(filteredCandidates)}>
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          <span>Exporteer naar CSV</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={exportToPDF}>
                          <FileText className="h-4 w-4 mr-2" />
                          <span>Exporteer naar PDF</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button 
                    onClick={handleAddCandidate}
                    className="gradient-bg hover:opacity-90 transition-opacity"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Kandidaat Toevoegen
                  </Button>
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              <div className="py-4">
                {/* Search and Filters */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <div className="relative rounded-md">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-primary/60" />
                      </div>
                      <Input
                        placeholder="Zoek kandidaten..."
                        className="pl-10 border-primary/30 focus-visible:ring-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <Select
                      value={status}
                      onValueChange={setStatus}
                    >
                      <SelectTrigger className="border-primary/30 focus:ring-primary">
                        <SelectValue placeholder="Alle Statussen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle Statussen</SelectItem>
                        <SelectItem value="active">Actief</SelectItem>
                        <SelectItem value="contacted">Gecontacteerd</SelectItem>
                        <SelectItem value="interview">Interview Gepland</SelectItem>
                        <SelectItem value="hired">Aangenomen</SelectItem>
                        <SelectItem value="rejected">Afgewezen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-1">
                    <Select
                      value={sortOrder}
                      onValueChange={setSortOrder}
                    >
                      <SelectTrigger className="border-primary/30 focus:ring-primary">
                        <SelectValue placeholder="Sorteer op" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name_asc">Naam A-Z</SelectItem>
                        <SelectItem value="name_desc">Naam Z-A</SelectItem>
                        <SelectItem value="experience_asc">Ervaring (Laag-Hoog)</SelectItem>
                        <SelectItem value="experience_desc">Ervaring (Hoog-Laag)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Candidate Table */}
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin gradient-text" />
                  </div>
                ) : error ? (
                  <div className="text-center p-8 border-2 border-red-300 rounded-lg bg-red-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-red-800">Fout bij het laden van kandidaten</h3>
                    <p className="mt-2 text-red-600">Probeer het later opnieuw of neem contact op met ondersteuning.</p>
                    <Button 
                      onClick={() => window.location.reload()} 
                      className="mt-4 bg-red-600 hover:bg-red-700"
                    >
                      Opnieuw proberen
                    </Button>
                  </div>
                ) : filteredCandidates.length === 0 ? (
                  <div className="text-center py-16 px-4 border-2 border-dashed border-primary/30 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-primary/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-primary-800">Geen kandidaten gevonden</h3>
                    <p className="mt-2 text-primary/70">
                      {searchQuery || (status && status !== "all") 
                        ? "Pas je zoekcriteria aan of verwijder filters om meer resultaten te zien." 
                        : "Voeg je eerste kandidaat toe om te beginnen."}
                    </p>
                    {!searchQuery && (!status || status === "all") && (
                      <Button 
                        onClick={handleAddCandidate}
                        className="mt-4 gradient-bg hover:opacity-90 transition-opacity"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Kandidaat Toevoegen
                      </Button>
                    )}
                  </div>
                ) : (
                  <CandidateTable candidates={filteredCandidates} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}