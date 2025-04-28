import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, PencilIcon, Trash2, Mail, Phone, Linkedin } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import DeleteCandidateDialog from "./delete-candidate-dialog";
import { FirebaseCandidate } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";

interface CandidateTableProps {
  candidates: FirebaseCandidate[];
}

export default function CandidateTable({ candidates }: CandidateTableProps) {
  const [, setLocation] = useLocation();
  const [candidateToDelete, setCandidateToDelete] = useState<FirebaseCandidate | null>(null);
  const isMobile = useIsMobile();

  const handleView = (id: string) => {
    setLocation(`/candidates/${id}`);
  };

  const handleEdit = (id: string) => {
    setLocation(`/candidates/${id}/edit`);
  };

  const handleDeleteClick = (candidate: FirebaseCandidate) => {
    setCandidateToDelete(candidate);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "beschikbaar":
        return "bg-green-500 bg-opacity-10 text-green-500";
      case "onbeschikbaar":
        return "bg-amber-500 bg-opacity-10 text-amber-500";
      case "in_dienst":
        return "bg-primary bg-opacity-10 text-primary";
      default:
        return "bg-gray-500 bg-opacity-10 text-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "beschikbaar":
        return "Beschikbaar";
      case "onbeschikbaar":
        return "Onbeschikbaar";
      case "in_dienst":
        return "In Dienst";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Formateer LinkedIn URL correct
  const formatLinkedInUrl = (url: string | null) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `https://${url}`;
  };

  return (
    <>
      {isMobile ? (
        // Mobiele weergave met kaarten
        <div className="space-y-4 mb-6">
          {candidates.map((candidate) => (
            <Card key={candidate.id} className="overflow-hidden border border-gray-200">
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center space-x-4 bg-gradient-to-r from-[#233142]/3 to-[#4da58e]/3">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage 
                    src={candidate.profileImage ? `/${candidate.profileImage}` : undefined} 
                    alt={`${candidate.firstName} ${candidate.lastName}`}
                  />
                  <AvatarFallback>
                    {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-base font-semibold">
                    {candidate.firstName} {candidate.lastName}
                  </CardTitle>
                  <Badge variant="outline" className={`mt-1 ${getStatusBadgeVariant(candidate.status)}`}>
                    {getStatusText(candidate.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-3 space-y-2 text-sm">
                <div className="flex items-start space-x-2.5">
                  <Mail className="h-4 w-4 text-[#233142]/60 mt-0.5" />
                  <div className="flex-1 truncate">{candidate.email}</div>
                </div>
                
                {candidate.phone && (
                  <div className="flex items-start space-x-2.5">
                    <Phone className="h-4 w-4 text-[#233142]/60 mt-0.5" />
                    <div>{candidate.phone}</div>
                  </div>
                )}
                
                {candidate.linkedinProfile && (
                  <div className="flex items-start space-x-2.5">
                    <Linkedin className="h-4 w-4 text-[#233142]/60 mt-0.5" />
                    <a 
                      href={formatLinkedInUrl(candidate.linkedinProfile)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      LinkedIn profiel
                    </a>
                  </div>
                )}
                
                {candidate.yearsOfExperience && (
                  <div className="flex items-start space-x-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#233142]/60 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>{candidate.yearsOfExperience} jaar ervaring</div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-3 pt-0 border-t border-gray-100 flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(candidate.id)}
                  className="text-blue-500 border-blue-200"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" /> 
                  Bekijken
                </Button>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(candidate.id)}
                    className="text-[#233142] border-[#233142]/20"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(candidate)}
                    className="text-red-500 border-red-200"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
          
          {/* Mobiele paginering */}
          <div className="text-center text-xs text-[#233142]/70 mt-4">
            Toont {candidates.length} resultaten
          </div>
        </div>
      ) : (
        // Desktop tabelweergave
        <div className="rounded-md overflow-hidden mb-8 border border-gray-200">
          <Table>
            <TableHeader className="bg-gradient-to-r from-[#233142] to-[#4da58e]">
              <TableRow>
                <TableHead className="w-[300px] font-medium text-white uppercase text-xs tracking-wider">Naam</TableHead>
                <TableHead className="font-medium text-white uppercase text-xs tracking-wider">Jaren Erv.</TableHead>
                <TableHead className="font-medium text-white uppercase text-xs tracking-wider">Email</TableHead>
                <TableHead className="font-medium text-white uppercase text-xs tracking-wider">LinkedIn</TableHead>
                <TableHead className="font-medium text-white uppercase text-xs tracking-wider">Status</TableHead>
                <TableHead className="text-right font-medium text-white uppercase text-xs tracking-wider">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-4 flex-shrink-0">
                        <AvatarImage 
                          src={candidate.profileImage ? `/${candidate.profileImage}` : undefined} 
                          alt={`${candidate.firstName} ${candidate.lastName}`}
                        />
                        <AvatarFallback>
                          {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{candidate.firstName} {candidate.lastName}</div>
                    </div>
                  </TableCell>
                  <TableCell>{candidate.yearsOfExperience}</TableCell>
                  <TableCell>{candidate.email}</TableCell>
                  <TableCell>
                    {candidate.linkedinProfile ? (
                      <a 
                        href={formatLinkedInUrl(candidate.linkedinProfile)}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Bekijk Profiel
                      </a>
                    ) : (
                      <span className="text-gray-400">Niet opgegeven</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeVariant(candidate.status)}>
                      {getStatusText(candidate.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(candidate.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(candidate.id)}
                        className="text-primary hover:text-primary/80"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(candidate)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Paginering alleen voor desktop */}
      {!isMobile && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#233142]/70">
            Toont <span className="font-medium text-[#233142]">1</span> tot <span className="font-medium text-[#233142]">{candidates.length}</span> van <span className="font-medium text-[#233142]">{candidates.length}</span> resultaten
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" disabled className="border-[#233142]/20 text-[#233142]/40">
              Vorige
            </Button>
            <Button variant="outline" disabled className="border-[#233142]/20 text-[#233142]/40">
              Volgende
            </Button>
          </div>
        </div>
      )}

      <DeleteCandidateDialog
        candidate={candidateToDelete}
        open={!!candidateToDelete}
        onClose={() => setCandidateToDelete(null)}
      />
    </>
  );
}