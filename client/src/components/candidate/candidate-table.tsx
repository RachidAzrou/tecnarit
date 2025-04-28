import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, PencilIcon, Trash2 } from "lucide-react";
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
import DeleteCandidateDialog from "./delete-candidate-dialog";
import { FirebaseCandidate } from "@shared/schema";

interface CandidateTableProps {
  candidates: FirebaseCandidate[];
}

export default function CandidateTable({ candidates }: CandidateTableProps) {
  const [, setLocation] = useLocation();
  const [candidateToDelete, setCandidateToDelete] = useState<FirebaseCandidate | null>(null);

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

  return (
    <>
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
                      href={candidate.linkedinProfile.startsWith('http') ? candidate.linkedinProfile : `https://${candidate.linkedinProfile}`} 
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
      
      {/* Pagination - Simplified for this implementation */}
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

      <DeleteCandidateDialog
        candidate={candidateToDelete}
        open={!!candidateToDelete}
        onClose={() => setCandidateToDelete(null)}
      />
    </>
  );
}