import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2, Calendar as CalendarIcon } from "lucide-react";
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FirebaseCandidate, insertCandidateSchema } from "@/firebase/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { PageTitle } from "@/components/layout/page-title";
// Firebase import
import { 
  createCandidate, 
  updateCandidate, 
  getCandidate,
  addCandidateFile
} from "@/firebase/candidates";
// Import bestandscompressie functies
import { compressFile, isFileSizeValid } from "@/lib/fileCompression";

const formSchema = insertCandidateSchema.extend({
  unavailableUntil: z.date().optional().nullable(),
  client: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CandidateForm() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const isEditMode = !!id;
  const { toast } = useToast();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [certificateProgress, setCertificateProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isCertificateUploading, setIsCertificateUploading] = useState<boolean>(false);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [certificateFileName, setCertificateFileName] = useState<string | null>(null);

  // Query om kandidaat gegevens op te halen indien we in wijzigingsmodus zijn
  const {
    data: candidate,
    isLoading: isCandidateLoading,
    error: candidateError,
  } = useQuery<FirebaseCandidate>({
    queryKey: [`candidates/${id}`],
    queryFn: async () => {
      if (!id) throw new Error("No candidate ID provided");
      const result = await getCandidate(id);
      if (!result) throw new Error("Candidate not found");
      return result;
    },
    enabled: isEditMode,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      linkedinProfile: "",
      yearsOfExperience: null,
      birthDate: null,
      status: "beschikbaar",
      unavailableUntil: null,
      client: "",
      notes: "",
    },
  });

  // Zorg ervoor dat het formulier wordt ingevuld met bestaande gegevens wanneer we in wijzigingsmodus zijn
  useEffect(() => {
    if (candidate && isEditMode) {
      // Update de form values met bestaande kandidaat gegevens
      form.reset({
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone || null,
        linkedinProfile: candidate.linkedinProfile || null,
        yearsOfExperience: candidate.yearsOfExperience,
        birthDate: candidate.birthDate ? new Date(candidate.birthDate) : null,
        status: candidate.status,
        unavailableUntil: candidate.unavailableUntil ? new Date(candidate.unavailableUntil) : null,
        client: candidate.client || null,
        notes: candidate.notes || null,
      });


    }
  }, [candidate, isEditMode, form]);

  // Mutations voor toevoegen/bijwerken van kandidaten
  const createMutation = useMutation({
    mutationFn: async (formData: FormValues) => {
      try {
        // Gebruik Firebase in plaats van de API
        const result = await createCandidate(formData);
        if (!result) throw new Error("Failed to create candidate");
        return result;
      } catch (error) {
        console.error("Error in createMutation:", error);
        throw error; // Zorg dat de error doorgaat naar onError handler
      }
    },
    onSuccess: async (data: FirebaseCandidate) => {
      try {
        // Upload CV als die is geselecteerd
        if (resumeFile) {
          setIsUploading(true);
          setUploadProgress(0);
          
          // Voeg de progress callback toe
          await addCandidateFile(
            data.id, 
            resumeFile, 
            "CV",
            (progress) => {
              console.log(`Upload voortgang CV: ${progress}%`);
              setUploadProgress(progress);
            }
          );
          
          setIsUploading(false);
        }
        
        // Upload certificaat als die is geselecteerd
        if (certificateFile) {
          setIsCertificateUploading(true);
          setCertificateProgress(0);
          
          // Voeg de progress callback toe
          await addCandidateFile(
            data.id, 
            certificateFile, 
            "Certificaat",
            (progress) => {
              console.log(`Upload voortgang certificaat: ${progress}%`);
              setCertificateProgress(progress);
            }
          );
          
          setIsCertificateUploading(false);
        }

        queryClient.invalidateQueries({ queryKey: ["candidates"] });
        toast({
          title: "Kandidaat Toegevoegd",
          description: `${data.firstName} ${data.lastName} is toegevoegd aan het systeem.`,
        });
        // Kleine vertraging toevoegen om te zorgen dat de toast zichtbaar is voordat we navigeren
        setTimeout(() => setLocation("/"), 500);
      } catch (uploadError) {
        console.error("Error during post-creation steps:", uploadError);
        // Reset upload state
        setIsUploading(false);
        setUploadProgress(0);
        setIsCertificateUploading(false);
        setCertificateProgress(0);
        
        // Toch doorgaan met navigeren bij upload fout
        queryClient.invalidateQueries({ queryKey: ["candidates"] });
        toast({
          title: "Kandidaat Toegevoegd",
          description: `${data.firstName} ${data.lastName} is toegevoegd, maar bestanden konden niet worden geüpload.`,
        });
        setTimeout(() => setLocation("/"), 500);
      }
    },
    onError: (error: Error) => {
      console.error("Create mutation error handler triggered:", error);
      toast({
        title: "Fout bij toevoegen",
        description: error.message || "Er is een fout opgetreden tijdens het toevoegen van de kandidaat.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: FormValues) => {
      if (!id) throw new Error("Geen kandidaat ID opgegeven");
      // Gebruik Firebase in plaats van de API
      const result = await updateCandidate(id, formData);
      if (!result) throw new Error("Failed to update candidate");
      return result;
    },
    onSuccess: async (data: FirebaseCandidate) => {
      try {
        // Upload CV als die is geselecteerd
        if (resumeFile) {
          setIsUploading(true);
          setUploadProgress(0);
          
          // Voeg de progress callback toe
          await addCandidateFile(
            data.id, 
            resumeFile, 
            "CV",
            (progress) => {
              console.log(`Upload voortgang CV: ${progress}%`);
              setUploadProgress(progress);
            }
          );
          
          setIsUploading(false);
        }
        
        // Upload certificaat als die is geselecteerd
        if (certificateFile) {
          setIsCertificateUploading(true);
          setCertificateProgress(0);
          
          // Voeg de progress callback toe
          await addCandidateFile(
            data.id, 
            certificateFile, 
            "Certificaat",
            (progress) => {
              console.log(`Upload voortgang certificaat: ${progress}%`);
              setCertificateProgress(progress);
            }
          );
          
          setIsCertificateUploading(false);
        }

        queryClient.invalidateQueries({ queryKey: [`candidates/${id}`] });
        queryClient.invalidateQueries({ queryKey: ["candidates"] });
        toast({
          title: "Kandidaat Bijgewerkt",
          description: `${data.firstName} ${data.lastName} is bijgewerkt.`,
        });
        setTimeout(() => setLocation("/"), 500);
      } catch (uploadError) {
        console.error("Error during post-update steps:", uploadError);
        // Reset upload state
        setIsUploading(false);
        setUploadProgress(0);
        setIsCertificateUploading(false);
        setCertificateProgress(0);
        
        // Toch doorgaan met navigeren bij upload fout
        queryClient.invalidateQueries({ queryKey: [`candidates/${id}`] });
        queryClient.invalidateQueries({ queryKey: ["candidates"] });
        toast({
          title: "Kandidaat Bijgewerkt",
          description: `${data.firstName} ${data.lastName} is bijgewerkt, maar bestanden konden niet worden geüpload.`,
        });
        setTimeout(() => setLocation("/"), 500);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Fout bij bijwerken",
        description: error.message || "Er is een fout opgetreden tijdens het bijwerken van de kandidaat.",
        variant: "destructive",
      });
    },
  });

  // Deze functies gebruiken nu direct de Firebase-functies
  // De oude implementaties zijn vervangen

  // Functie om het formulier in te dienen
  const onSubmit = (data: FormValues) => {
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };



  // Functie om de bestandsselectie voor het CV af te handelen
  const handleResumeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Controleer de bestandsgrootte (max 10MB vóór compressie)
    if (!isFileSizeValid(file, 10)) {
      toast({
        title: "Bestand te groot",
        description: "Het CV moet kleiner zijn dan 10MB",
        variant: "destructive",
      });
      return;
    }

    try {
      // Bestanden direct comprimeren bij selectie voor betere feedback
      const compressedFile = await compressFile(file);
      
      // Toon melding over compressie als het bestand verkleind is
      if (compressedFile.size < file.size) {
        toast({
          title: "Bestand gecomprimeerd",
          description: `Bestandsgrootte verminderd van ${(file.size / (1024 * 1024)).toFixed(1)}MB naar ${(compressedFile.size / (1024 * 1024)).toFixed(1)}MB`,
        });
      }
      
      setResumeFile(compressedFile);
      setResumeFileName(file.name); // Behoud originele bestandsnaam voor weergave
    } catch (error) {
      console.error("Fout bij comprimeren van bestand:", error);
      // Gebruik het originele bestand als compressie mislukt
      setResumeFile(file);
      setResumeFileName(file.name);
    }
  };
  
  // Functie om de bestandsselectie voor certificaten af te handelen
  const handleCertificateChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // We kiezen het eerste bestand voor de weergave
    const selectedFile = files[0];
    
    // Controleer de bestandsgrootte (max 10MB vóór compressie)
    let allFilesValid = true;
    let totalFileCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      totalFileCount++;
      
      if (!isFileSizeValid(file, 10)) {
        toast({
          title: "Bestand te groot",
          description: `Certificaat '${file.name}' is groter dan 10MB en kan niet worden geüpload.`,
          variant: "destructive",
        });
        allFilesValid = false;
      }
    }
    
    if (!allFilesValid) return;
    
    try {
      // Comprimeer het geselecteerde bestand (alleen eerste voor nu)
      const compressedFile = await compressFile(selectedFile);
      
      // Toon melding over compressie als het bestand verkleind is
      if (compressedFile.size < selectedFile.size) {
        const reductiePercentage = Math.round((1 - compressedFile.size / selectedFile.size) * 100);
        toast({
          title: "Bestand gecomprimeerd",
          description: `Bestandsgrootte verminderd met ${reductiePercentage}%`,
        });
      }
      
      setCertificateFile(compressedFile);
    } catch (error) {
      console.error("Fout bij comprimeren van certificaat:", error);
      // Als compressie mislukt, gebruik origineel
      setCertificateFile(selectedFile);
    }
    
    // Aangepaste bestandsnaam voor meerdere bestanden
    if (files.length === 1) {
      setCertificateFileName(selectedFile.name);
    } else {
      setCertificateFileName(`${totalFileCount} certificaten geselecteerd`);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <div className="flex flex-col flex-1 py-6">
        <div className="w-full px-4 sm:px-6 md:px-8">
          <PageTitle title={isEditMode ? "Kandidaat Bewerken" : "Kandidaat Toevoegen"} />
        </div>

        {/* Form Container - full width with margin away from sidebar */}
        <div className="w-full px-4 sm:px-6 md:px-8">
          <div className="glass-effect rounded-lg overflow-hidden">
            {isEditMode && isCandidateLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isEditMode && candidateError ? (
              <div className="text-center text-red-500 p-8">
                Error loading candidate data. Please try again.
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-8 md:p-10">
                  <div>
                    <div className="py-2 sm:p-0">
                      <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
                        {/* Basic Information */}
                        <div className="sm:col-span-6">
                          <h2 className="text-lg font-medium text-primary-900 mb-2">Basis Informatie</h2>
                        </div>


                        {/* First Name */}
                        <div className="sm:col-span-3">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
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
                              <FormItem className="flex flex-col">
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
                              <FormItem className="flex flex-col">
                                <FormLabel>E-mailadres</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Geboortedatum */}
                        <div className="sm:col-span-3">
                          <FormField
                            control={form.control}
                            name="birthDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Geboortedatum</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    {...field}
                                    placeholder="DD/MM/JJJJ"
                                    value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      field.onChange(value ? new Date(value) : null);
                                    }}
                                  />
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
                              <FormItem className="flex flex-col">
                                <FormLabel>LinkedIn Profiel</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ''} />
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
                              <FormItem className="flex flex-col">
                                <FormLabel>Telefoonnummer</FormLabel>
                                <FormControl>
                                  <Input type="tel" {...field} value={field.value || ''} />
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
                              <FormItem className="flex flex-col">
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
                              <FormItem className="flex flex-col">
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

                        {/* Unavailable Until - alleen tonen als status "onbeschikbaar" is */}
                        {form.watch("status") === "onbeschikbaar" && (
                          <div className="sm:col-span-3">
                            <FormField
                              control={form.control}
                              name="unavailableUntil"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Onbeschikbaar tot</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="date"
                                      {...field}
                                      placeholder="DD/MM/JJJJ"
                                      value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        field.onChange(value ? new Date(value) : null);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}

                        {/* Client - alleen tonen als status "in_dienst" is */}
                        {form.watch("status") === "in_dienst" && (
                          <div className="sm:col-span-3">
                            <FormField
                              control={form.control}
                              name="client"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Klant</FormLabel>
                                  <FormControl>
                                    <Input {...field} value={field.value || ''} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}

                        {/* Resume & Certificates Upload section */}
                        <div className="sm:col-span-6 mt-6 border-t border-primary-100 pt-6">
                          <h2 className="text-lg font-medium text-primary-900 mb-4">Documenten</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Resume Upload */}
                            <div>
                              <FormLabel>CV Upload</FormLabel>
                              <div className="mt-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full sm:w-auto"
                                  onClick={() => {
                                    document.getElementById('resume-upload')?.click();
                                  }}
                                  disabled={isUploading}
                                >
                                  {resumeFileName ? 'CV Wijzigen' : 'CV Uploaden'}
                                </Button>
                                <input
                                  id="resume-upload"
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.doc,.docx"
                                  onChange={handleResumeChange}
                                  disabled={isUploading}
                                />
                                {resumeFileName && (
                                  <p className="mt-2 text-sm text-primary-800">
                                    Geselecteerd bestand: {resumeFileName}
                                  </p>
                                )}
                                
                                {/* Voortgangsbalk voor uploaden */}
                                {isUploading && (
                                  <div className="mt-3 w-full">
                                    <div className="relative pt-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="text-xs text-primary-800 font-medium">
                                          {uploadProgress < 100 
                                            ? `CV wordt geüpload (${Math.round(uploadProgress)}%)` 
                                            : "Upload voltooid!"}
                                        </div>
                                      </div>
                                      <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-gray-200">
                                        <div 
                                          style={{ width: `${uploadProgress}%` }}
                                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-primary/60 to-primary transition-all duration-300 ease-in-out"
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                <p className="mt-1 text-xs text-primary-500">
                                  PDF, DOCX tot 5MB
                                </p>
                              </div>
                            </div>
                            
                            {/* Certificaten Upload */}
                            <div>
                              <FormLabel>Certificaten</FormLabel>
                              <div className="mt-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full sm:w-auto"
                                  onClick={() => {
                                    document.getElementById('certificate-upload')?.click();
                                  }}
                                  disabled={isCertificateUploading}
                                >
                                  {certificateFileName ? 'Certificaten Wijzigen' : 'Certificaten Uploaden'}
                                </Button>
                                <input
                                  id="certificate-upload"
                                  type="file"
                                  className="hidden"
                                  accept=".pdf"
                                  multiple
                                  onChange={handleCertificateChange}
                                  disabled={isCertificateUploading}
                                />
                                {certificateFileName && (
                                  <p className="mt-2 text-sm text-primary-800">
                                    Geselecteerd bestand: {certificateFileName}
                                  </p>
                                )}
                                
                                {/* Voortgangsbalk voor certificaat uploaden */}
                                {isCertificateUploading && (
                                  <div className="mt-3 w-full">
                                    <div className="relative pt-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="text-xs text-primary-800 font-medium">
                                          {certificateProgress < 100 
                                            ? `Certificaten worden geüpload (${Math.round(certificateProgress)}%)` 
                                            : "Upload voltooid!"}
                                        </div>
                                      </div>
                                      <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-gray-200">
                                        <div 
                                          style={{ width: `${certificateProgress}%` }}
                                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-primary/60 to-primary transition-all duration-300 ease-in-out"
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                <p className="mt-1 text-xs text-primary-500">
                                  Alleen PDF tot 5MB (meerdere certificaten mogelijk)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="sm:col-span-6 mt-6 border-t border-primary-100 pt-6">
                          <h2 className="text-lg font-medium text-primary-900 mb-4">Notities</h2>
                          <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Aanvullende informatie</FormLabel>
                                <FormControl>
                                  <Textarea rows={4} {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="sm:col-span-6 mt-4">
                          <Button 
                            type="submit"
                            className="tecnarit-blue-bg tecnarit-blue-border hover-lift touch-friendly w-full sm:w-auto"
                            disabled={isPending}
                          >
                            {isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isEditMode ? "Bijwerken..." : "Toevoegen..."}
                              </>
                            ) : (
                              <>
                                {isEditMode ? "Kandidaat Bijwerken" : "Kandidaat Toevoegen"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </div>
      </div>

    </>
  );
}
