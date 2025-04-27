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
import CandidateTable from "@/components/candidate/candidate-table";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import { Candidate } from "@shared/schema";

export default function CandidateList() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sortOrder, setSortOrder] = useState("name_asc");

  const { data: candidates, isLoading, error } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  const handleAddCandidate = () => {
    setLocation("/candidates/new");
  };

  const filterCandidates = (candidates: Candidate[]) => {
    if (!candidates) return [];

    // Filter by search query
    let filtered = candidates.filter((candidate) => {
      const fullName = `${candidate.firstName} ${candidate.lastName}`.toLowerCase();
      return (
        fullName.includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (candidate.linkedinProfile && candidate.linkedinProfile.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });

    // Filter by status
    if (status) {
      filtered = filtered.filter(
        (candidate) => candidate.status === status
      );
    }

    // Sort candidates
    return [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case "name_asc":
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case "name_desc":
          return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
        case "experience_asc":
          const expA = a.yearsOfExperience || 0;
          const expB = b.yearsOfExperience || 0;
          return expA - expB;
        case "experience_desc":
          const expDescA = a.yearsOfExperience || 0;
          const expDescB = b.yearsOfExperience || 0;
          return expDescB - expDescA;
        default:
          return 0;
      }
    });
  };

  const filteredCandidates = candidates ? filterCandidates(candidates) : [];

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
                <h1 className="text-2xl font-semibold text-primary-900">Candidates</h1>
                <Button onClick={handleAddCandidate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Candidate
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
                        placeholder="Search candidates..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <Select
                      value={status}
                      onValueChange={setStatus}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="interview">Interview Scheduled</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
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
                        <SelectItem value="experience_asc">Experience (Low-High)</SelectItem>
                        <SelectItem value="experience_desc">Experience (High-Low)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Candidate Table */}
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 p-4">
                    Error loading candidates. Please try again.
                  </div>
                ) : filteredCandidates.length === 0 ? (
                  <div className="text-center text-gray-500 p-4">
                    No candidates found. {searchQuery || status ? "Try adjusting your search." : ""}
                  </div>
                ) : (
                  <CandidateTable candidates={filteredCandidates} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}