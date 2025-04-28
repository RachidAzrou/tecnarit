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
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);

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
      // Gebruik Firebase in plaats van de API
      const result = await createCandidate(formData);
      if (!result) throw new Error("Failed to create candidate");
      return result;
    },
    onSuccess: async (data: FirebaseCandidate) => {
      // Upload CV als die is geselecteerd
      if (resumeFile) {
        await addCandidateFile(data.id, resumeFile, "CV");
      }

      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast({
        title: "Kandidaat Toegevoegd",
        description: `${data.firstName} ${data.lastName} is toegevoegd aan het systeem.`,
      });
      setLocation("/");
    },
    onError: (error: Error) => {
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
      // Upload CV als die is geselecteerd
      if (resumeFile) {
        await addCandidateFile(data.id, resumeFile, "CV");
      }

      queryClient.invalidateQueries({ queryKey: [`candidates/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast({
        title: "Kandidaat Bijgewerkt",
        description: `${data.firstName} ${data.lastName} is bijgewerkt.`,
      });
      setLocation("/");
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
  const handleResumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Controleer de bestandsgrootte (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Bestand te groot",
        description: "Het CV moet kleiner zijn dan 5MB",
        variant: "destructive",
      });
      return;
    }

    setResumeFile(file);
    setResumeFileName(file.name);
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-8 md:p-10">
                  <div>
                    <div className="py-4 sm:p-0">
                      <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
                        {/* Basic Information */}
                        <div className="sm:col-span-6">
                          <h2 className="text-lg font-medium text-primary-900">Basis Informatie</h2>
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
                                  <Input type="tel" {...field} value={field.value || ''} />
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
                                  <Input {...field} value={field.value || ''} />
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

                        {/* Unavailable Until - alleen tonen als status "onbeschikbaar" is */}
                        {form.watch("status") === "onbeschikbaar" && (
                          <div className="sm:col-span-3">
                            <FormField
                              control={form.control}
                              name="unavailableUntil"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Onbeschikbaar tot</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant={"outline"}
                                          className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                          )}
                                        >
                                          {field.value ? (
                                            format(field.value, "PPP", { locale: nl })
                                          ) : (
                                            <span>Selecteer datum</span>
                                          )}
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={field.value || undefined}
                                        onSelect={field.onChange}
                                        initialFocus
                                        locale={nl}
                                      />
                                    </PopoverContent>
                                  </Popover>
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
                                <FormItem>
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

                        {/* Resume Upload */}
                        <div className="sm:col-span-6">
                          <FormLabel>CV Upload</FormLabel>
                          <div className="mt-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full sm:w-auto"
                              onClick={() => {
                                document.getElementById('resume-upload')?.click();
                              }}
                            >
                              {resumeFileName ? 'CV Wijzigen' : 'CV Uploaden'}
                            </Button>
                            <input
                              id="resume-upload"
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx"
                              onChange={handleResumeChange}
                            />
                            {resumeFileName && (
                              <p className="mt-2 text-sm text-primary-800">
                                Geselecteerd bestand: {resumeFileName}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-primary-500">
                              PDF, DOCX tot 5MB
                            </p>
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
