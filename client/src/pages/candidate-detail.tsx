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
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-primary-900">Candidate Details</h1>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleBackToList}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to List
                  </Button>
                  <Button onClick={handleEdit}>
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              <div className="py-4">
                <Card>
                  {/* Candidate Header */}
                  <div className="px-4 py-5 sm:px-6 border-b">
                    <div className="flex items-center">
                      <Avatar className="h-24 w-24">
                        <AvatarImage 
                          src={candidate.profileImage ? `/${candidate.profileImage}` : undefined} 
                          alt={`${candidate.firstName} ${candidate.lastName}`}
                        />
                        <AvatarFallback className="text-2xl">
                          {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-6">
                        <h3 className="text-xl font-bold text-primary-900">
                          {candidate.firstName} {candidate.lastName}
                        </h3>
                        <p className="text-sm text-primary-600 mt-1">
                          {candidate.yearsOfExperience} {candidate.yearsOfExperience === 1 ? 'year' : 'years'} of experience
                        </p>
                        <div className="mt-2">
                          <Badge variant="outline" className={getStatusBadgeVariant(candidate.status)}>
                            {candidate.status === "active" ? "Active" : 
                             candidate.status === "contacted" ? "Contacted" :
                             candidate.status === "interview" ? "Interview Scheduled" :
                             candidate.status === "hired" ? "Hired" : "Rejected"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Candidate Information Grid */}
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      {/* Contact Information */}
                      <div className="sm:col-span-6 mb-2">
                        <h3 className="text-lg font-medium text-primary-900">Contact Information</h3>
                      </div>

                      <div className="sm:col-span-3">
                        <h4 className="text-sm font-medium text-primary-500">Email Address</h4>
                        <p className="mt-1 text-sm text-primary-900">{candidate.email}</p>
                      </div>

                      <div className="sm:col-span-3">
                        <h4 className="text-sm font-medium text-primary-500">Phone Number</h4>
                        <p className="mt-1 text-sm text-primary-900">{candidate.phone || "Not provided"}</p>
                      </div>

                      <div className="sm:col-span-6">
                        <h4 className="text-sm font-medium text-primary-500">LinkedIn Profile</h4>
                        <p className="mt-1 text-sm text-primary-900">
                          {candidate.linkedinProfile ? (
                            <a 
                              href={candidate.linkedinProfile.startsWith('http') ? candidate.linkedinProfile : `https://${candidate.linkedinProfile}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {candidate.linkedinProfile}
                            </a>
                          ) : (
                            "Not provided"
                          )}
                        </p>
                      </div>

                      {/* Attachments */}
                      <div className="sm:col-span-6 mb-2 border-t border-primary-200 pt-6">
                        <h3 className="text-lg font-medium text-primary-900">Attachments</h3>
                      </div>

                      <div className="sm:col-span-6">
                        {isFilesLoading ? (
                          <div className="flex justify-center items-center h-16">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : !files || files.length === 0 ? (
                          <p className="text-sm text-primary-500">No attachments found</p>
                        ) : (
                          <div className="space-y-3">
                            {files.map((file) => (
                              <div key={file.id} className="bg-primary-50 rounded-lg p-4">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    {file.fileType.includes("pdf") ? (
                                      <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8.342a2 2 0 00-.602-1.43l-4.44-4.342A2 2 0 0012.23 2H4zm9 4a1 1 0 00-1-1H6a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V8z" clipRule="evenodd" />
                                      </svg>
                                    ) : file.fileType.includes("word") ? (
                                      <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8.342a2 2 0 00-.602-1.43l-4.44-4.342A2 2 0 0012.23 2H4zm9 4a1 1 0 00-1-1H6a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V8z" clipRule="evenodd" />
                                      </svg>
                                    ) : file.fileType.includes("image") ? (
                                      <svg className="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      <svg className="h-8 w-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8.342a2 2 0 00-.602-1.43l-4.44-4.342A2 2 0 0012.23 2H4zm9 4a1 1 0 00-1-1H6a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V8z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="ml-4 flex-1">
                                    <h4 className="text-sm font-medium text-primary-900">{file.fileName}</h4>
                                    <p className="text-xs text-primary-500">
                                      Uploaded on {formatFileDate(file.uploadDate)} - {formatFileSize(file.fileSize)}
                                    </p>
                                  </div>
                                  <div>
                                    <a href={`/${file.filePath}`} download={file.fileName} target="_blank" rel="noopener noreferrer">
                                      <Button variant="outline" size="sm">
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
                          <div className="sm:col-span-6 mb-2 border-t border-primary-200 pt-6">
                            <h3 className="text-lg font-medium text-primary-900">Notes</h3>
                          </div>

                          <div className="sm:col-span-6">
                            <p className="text-sm text-primary-600">{candidate.notes}</p>
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