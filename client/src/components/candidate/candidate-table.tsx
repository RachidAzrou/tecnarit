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
import { Candidate } from "@shared/schema";

interface CandidateTableProps {
  candidates: Candidate[];
}

export default function CandidateTable({ candidates }: CandidateTableProps) {
  const [, setLocation] = useLocation();
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);

  const handleView = (id: number) => {
    setLocation(`/candidates/${id}`);
  };

  const handleEdit = (id: number) => {
    setLocation(`/candidates/${id}/edit`);
  };

  const handleDeleteClick = (candidate: Candidate) => {
    setCandidateToDelete(candidate);
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

  return (
    <>
      <div className="rounded-md border shadow-sm overflow-hidden mb-8">
        <Table>
          <TableHeader className="bg-primary-50">
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>LinkedIn</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell>{candidate.yearsOfExperience} {candidate.yearsOfExperience === 1 ? 'year' : 'years'}</TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell>
                  {candidate.linkedinProfile ? (
                    <a 
                      href={candidate.linkedinProfile.startsWith('http') ? candidate.linkedinProfile : `https://${candidate.linkedinProfile}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Profile
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadgeVariant(candidate.status)}>
                    {candidate.status === "active" ? "Active" : 
                     candidate.status === "contacted" ? "Contacted" :
                     candidate.status === "interview" ? "Interview" :
                     candidate.status === "hired" ? "Hired" : "Rejected"}
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
                      className="text-primary-500 hover:text-primary-700"
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
        <div className="text-sm text-primary-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{candidates.length}</span> of <span className="font-medium">{candidates.length}</span> results
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" disabled>
            Previous
          </Button>
          <Button variant="outline" disabled>
            Next
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