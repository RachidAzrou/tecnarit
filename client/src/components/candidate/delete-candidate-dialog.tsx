import { useMutation } from "@tanstack/react-query";
import { 
  AlertDialog, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Candidate } from "@shared/schema";

interface DeleteCandidateDialogProps {
  candidate: Candidate | null;
  open: boolean;
  onClose: () => void;
}

export default function DeleteCandidateDialog({
  candidate,
  open,
  onClose,
}: DeleteCandidateDialogProps) {
  const { toast } = useToast();
  
  const deleteCandidate = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/candidates/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Kandidaat verwijderd",
        description: "De kandidaat is succesvol verwijderd.",
      });
      queryClient.invalidateQueries({queryKey: ['/api/candidates']});
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Fout bij verwijderen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (candidate) {
      deleteCandidate.mutate(candidate.id);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Kandidaat verwijderen</AlertDialogTitle>
          <AlertDialogDescription>
            Weet je zeker dat je de kandidaat 
            <strong className="font-medium">
              {candidate ? ` ${candidate.firstName} ${candidate.lastName}` : ""}
            </strong> 
            wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteCandidate.isPending}>Annuleren</AlertDialogCancel>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteCandidate.isPending}
          >
            {deleteCandidate.isPending ? "Bezig met verwijderen..." : "Verwijderen"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}