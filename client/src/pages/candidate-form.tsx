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
import MobileHeader from "@/components/layout/mobile-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ImageCropper from "@/components/ui/image-cropper";

// Extend the schema for form validation
const candidateFormSchema = insertCandidateSchema.extend({
  yearsOfExperience: z.number().optional().nullable(),
});

export default function CandidateForm() {
  const params = useParams<{ id: string }>();
  const isEditMode = !!params.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [cropperOpen, setCropperOpen] = useState<boolean>(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

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
      status: "beschikbaar",
      unavailableUntil: null,
      client: "",
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
        unavailableUntil: candidate.unavailableUntil || null,
        client: candidate.client || "",
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
        title: "Kandidaat aangemaakt",
        description: "Nieuwe kandidaat is succesvol aangemaakt.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Fout bij aanmaken kandidaat",
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
        title: "Kandidaat bijgewerkt",
        description: "Kandidaat is succesvol bijgewerkt.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Fout bij bijwerken kandidaat",
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
        title: "Fout bij uploaden profielfoto",
        description: "De profielfoto kon niet worden geüpload.",
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
      if (file.size > 2 * 1024 * 1024) { // 2MB max
        toast({
          title: "Bestand te groot",
          description: "De afbeelding mag maximaal 2MB groot zijn.",
          variant: "destructive",
        });
        return;
      }
      
      // Tijdelijk de file bewaren
      setProfileImageFile(file);
      
      // Afbeelding inladen voor de cropper
      const reader = new FileReader();
      reader.onload = () => {
        // Open de cropper met deze afbeelding
        setImageToCrop(reader.result as string);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Functie om de bijgesneden afbeelding te verwerken
  const handleCroppedImage = (croppedImage: string) => {
    setProfileImagePreview(croppedImage);
    
    // Converteer base64 naar Blob en dan naar File object
    fetch(croppedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'cropped-profile.jpg', { type: 'image/jpeg' });
        setProfileImageFile(file);
        
        toast({
          title: "Afbeelding bijgesneden",
          description: "De profielfoto is klaar om opgeslagen te worden.",
        });
      })
      .catch(err => {
        console.error("Error converting cropped image:", err);
        toast({
          title: "Fout bij bewerken afbeelding",
          description: "De foto kon niet worden bijgesneden. Probeer het opnieuw.",
          variant: "destructive",
        });
      });
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
        <MobileHeader />

        <div className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              <div className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl tecnarit-blue-text font-bold">
                  {isEditMode ? "Kandidaat Bewerken" : "Kandidaat Toevoegen"}
                </h1>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  {/* Linker deel - hier zou eventueel een knop kunnen staan */}
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/")}
                    className="text-primary hover:text-primary-700 hover:bg-primary/5 border-primary/30"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Terug naar Lijst
                  </Button>
                </div>
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
                              <h2 className="text-lg font-medium text-primary-900">Basis Informatie</h2>
                            </div>

                            {/* Profile Image */}
                            <div className="sm:col-span-6">
                              <FormLabel>Profielfoto</FormLabel>
                              <div className="mt-3 flex flex-col sm:flex-row items-center">
                                <div className="mb-4 sm:mb-0 sm:mr-6">
                                  <div 
                                    className="cursor-pointer block"
                                    onClick={() => {
                                      // Programmatically click the hidden file input
                                      document.getElementById('profile-upload')?.click();
                                    }}
                                  >
                                    <Avatar className="h-28 w-28 border-2 border-primary hover:border-primary/70 transition-colors">
                                      <AvatarImage 
                                        src={profileImagePreview || undefined} 
                                        className="object-cover"
                                      />
                                      <AvatarFallback className="gradient-bg text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                          <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                </div>
                                <div className="text-center sm:text-left">
                                  <Button 
                                    variant="outline" 
                                    type="button" 
                                    className="cursor-pointer mb-2"
                                    onClick={() => {
                                      // Programmatically click the hidden file input
                                      document.getElementById('profile-upload')?.click();
                                    }}
                                  >
                                    {profileImagePreview ? 'Foto wijzigen' : 'Foto uploaden'}
                                  </Button>
                                  <input
                                    id="profile-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleProfileImageChange}
                                  />
                                  <p className="text-xs text-primary-500">Klik op de cirkel of de knop om een foto te uploaden</p>
                                  <p className="mt-1 text-xs text-primary-500">JPG, PNG of GIF tot 2MB</p>
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
                                    <FormLabel>Voornaam</FormLabel>
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
                                    <FormLabel>Achternaam</FormLabel>
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
                                    <FormLabel>E-mailadres</FormLabel>
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
                                    <FormLabel>Telefoonnummer</FormLabel>
                                    <FormControl>
                                      <Input type="tel" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* LinkedIn Profile */}
                            <div className="sm:col-span-3">
                              <FormField
                                control={form.control}
                                name="linkedinProfile"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>LinkedIn Profiel</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Years of Experience */}
                            <div className="sm:col-span-3">
                              <FormField
                                control={form.control}
                                name="yearsOfExperience"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Jaren Ervaring</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        {...field} 
                                        value={field.value === null ? '' : field.value}
                                        onChange={(e) => {
                                          const value = e.target.value === '' ? null : Number(e.target.value);
                                          field.onChange(value);
                                        }}
                                      />
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
                                          <SelectValue placeholder="Selecteer status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="beschikbaar">Beschikbaar</SelectItem>
                                          <SelectItem value="onbeschikbaar">Onbeschikbaar</SelectItem>
                                          <SelectItem value="in_dienst">In Dienst</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            {/* Onbeschikbaar tot (alleen tonen als status "onbeschikbaar" is) */}
                            {form.watch("status") === "onbeschikbaar" && (
                              <div className="sm:col-span-3">
                                <FormField
                                  control={form.control}
                                  name="unavailableUntil"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Onbeschikbaar tot</FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="date"
                                          {...field}
                                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                          onChange={(e) => {
                                            const value = e.target.value ? new Date(e.target.value) : null;
                                            field.onChange(value);
                                          }}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                            
                            {/* Klant (alleen tonen als status "in_dienst" is) */}
                            {form.watch("status") === "in_dienst" && (
                              <div className="sm:col-span-3">
                                <FormField
                                  control={form.control}
                                  name="client"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Klant</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}

                            {/* Resume Upload */}
                            <div className="sm:col-span-6">
                              <h2 className="text-lg font-medium text-primary-900 mb-4">CV Upload</h2>
                              <div className="mt-2">
                                <label
                                  htmlFor="file-upload"
                                  className="relative cursor-pointer rounded-md bg-white font-medium text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 hover:text-primary-500"
                                >
                                  <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-primary/30 px-6 pt-5 pb-6 hover:border-primary/60 transition-colors duration-200">
                                    <div className="space-y-1 text-center">
                                      {resumeFile ? (
                                        <div className="flex flex-col items-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 gradient-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                            <polyline points="10 9 9 9 8 9"></polyline>
                                          </svg>
                                          <div className="mt-3 text-center">
                                            <p className="text-sm gradient-text font-medium">
                                              {resumeFile.name}
                                            </p>
                                            <p className="text-xs text-primary/70 mt-1">
                                              {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              className="mt-3"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setResumeFile(null);
                                              }}
                                            >
                                              Bestand wijzigen
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            className="mx-auto h-12 w-12 text-primary" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                          >
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                            <line x1="12" y1="18" x2="12" y2="12"></line>
                                            <line x1="9" y1="15" x2="15" y2="15"></line>
                                          </svg>
                                          <div className="flex flex-col items-center mt-4">
                                            <span className="text-sm font-medium gradient-text">Upload kandidaat CV</span>
                                            <p className="text-xs text-primary/70 mt-1">
                                              Drag and drop of klik om te bladeren
                                            </p>
                                            <p className="text-xs text-primary/60 mt-3">
                                              PDF, DOC, DOCX tot 10MB
                                            </p>
                                          </div>
                                        </>
                                      )}
                                      <Input
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        className="sr-only"
                                        onChange={handleResumeChange}
                                        accept=".pdf,.doc,.docx"
                                      />
                                    </div>
                                  </div>
                                </label>
                              </div>
                            </div>

                            {/* Notes */}
                            <div className="sm:col-span-6">
                              <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Notities</FormLabel>
                                    <FormControl>
                                      <Textarea rows={4} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-5 bg-gradient-to-r from-[#111827]/5 to-primary/5 text-right sm:px-6 rounded-b-lg">
                          <Button
                            type="submit"
                            disabled={isPending}
                            className="relative gradient-bg hover:opacity-90 transition-opacity"
                          >
                            {isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                            )}
                            {isEditMode ? "Kandidaat Bijwerken" : "Kandidaat Aanmaken"}
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
      
      {/* Beeldbewerking Modal */}
      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          open={cropperOpen}
          onClose={() => {
            setCropperOpen(false);
            setImageToCrop(null);
          }}
          onCropComplete={handleCroppedImage}
        />
      )}
    </div>
  );
}