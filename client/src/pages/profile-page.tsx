import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateProfile } from "firebase/auth";
import { auth } from "@/firebase/config";

const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: "Naam moet minimaal 2 karakters zijn",
  }),
  email: z.string().email({
    message: "Ongeldig e-mailadres",
  }).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      email: user?.email || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!auth.currentUser) {
      toast({
        title: "Fout bij bijwerken profiel",
        description: "Je bent niet ingelogd",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    
    try {
      await updateProfile(auth.currentUser, {
        displayName: data.displayName
      });
      
      toast({
        title: "Profiel bijgewerkt",
        description: "Je profielgegevens zijn succesvol bijgewerkt",
      });
    } catch (error) {
      console.error("Fout bij bijwerken profiel:", error);
      toast({
        title: "Fout bij bijwerken profiel",
        description: "Er is iets misgegaan bij het bijwerken van je profiel",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container max-w-4xl py-6 sm:py-10">
      <div className="text-center mb-8 lg:block hidden">
        <h1 className="text-3xl md:text-4xl tecnarit-blue-text font-bold">Jouw Profiel</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 overflow-hidden glass-effect">
          <CardHeader className="pb-0">
            <CardTitle>Profielfoto</CardTitle>
            <CardDescription>Je huidige profielfoto</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="relative w-32 h-32 mb-4">
              <Avatar className="w-full h-full border-4 border-primary/10">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback className="bg-primary/5">
                  <User className="h-12 w-12 text-primary/50" />
                </AvatarFallback>
              </Avatar>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-primary/30"
              disabled
            >
              Foto Wijzigen
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Foto wijzigen functionaliteit komt binnenkort beschikbaar</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 glass-effect">
          <CardHeader>
            <CardTitle>Persoonlijke Gegevens</CardTitle>
            <CardDescription>Beheer je persoonlijke informatie</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Naam</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Jouw naam"
                          {...field}
                          className="border-primary/30 focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mailadres</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="jouw@email.nl"
                          {...field}
                          disabled
                          className="border-primary/30 bg-muted/40"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">E-mailadres kan niet worden gewijzigd</p>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={isUpdating} 
                    className="tecnarit-blue-bg transition-all hover-lift touch-friendly"
                  >
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Profiel Opslaan
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}