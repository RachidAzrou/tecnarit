import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import EmployeeTable from "@/components/employee/employee-table";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import { Employee } from "@shared/schema";

export default function EmployeeList() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [sortOrder, setSortOrder] = useState("name_asc");

  const { data: employees, isLoading, error } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const handleAddEmployee = () => {
    setLocation("/employees/new");
  };

  const filterEmployees = (employees: Employee[]) => {
    if (!employees) return [];

    // Filter by search query
    let filtered = employees.filter((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      return (
        fullName.includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    // Filter by department
    if (department) {
      filtered = filtered.filter(
        (employee) => employee.department === department
      );
    }

    // Sort employees
    return [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case "name_asc":
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case "name_desc":
          return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
        case "date_asc":
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case "date_desc":
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        default:
          return 0;
      }
    });
  };

  const filteredEmployees = employees ? filterEmployees(employees) : [];

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
                <h1 className="text-2xl font-semibold text-primary-900 lg:block hidden">Employees</h1>
                <div className="flex-grow"></div>
                <Button onClick={handleAddEmployee}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              <div className="py-4">
                {/* Search and Filters */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <div className="relative rounded-md">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-primary-400" />
                      </div>
                      <Input
                        placeholder="Search employees..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <Select
                      value={department}
                      onValueChange={setDepartment}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Departments</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Customer Support">Customer Support</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-1">
                    <Select
                      value={sortOrder}
                      onValueChange={setSortOrder}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name_asc">Name A-Z</SelectItem>
                        <SelectItem value="name_desc">Name Z-A</SelectItem>
                        <SelectItem value="date_asc">Date (Oldest)</SelectItem>
                        <SelectItem value="date_desc">Date (Newest)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Employee Table */}
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 p-4">
                    Error loading employees. Please try again.
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="text-center text-gray-500 p-4">
                    No employees found. {searchQuery || department ? "Try adjusting your search." : ""}
                  </div>
                ) : (
                  <EmployeeTable employees={filteredEmployees} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
