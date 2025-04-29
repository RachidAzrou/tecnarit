import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, PencilIcon, Loader2, Trash2, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Sidebar from "@/components/layout/sidebar";
import { PageTitle } from "@/components/layout/page-title";
import { FirebaseCandidate, CandidateFile } from "@/firebase/schema";
import { getCandidate, getCandidateFiles, deleteCandidateFile } from "@/firebase/candidates";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CandidateDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State voor bestandsverwijdering dialoog
  const [fileToDelete, setFileToDelete] = useState<CandidateFile | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: candidate, isLoading: isCandidateLoading } = useQuery<FirebaseCandidate>({
    queryKey: [`candidates/${params.id}`],
    queryFn: async () => {
      if (!params.id) throw new Error("No candidate ID provided");
      const result = await getCandidate(params.id);
      if (!result) throw new Error("Candidate not found");
      return result;
    },
  });

  const { data: files, isLoading: isFilesLoading } = useQuery<CandidateFile[]>({
    queryKey: [`candidates/${params.id}/files`],
    queryFn: async () => {
      if (!params.id) throw new Error("No candidate ID provided");
      return await getCandidateFiles(params.id);
    },
  });
  
  // Mutatie voor het verwijderen van bestanden
  const deleteFileMutation = useMutation<boolean, Error, string | number>({
    mutationFn: async (fileId: string | number) => {
      console.log(`Verwijderproces gestart voor bestand met ID: ${fileId} (${typeof fileId})`);
      try {
        const result = await deleteCandidateFile(fileId);
        console.log("Verwijderproces succesvol afgerond");
        return result;
      } catch (error) {
        console.error("Fout gevangen in mutatiefunctie:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Update de UI direct zonder te wachten op een nieuwe query
      if (fileToDelete && files) {
        // Filter het verwijderde bestand uit de lokale lijst
        const updatedFiles = files.filter(file => file.id !== fileToDelete.id);
        
        // Update de cache direct met de nieuwe lijst
        queryClient.setQueryData([`candidates/${params.id}/files`], updatedFiles);
        
        // Toon bevestigingsmelding
        toast({
          title: "Bestand verwijderd",
          description: "Het bestand is succesvol verwijderd."
        });
        
        // Reset state
        setFileToDelete(null);
      }
    },
    onError: (error) => {
      toast({
        title: "Fout bij verwijderen",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden bij het verwijderen van het bestand.",
        variant: "destructive"
      });
    }
  });

  const handleBackToList = () => {
    setLocation("/");
  };

  const handleEdit = () => {
    setLocation(`/candidates/${params.id}/edit`);
  };
  
  // Handler voor het openen van de verwijder-bevestigingsdialoog
  const handleDeleteClick = (file: CandidateFile) => {
    setFileToDelete(file);
    setShowDeleteDialog(true);
  };
  
  // Handler voor het bevestigen van de bestandsverwijdering
  const confirmDelete = () => {
    if (fileToDelete) {
      // Toon direct feedback aan de gebruiker
      toast({
        title: "Bezig met verwijderen...",
        description: "Het bestand wordt verwijderd."
      });
      
      // Sluit de dialoog direct
      setShowDeleteDialog(false);
      
      // Start de verwijdering
      deleteFileMutation.mutate(fileToDelete.id);
    }
  };
  
  // Handler voor het annuleren van de bestandsverwijdering
  const cancelDelete = () => {
    setFileToDelete(null);
    setShowDeleteDialog(false);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 bg-opacity-10 text-green-500";
      case "contacted":
        return "bg-blue-500 bg-opacity-10 text-blue-500";
      case "interview":
        return "bg-amber-500 bg-opacity-10 text-amber-500";
      case "hired":
        return "bg-purple-500 bg-opacity-10 text-purple-500";
      case "rejected":
        return "bg-red-500 bg-opacity-10 text-red-500";
      default:
        return "bg-gray-500 bg-opacity-10 text-gray-500";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const formatFileDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  // Functie om leeftijd te berekenen op basis van geboortedatum
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    // Als de maand nog niet voorbij is of als het dezelfde maand is maar de dag nog niet voorbij is
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (isCandidateLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold text-primary-900">Candidate not found</h2>
        <p className="mt-2 text-primary-600">
          The candidate you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={handleBackToList} className="mt-4">
          Back to Candidate List
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-primary-50">
      <div className="hidden lg:flex lg:flex-shrink-0 w-64">
        <Sidebar />
      </div>

      <div className="flex flex-col w-full lg:w-0 lg:flex-1 overflow-hidden">
        {/* Mobile header is verwijderd */}

        <div className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-4 sm:py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              <PageTitle title="Kandidaat Details" />
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  {/* Linker deel - hier zou eventueel een knop kunnen staan */}
                </div>
                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-3">
                  <Button
                    onClick={handleBackToList}
                    className="tecnarit-blue-bg tecnarit-blue-button hover-lift w-full sm:w-auto"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    <span>Dashboard</span>
                  </Button>
                  <Button 
                    onClick={handleEdit}
                    className="tecnarit-blue-bg tecnarit-blue-button hover-lift w-full sm:w-auto"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    <span>Bewerken</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              <div className="py-4">
                <Card>
                  {/* Candidate Header */}
                  <div className="px-4 py-5 sm:px-6 border-b bg-gradient-to-r from-[#111827]/5 to-primary/5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <Avatar className="h-24 w-24 border-2 border-primary/30 mx-auto sm:mx-0">
                        <AvatarImage 
                          src={candidate.profileImage ? `/${candidate.profileImage}` : undefined} 
                          alt={`${candidate.firstName} ${candidate.lastName}`}
                        />
                        <AvatarFallback className="text-2xl gradient-bg text-white">
                          {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center sm:text-left">
                        <h3 className="text-xl font-bold gradient-text">
                          {candidate.firstName} {candidate.lastName}
                        </h3>
                        <p className="text-sm text-primary/80 mt-1">
                          {candidate.yearsOfExperience} {candidate.yearsOfExperience === 1 ? 'jaar' : 'jaren'} ervaring
                          {candidate.birthDate && ` • ${calculateAge(new Date(candidate.birthDate))} jaar oud`}
                        </p>
                        <div className="mt-2 flex justify-center sm:justify-start">
                          <Badge variant="outline" className={getStatusBadgeVariant(candidate.status)}>
                            {candidate.status === "beschikbaar" ? "Beschikbaar" : 
                             candidate.status === "onbeschikbaar" ? "Onbeschikbaar" :
                             candidate.status === "in_dienst" ? "In Dienst" : 
                             candidate.status || "Onbekend"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Candidate Information Grid */}
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      {/* Contact Information */}
                      <div className="sm:col-span-6 mb-4">
                        <h3 className="text-lg font-medium gradient-text">Contactgegevens</h3>
                      </div>

                      <div className="sm:col-span-3">
                        <h4 className="text-sm font-medium text-primary/70">E-mailadres</h4>
                        <p className="mt-1 text-sm text-primary-900 font-medium">{candidate.email}</p>
                      </div>

                      <div className="sm:col-span-3">
                        <h4 className="text-sm font-medium text-primary/70">Telefoonnummer</h4>
                        <p className="mt-1 text-sm text-primary-900 font-medium">{candidate.phone || "Niet verstrekt"}</p>
                      </div>

                      <div className="sm:col-span-6 mt-2">
                        <h4 className="text-sm font-medium text-primary/70">LinkedIn Profiel</h4>
                        <p className="mt-1 text-sm text-primary-900">
                          {candidate.linkedinProfile ? (
                            <a 
                              href={candidate.linkedinProfile.startsWith('http') ? candidate.linkedinProfile : `https://${candidate.linkedinProfile}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline font-medium"
                            >
                              {candidate.linkedinProfile}
                            </a>
                          ) : (
                            <span className="text-primary/50">Niet verstrekt</span>
                          )}
                        </p>
                      </div>

                      {/* CV and Attachments */}
                      <div className="sm:col-span-6 mb-4 border-t border-primary-200 pt-6">
                        <h3 className="text-lg font-medium gradient-text">CV / Attachments</h3>
                      </div>

                      <div className="sm:col-span-6">
                        {isFilesLoading ? (
                          <div className="flex justify-center items-center h-16">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : !files || files.length === 0 ? (
                          <div className="text-center py-8 border-2 border-dashed border-primary/30 rounded-lg">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="mx-auto h-12 w-12 text-primary/40" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="9" y1="15" x2="15" y2="15"></line>
                            </svg>
                            <p className="mt-4 text-sm text-primary/70">Geen CV of bijlagen gevonden voor deze kandidaat</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-4 w-full sm:w-auto hover-lift"
                              onClick={handleEdit}
                            >
                              <PencilIcon className="h-4 w-4 mr-2" />
                              <span>CV toevoegen</span>
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {files.map((file) => (
                              <div key={file.id} className="bg-card shadow border border-border/40 rounded-lg p-4 hover:border-primary/40 transition-colors duration-200">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                  {/* Bestandstype icoon */}
                                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                                    {file.fileType.includes("pdf") ? (
                                      <div className="flex items-center justify-center h-12 w-12 rounded-lg gradient-bg text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                          <polyline points="14 2 14 8 20 8"></polyline>
                                          <path d="M9 15L12 12 15 15"></path>
                                          <path d="M12 12V18"></path>
                                        </svg>
                                      </div>
                                    ) : file.fileType.includes("word") || file.fileType.includes("doc") ? (
                                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-500 text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                          <polyline points="14 2 14 8 20 8"></polyline>
                                          <line x1="16" y1="13" x2="8" y2="13"></line>
                                          <line x1="16" y1="17" x2="8" y2="17"></line>
                                          <polyline points="10 9 9 9 8 9"></polyline>
                                        </svg>
                                      </div>
                                    ) : file.fileType.includes("image") ? (
                                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-500 text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                          <polyline points="21 15 16 10 5 21"></polyline>
                                        </svg>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gray-500 text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                          <polyline points="14 2 14 8 20 8"></polyline>
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Bestandsdetails */}
                                  <div className="flex-1 text-center sm:text-left">
                                    <h4 className="text-sm font-medium text-primary-900">{file.fileName}</h4>
                                    <p className="text-xs text-primary/70">
                                      Geüpload op {formatFileDate(file.uploadDate)} • {formatFileSize(file.fileSize)}
                                    </p>
                                  </div>
                                  
                                  {/* Actieknoppen */}
                                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 mt-3 sm:mt-0">
                                    <a href={`/${file.filePath}`} download={file.fileName} className="w-full sm:w-auto">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="w-full text-primary hover:text-primary-700 hover:bg-primary/5 hover-lift"
                                      >
                                        <Download className="h-4 w-4 mr-2" />
                                        <span>Download</span>
                                      </Button>
                                    </a>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 hover-lift"
                                      onClick={() => handleDeleteClick(file)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      <span>Verwijderen</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {candidate.notes && (
                        <>
                          <div className="sm:col-span-6 mb-4 border-t border-primary-200 pt-6">
                            <h3 className="text-lg font-medium gradient-text">Notities</h3>
                          </div>

                          <div className="sm:col-span-6">
                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                              <p className="text-sm text-primary-800">{candidate.notes}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bevestigingsdialoog voor bestandsverwijdering */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bestand verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je dit bestand wilt verwijderen?
              {fileToDelete && (
                <div className="mt-2 p-3 rounded-md bg-gray-100 text-sm">
                  <div className="font-medium">{fileToDelete.fileName}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    Geüpload op {formatFileDate(fileToDelete.uploadDate)} • {formatFileSize(fileToDelete.fileSize)}
                  </div>
                </div>
              )}
              <p className="mt-2 text-red-600 text-sm">
                Let op: Dit kan niet ongedaan worden gemaakt!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} disabled={deleteFileMutation.isPending}>
              Annuleren
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteFileMutation.isPending}
            >
              {deleteFileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verwijderen...
                </>
              ) : (
                "Verwijderen"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}