import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, PencilIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import { Candidate, CandidateFile } from "@shared/schema";

export default function CandidateDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: candidate, isLoading: isCandidateLoading } = useQuery<Candidate>({
    queryKey: [`/api/candidates/${params.id}`],
  });

  const { data: files, isLoading: isFilesLoading } = useQuery<CandidateFile[]>({
    queryKey: [`/api/candidates/${params.id}/files`],
  });

  const handleBackToList = () => {
    setLocation("/");
  };

  const handleEdit = () => {
    setLocation(`/candidates/${params.id}/edit`);
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

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <MobileHeader />

        <div className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              <div className="text-center mb-6 lg:block hidden">
                <h1 className="text-3xl md:text-4xl tecnarit-blue-text font-bold">
                  Kandidaat Details
                </h1>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  {/* Linker deel - hier zou eventueel een knop kunnen staan */}
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleBackToList}
                    className="tecnarit-blue-bg transition-all hover-lift touch-friendly"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button 
                    onClick={handleEdit}
                    className="tecnarit-blue-bg transition-all hover-lift touch-friendly"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Bewerken
                  </Button>
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              <div className="py-4">
                <Card>
                  {/* Candidate Header */}
                  <div className="px-4 py-5 sm:px-6 border-b bg-gradient-to-r from-[#111827]/5 to-primary/5">
                    <div className="flex items-center">
                      <Avatar className="h-24 w-24 border-2 border-primary/30">
                        <AvatarImage 
                          src={candidate.profileImage ? `/${candidate.profileImage}` : undefined} 
                          alt={`${candidate.firstName} ${candidate.lastName}`}
                        />
                        <AvatarFallback className="text-2xl gradient-bg text-white">
                          {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-6">
                        <h3 className="text-xl font-bold gradient-text">
                          {candidate.firstName} {candidate.lastName}
                        </h3>
                        <p className="text-sm text-primary/80 mt-1">
                          {candidate.yearsOfExperience} {candidate.yearsOfExperience === 1 ? 'jaar' : 'jaren'} ervaring
                        </p>
                        <div className="mt-2">
                          <Badge variant="outline" className={getStatusBadgeVariant(candidate.status)}>
                            {candidate.status === "active" ? "Actief" : 
                             candidate.status === "contacted" ? "Gecontacteerd" :
                             candidate.status === "interview" ? "Interview Gepland" :
                             candidate.status === "hired" ? "Aangenomen" : "Afgewezen"}
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
                              className="mt-4"
                              onClick={handleEdit}
                            >
                              <PencilIcon className="h-4 w-4 mr-2" />
                              CV toevoegen
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {files.map((file) => (
                              <div key={file.id} className="bg-card shadow border border-border/40 rounded-lg p-4 hover:border-primary/40 transition-colors duration-200">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
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
                                  <div className="ml-4 flex-1">
                                    <h4 className="text-sm font-medium text-primary-900">{file.fileName}</h4>
                                    <p className="text-xs text-primary/70">
                                      Geüpload op {formatFileDate(file.uploadDate)} • {formatFileSize(file.fileSize)}
                                    </p>
                                  </div>
                                  <div>
                                    <a href={`/${file.filePath}`} download={file.fileName} target="_blank" rel="noopener noreferrer">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="text-primary hover:text-primary-700 hover:bg-primary/5"
                                      >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                      </Button>
                                    </a>
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
    </div>
  );
}