import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertCandidateSchema, Candidate } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
// Verwijderd: import MobileHeader
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Extend the schema for form validation
const candidateFormSchema = insertCandidateSchema.extend({
  yearsOfExperience: z.number().optional().nullable(),
});

export default function EmployeeForm() {
  const params = useParams<{ id: string }>();
  const isEditMode = !!params.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Fetch candidate data when in edit mode
  const {
    data: candidate,
    isLoading: isCandidateLoading,
    error: candidateError,
  } = useQuery<Candidate>({
    queryKey: [isEditMode ? `/api/candidates/${params.id}` : null],
    enabled: isEditMode,
  });

  const form = useForm<z.infer<typeof candidateFormSchema>>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      linkedinProfile: "",
      yearsOfExperience: null,
      status: "active",
      notes: "",
      profileImage: null,
    },
  });

  // Update form values when candidate data is loaded
  useEffect(() => {
    if (candidate) {
      // Populate form with candidate data
      form.reset({
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone || "",
        linkedinProfile: candidate.linkedinProfile || "",
        yearsOfExperience: candidate.yearsOfExperience || null,
        status: candidate.status,
        notes: candidate.notes || "",
        profileImage: candidate.profileImage || null,
      });

      // Set profile image preview if available
      if (candidate.profileImage) {
        setProfileImagePreview(`/${candidate.profileImage}`);
      }
    }
  }, [candidate, form]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof candidateFormSchema>) => {
      const res = await apiRequest("POST", "/api/candidates", data);
      return await res.json();
    },
    onSuccess: async (newCandidate) => {
      // Upload profile image if selected
      if (profileImageFile) {
        await uploadProfileImage(newCandidate.id, profileImageFile);
      }
      
      // Upload resume if selected
      if (resumeFile) {
        await uploadResume(newCandidate.id, resumeFile);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      toast({
        title: "Candidate created",
        description: "New candidate has been successfully created.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Failed to create candidate",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; formData: z.infer<typeof candidateFormSchema> }) => {
      const res = await apiRequest("PATCH", `/api/candidates/${data.id}`, data.formData);
      return await res.json();
    },
    onSuccess: async (updatedCandidate) => {
      // Upload profile image if selected
      if (profileImageFile) {
        await uploadProfileImage(updatedCandidate.id, profileImageFile);
      }
      
      // Upload resume if selected
      if (resumeFile) {
        await uploadResume(updatedCandidate.id, resumeFile);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      queryClient.invalidateQueries({ queryKey: [`/api/candidates/${params.id}`] });
      toast({
        title: "Candidate updated",
        description: "Candidate has been successfully updated.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Failed to update candidate",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadProfileImage = async (candidateId: number, file: File) => {
    const formData = new FormData();
    formData.append("profileImage", file);
    
    try {
      await fetch(`/api/candidates/${candidateId}/profile-image`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast({
        title: "Failed to upload profile image",
        description: "The profile image could not be uploaded.",
        variant: "destructive",
      });
    }
  };

  const uploadResume = async (candidateId: number, file: File) => {
    const formData = new FormData();
    formData.append("document", file);
    
    try {
      await fetch(`/api/candidates/${candidateId}/documents`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast({
        title: "Failed to upload resume",
        description: "The resume could not be uploaded.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: z.infer<typeof candidateFormSchema>) => {
    if (isEditMode && candidate) {
      updateMutation.mutate({ id: candidate.id, formData: data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex h-screen overflow-hidden bg-primary-50">
      <div className="hidden lg:flex lg:flex-shrink-0 w-64">
        <Sidebar />
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile header is verwijderd */}

        <div className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-primary-900 lg:block hidden">
                  {isEditMode ? "Edit Candidate" : "Add New Candidate"}
                </h1>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to List
                </Button>
              </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              <div className="py-4">
                {isEditMode && isCandidateLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : isEditMode && candidateError ? (
                  <div className="text-center text-red-500 p-4">
                    Error loading candidate data. Please try again.
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="bg-white shadow-sm ring-1 ring-primary-200 sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            {/* Basic Information */}
                            <div className="sm:col-span-6">
                              <h2 className="text-lg font-medium text-primary-900">Basic Information</h2>
                            </div>

                            {/* Profile Image */}
                            <div className="sm:col-span-6">
                              <FormLabel>Profile Photo</FormLabel>
                              <div className="mt-1 flex items-center space-x-5">
                                <div className="flex-shrink-0">
                                  <Avatar className="h-16 w-16">
                                    <AvatarImage src={profileImagePreview || undefined} />
                                    <AvatarFallback>
                                      {form.getValues("firstName").charAt(0) || "U"}
                                      {form.getValues("lastName").charAt(0) || ""}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <div>
                                  <label htmlFor="profile-upload" className="cursor-pointer">
                                    <Button variant="outline" type="button" className="cursor-pointer">
                                      Change
                                    </Button>
                                    <Input
                                      id="profile-upload"
                                      type="file"
                                      className="sr-only"
                                      accept="image/*"
                                      onChange={handleProfileImageChange}
                                    />
                                  </label>
                                  <p className="mt-2 text-xs text-primary-500">JPG, PNG or GIF up to 2MB</p>
                                </div>
                              </div>
                            </div>

                            {/* First Name */}
                            <div className="sm:col-span-3">
                              <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>First name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Last Name */}
                            <div className="sm:col-span-3">
                              <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Last name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Email */}
                            <div className="sm:col-span-3">
                              <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email address</FormLabel>
                                    <FormControl>
                                      <Input type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Phone */}
                            <div className="sm:col-span-3">
                              <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Phone number</FormLabel>
                                    <FormControl>
                                      <Input type="tel" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Job Information */}
                            <div className="sm:col-span-6 pt-4">
                              <h2 className="text-lg font-medium text-primary-900">Job Information</h2>
                            </div>

                            {/* Position */}
                            <div className="sm:col-span-3">
                              <FormField
                                control={form.control}
                                name="position"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Position</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Department */}
                            <div className="sm:col-span-3">
                              <FormField
                                control={form.control}
                                name="department"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Department</FormLabel>
                                    <FormControl>
                                      <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select a department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Engineering">Engineering</SelectItem>
                                          <SelectItem value="Marketing">Marketing</SelectItem>
                                          <SelectItem value="Sales">Sales</SelectItem>
                                          <SelectItem value="Customer Support">Customer Support</SelectItem>
                                          <SelectItem value="HR">HR</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Start Date */}
                            <div className="sm:col-span-3">
                              <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Status */}
                            <div className="sm:col-span-3">
                              <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <FormControl>
                                      <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="active">Active</SelectItem>
                                          <SelectItem value="on-leave">On Leave</SelectItem>
                                          <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Additional Information */}
                            <div className="sm:col-span-6 pt-4">
                              <h2 className="text-lg font-medium text-primary-900">Additional Information</h2>
                            </div>

                            {/* Address */}
                            <div className="sm:col-span-6">
                              <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* City / State / Zip */}
                            <div className="sm:col-span-2">
                              <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>State</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <FormField
                                control={form.control}
                                name="zip"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>ZIP / Postal code</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Resume Upload */}
                            <div className="sm:col-span-6">
                              <FormLabel>Resume</FormLabel>
                              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-primary-200 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                  <svg
                                    className="mx-auto h-12 w-12 text-primary-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                    aria-hidden="true"
                                  >
                                    <path
                                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  <div className="flex text-sm text-primary-600">
                                    <label
                                      htmlFor="resume-upload"
                                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-500 hover:text-blue-600 focus-within:outline-none"
                                    >
                                      <span>Upload a file</span>
                                      <Input
                                        id="resume-upload"
                                        type="file"
                                        className="sr-only"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleResumeChange}
                                      />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                  </div>
                                  <p className="text-xs text-primary-500">
                                    PDF, DOC, DOCX up to 10MB
                                  </p>
                                  {resumeFile && (
                                    <p className="text-sm text-primary-700 mt-2">
                                      Selected file: {resumeFile.name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Notes */}
                            <div className="sm:col-span-6">
                              <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                      <Textarea rows={3} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-3 bg-primary-50 text-right sm:px-6 flex justify-end space-x-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setLocation("/")}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isPending}>
                            {isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {isEditMode ? "Saving..." : "Creating..."}
                              </>
                            ) : (
                              <>{isEditMode ? "Save Employee" : "Create Employee"}</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </Form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
