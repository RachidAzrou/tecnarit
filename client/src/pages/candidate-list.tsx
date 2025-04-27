import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2, Plus, Search, Download, FileSpreadsheet, FileText, Home, Users, RefreshCw } from "lucide-react";
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
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import CandidateTable from "@/components/candidate/candidate-table";
import { FirebaseCandidate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { PageTitle } from "@/components/layout/page-title";
// Firebase import
import { getCandidates, getCandidatesByStatus } from "@/firebase/candidates";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function CandidateList() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sortOrder, setSortOrder] = useState("name_asc");
  const [showDashboard, setShowDashboard] = useState(true);
  const { toast } = useToast();
  
  // Check de URL query parameters om te bepalen of we het dashboard of de zoekpagina moeten tonen
  useEffect(() => {
    const hasSearchParam = window.location.search.includes('search=true');
    setShowDashboard(!hasSearchParam);
  }, []);

  // Directe kandidatenlijst uit Firebase (omzeilt cachingproblemen)
  const [directCandidates, setDirectCandidates] = useState<FirebaseCandidate[]>([]);
  const [directLoading, setDirectLoading] = useState(false);
  
  // Deze functie haalt kandidaten direct uit Firebase op
  const fetchDirectCandidates = async () => {
    try {
      setDirectLoading(true);
      console.log("Direct ophalen van kandidaten uit Firebase...");
      
      const candidatesCollection = collection(db, 'candidates');
      const candidatesSnapshot = await getDocs(candidatesCollection);
      
      const candidates = candidatesSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`Preparing candidate data - Document ID: ${doc.id}`);
        
        // Store the original document ID string
        return {
          // BELANGRIJK: We gebruiken het originele document ID als string
          id: doc.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || null,
          linkedinProfile: data.linkedinProfile || null,
          yearsOfExperience: data.yearsOfExperience || null,
          status: data.status || 'beschikbaar',
          unavailableUntil: data.unavailableUntil ? new Date(data.unavailableUntil) : null,
          client: data.client || null,
          notes: data.notes || null,
          profileImage: data.profileImage || null,
          createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
        };
      });
      
      console.log(`${candidates.length} kandidaten direct opgehaald uit Firebase`);
      setDirectCandidates(candidates);
    } catch (error) {
      console.error("Fout bij direct ophalen van kandidaten:", error);
      toast({
        title: "Fout bij ophalen",
        description: "Er is een fout opgetreden bij het ophalen van kandidaten.",
        variant: "destructive",
      });
    } finally {
      setDirectLoading(false);
    }
  };
  
  // Bij componentmount en als TanStack query opnieuw wordt uitgevoerd
  useEffect(() => {
    fetchDirectCandidates();
  }, []);
  
  // De originele query behouden we voor compatibiliteit, maar we gebruiken deze niet actief
  const { data: candidates, isLoading: queryIsLoading, error, refetch } = useQuery<FirebaseCandidate[]>({
    queryKey: ["candidates"],
    queryFn: async () => {
      await fetchDirectCandidates(); // Direct ophalen bij elke query
      return directCandidates;
    },
    retry: 3,
    retryDelay: 1000,
    // Voorkom dat 401-fouten als error worden beschouwd
    gcTime: 0,
    // Forceer een refetch bij iedere focus om candidate lijst vers te houden
    refetchOnWindowFocus: true,
    staleTime: 0
  });

  const handleAddCandidate = () => {
    setLocation("/candidates/new");
  };
  
  // Functie voor het exporteren van kandidaten naar CSV
  const exportToCSV = (candidates: FirebaseCandidate[]) => {
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

  const filterCandidates = (candidates: FirebaseCandidate[]) => {
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

  // Prioritize direct candidates over query-fetched candidates
  const candidatesToUse = directCandidates.length > 0 ? directCandidates : (candidates || []);
  const isLoadingState = directLoading || queryIsLoading;
  const filteredCandidates = candidatesToUse ? filterCandidates(candidatesToUse) : [];

  return (
    <div className="bg-primary-50">
      <div className="relative z-0 overflow-y-auto focus:outline-none">
        <div className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <PageTitle title={showDashboard ? "Dashboard" : "Kandidaat zoeken"} />
            
            {/* Aparte rij voor knoppen onder de titel */}
            <div className="flex justify-between items-center mb-6">
              <div>
                {/* Linker deel leeg gelaten */}
              </div>
              <div className="flex space-x-2">
                {showDashboard && (
                  <Button 
                    onClick={handleAddCandidate}
                    className="tecnarit-blue-bg mobile-action-button tecnarit-blue-button hover-lift mr-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="responsive-button-text">Kandidaat Toevoegen</span>
                  </Button>
                )}
                {filteredCandidates.length > 0 && !showDashboard && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="border-primary/30 mobile-action-button hover-lift"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        <span className="responsive-button-text">Exporteer</span>
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
                {!showDashboard && (
                  <Button 
                    onClick={handleAddCandidate}
                    className="tecnarit-blue-bg mobile-action-button tecnarit-blue-button hover-lift"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="responsive-button-text">Kandidaat Toevoegen</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div className="py-4">
              {/* Search and Filters - alleen tonen als we in zoek-modus zijn */}
              {!showDashboard && (
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
                        <SelectItem value="beschikbaar">Beschikbaar</SelectItem>
                        <SelectItem value="onbeschikbaar">Onbeschikbaar</SelectItem>
                        <SelectItem value="in_dienst">In Dienst</SelectItem>
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
              )}

              {/* Dashboard of Candidates Table */}
              {showDashboard ? (
                // Dashboard weergave
                <div className="mb-8">

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Totaal aantal kandidaten */}
                    <Card 
                      className="dashboard-total-card cursor-pointer hover-lift mobile-friendly-card"
                      onClick={() => {
                        setShowDashboard(false);
                        setStatus("all");
                        window.history.pushState({}, "", "?search=true");
                      }}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6">
                        <div className="rounded-full bg-blue-100/80 p-3 mb-3">
                          <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                        </div>
                        <h3 className="text-base sm:text-lg font-medium text-gray-900">Totaal Kandidaten</h3>
                        <p className="text-2xl sm:text-3xl font-bold gradient-text mt-2">
                          {isLoadingState ? <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" /> : candidates?.length || 0}
                        </p>
                      </CardContent>
                    </Card>
                    
                    {/* Beschikbare kandidaten */}
                    <Card 
                      className="dashboard-available-card cursor-pointer hover-lift mobile-friendly-card"
                      onClick={() => {
                        setShowDashboard(false);
                        setStatus("beschikbaar");
                        window.history.pushState({}, "", "?search=true&status=beschikbaar");
                      }}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6">
                        <div className="rounded-full bg-green-100/80 p-3 mb-3">
                          <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                        </div>
                        <h3 className="text-base sm:text-lg font-medium text-gray-900">Beschikbare Kandidaten</h3>
                        <p className="text-2xl sm:text-3xl font-bold gradient-text mt-2">
                          {isLoadingState ? (
                            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                          ) : (
                            candidates?.filter(c => c.status === "beschikbaar").length || 0
                          )}
                        </p>
                      </CardContent>
                    </Card>
                    
                    {/* Kandidaten in dienst */}
                    <Card 
                      className="dashboard-employed-card cursor-pointer hover-lift mobile-friendly-card"
                      onClick={() => {
                        setShowDashboard(false);
                        setStatus("in_dienst");
                        window.history.pushState({}, "", "?search=true&status=in_dienst");
                      }}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6">
                        <div className="rounded-full bg-purple-100/80 p-3 mb-3">
                          <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                        </div>
                        <h3 className="text-base sm:text-lg font-medium text-gray-900">Kandidaten in Dienst</h3>
                        <p className="text-2xl sm:text-3xl font-bold gradient-text mt-2">
                          {isLoadingState ? (
                            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                          ) : (
                            candidates?.filter(c => c.status === "in_dienst").length || 0
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Recente kandidaten tabel */}
                  <div className="flex justify-between items-center mt-8 mb-4">
                    <h2 className="text-xl tecnarit-blue-text">Recente Kandidaten</h2>
                    {/* Knop verwijderd op verzoek */}
                  </div>
                  {isLoadingState ? (
                    <div className="flex justify-center items-center h-48 sm:h-64 glass-effect rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin gradient-text" />
                    </div>
                  ) : candidates?.length ? (
                    <div className="glass-effect rounded-lg overflow-hidden">
                      <CandidateTable candidates={candidates.slice(0, 5)} />
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4 border-2 border-dashed border-primary/30 rounded-lg glass-effect">
                      <h3 className="mt-2 text-lg font-medium text-primary-800">Geen kandidaten beschikbaar</h3>
                      <p className="mt-2 text-primary/70">
                        Voeg uw eerste kandidaat toe om te beginnen.
                      </p>
                      {/* Knop verwijderd op verzoek */}
                    </div>
                  )}
                </div>
              ) : (
                // Kandidaat zoeken weergave
                isLoadingState ? (
                  <div className="flex justify-center items-center h-48 sm:h-64 glass-effect rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin gradient-text" />
                  </div>
                ) : error && error.message !== "Session expired" ? (
                  <div className="text-center py-12 sm:py-16 px-4 border-2 border-dashed border-primary/30 rounded-lg glass-effect">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-primary/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <h3 className="mt-4 text-lg font-medium tecnarit-blue-text">Geen kandidaten gevonden</h3>
                    <p className="mt-2 tecnarit-blue-text/70 max-w-md mx-auto">
                      Voeg je eerste kandidaat toe om te beginnen.
                    </p>
                    <Button 
                      onClick={() => window.location.reload()} 
                      className="mt-4 tecnarit-blue-bg mobile-action-button tecnarit-blue-button hover-lift"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      <span className="responsive-button-text">Vernieuwen</span>
                    </Button>
                  </div>
                ) : filteredCandidates.length === 0 ? (
                  <div className="text-center py-12 sm:py-16 px-4 border-2 border-dashed border-primary/30 rounded-lg glass-effect">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-primary/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <h3 className="mt-4 text-lg font-medium tecnarit-blue-text">Geen kandidaten gevonden</h3>
                    <p className="mt-2 tecnarit-blue-text/70 max-w-md mx-auto">
                      {searchQuery || (status && status !== "all") 
                        ? "Pas je zoekcriteria aan of verwijder filters om meer resultaten te zien." 
                        : "Voeg je eerste kandidaat toe om te beginnen."}
                    </p>
                    {/* Knop verwijderd op verzoek */}
                  </div>
                ) : (
                  <div className="glass-effect rounded-lg overflow-hidden">
                    <CandidateTable candidates={filteredCandidates} />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}