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
import DeleteEmployeeDialog from "./delete-employee-dialog";
import { Employee } from "@shared/schema";

interface EmployeeTableProps {
  employees: Employee[];
}

export default function EmployeeTable({ employees }: EmployeeTableProps) {
  const [, setLocation] = useLocation();
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleView = (id: number) => {
    setLocation(`/employees/${id}`);
  };

  const handleEdit = (id: number) => {
    setLocation(`/employees/${id}/edit`);
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 bg-opacity-10 text-green-500";
      case "on-leave":
        return "bg-amber-500 bg-opacity-10 text-amber-500";
      case "inactive":
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
              <TableHead>Position</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-4 flex-shrink-0">
                      <AvatarImage 
                        src={employee.profileImage ? `/${employee.profileImage}` : undefined} 
                        alt={`${employee.firstName} ${employee.lastName}`}
                      />
                      <AvatarFallback>
                        {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                  </div>
                </TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadgeVariant(employee.status)}>
                    {employee.status === "active" ? "Active" : 
                     employee.status === "on-leave" ? "On Leave" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleView(employee.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(employee.id)}
                      className="text-primary-500 hover:text-primary-700"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(employee)}
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
          Showing <span className="font-medium">1</span> to <span className="font-medium">{employees.length}</span> of <span className="font-medium">{employees.length}</span> results
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

      <DeleteEmployeeDialog
        employee={employeeToDelete}
        open={!!employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
      />
    </>
  );
}
