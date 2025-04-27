import { useState } from "react";
import { useLocation } from "wouter";
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
import { Candidate } from "@shared/schema";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";

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
  const [, navigate] = useLocation();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Directe verwijdering zonder tussenlagen
  const handleDelete = async () => {
    if (!candidate || isDeleting) return;
    
    try {
      setIsDeleting(true);
      
      // Direct naar Firebase verwijderen (geen omweg via andere functies)
      const id = candidate.id.toString(); // Zorg ervoor dat ID een string is!
      console.log(`[DeleteDialog] Direct verwijderen van kandidaat met ID: ${id}`);
      
      const candidateRef = doc(db, 'candidates', id);
      await deleteDoc(candidateRef);
      
      // Toon succes bericht
      toast({
        title: "Kandidaat verwijderd",
        description: "De kandidaat is succesvol verwijderd.",
      });
      
      // Als we op de detailpagina zijn, ga terug naar de hoofdpagina
      if (window.location.pathname.includes(`/candidates/${candidate.id}`)) {
        navigate("/");
      } else {
        // Vernieuw de pagina om de lijst opnieuw te laden
        window.location.reload();
      }
      
      // Sluit de dialog
      onClose();
    } catch (error) {
      console.error("Fout bij het verwijderen van kandidaat:", error);
      toast({
        title: "Fout bij verwijderen",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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
          <AlertDialogCancel disabled={isDeleting}>Annuleren</AlertDialogCancel>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Bezig met verwijderen..." : "Verwijderen"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}