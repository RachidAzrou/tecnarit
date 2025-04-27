import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";
import { Employee } from "@shared/schema";

interface DeleteEmployeeDialogProps {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
}

export default function DeleteEmployeeDialog({
  employee,
  open,
  onClose,
}: DeleteEmployeeDialogProps) {
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Employee deleted",
        description: "The employee has been successfully deleted.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to delete employee",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (employee) {
      deleteMutation.mutate(employee.id);
    }
  };

  if (!employee) return null;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader className="flex flex-row items-center gap-3">
          <div className="bg-red-100 p-2 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {employee.firstName} {employee.lastName}? All of their data will be permanently removed. This action cannot be undone.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
