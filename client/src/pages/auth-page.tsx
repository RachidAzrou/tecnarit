import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import logoWithBg from "@assets/Color logo with background.png";
import blueBackground from "@assets/v915-wit-011-a.jpg";

// Create Firebase login schema
const loginSchema = z.object({
  email: z.string().email({ message: "Voer een geldig e-mailadres in" }),
  password: z.string().min(6, { message: "Wachtwoord moet minstens 6 tekens bevatten" }),
  rememberMe: z.boolean().optional(),
});

export default function AuthPage() {
  const { loginMutation, user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Create demo user and display login credentials
  useEffect(() => {
    // Create the demo user in Firebase
    const setupDemoUser = async () => {
      try {
        const { createTestUserIfNeeded } = await import('../firebase/auth');
        await createTestUserIfNeeded('admin@tecnarit.com', 'admin123');
        console.log("Test user credentials available: email: admin@tecnarit.com, password: admin123");
      } catch (error) {
        console.error("Error setting up demo user:", error);
      }
    };
    
    setupDemoUser();
  }, []);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    const { email, password } = values;
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Hero Section - Now on the left for desktop */}
      <div className="hidden md:flex md:flex-1 items-center justify-center relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{ backgroundImage: `url(${blueBackground})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#233142]/90 to-[#233142]/80"></div>
        
        <div className="relative z-10 max-w-xl mx-auto px-8 py-16 text-white">
          <div className="mb-8">
            <img src={logoWithBg} alt="TECNARIT" className="h-20 object-contain" />
          </div>
          
          <h1 className="text-4xl font-bold mb-6 text-white">
            <span className="block">EMS - Employee</span>
            <span className="block">Management System</span>
          </h1>
          
          <p className="text-xl mb-8 text-white/90">
            Een geavanceerd platform voor het beheren van kandidaten en werknemers
          </p>
          
          <div className="space-y-6 mb-8">
            <div className="flex items-start">
              <div className="rounded-full h-8 w-8 flex items-center justify-center bg-[#233142] border-2 border-primary mr-4 mt-1 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Efficiënt werknemersbeheer</h3>
                <p className="text-white/80">Beheer uw kandidaten en volg hun voortgang in een intuïtieve interface</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="rounded-full h-8 w-8 flex items-center justify-center bg-[#233142] border-2 border-primary mr-4 mt-1 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Document management</h3>
                <p className="text-white/80">Upload en organiseer CV's en andere belangrijke documenten</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="rounded-full h-8 w-8 flex items-center justify-center bg-[#233142] border-2 border-primary mr-4 mt-1 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Realtime statistieken</h3>
                <p className="text-white/80">Krijg direct inzicht in de status van uw kandidaatpool</p>
              </div>
            </div>
          </div>
          
          <div className="inline-flex rounded-md shadow">
            <div className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-[#233142] bg-white hover:bg-white/90 transition">
              Powered by TECNARIT
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Section - Now on the right for desktop */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-8 lg:px-12 relative">
        <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
          <div className="text-center mb-10 md:hidden">
            <img src={logoWithBg} alt="TECNARIT" className="h-20 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-[#233142]">TECNARIT - EMS</h1>
            <p className="text-sm text-gray-600 mt-1">Employee Management System</p>
          </div>
          
          <h2 className="text-center text-3xl font-bold tecnarit-blue-text hidden md:block">
            Welkom Terug
          </h2>
          <p className="mt-2 text-center text-gray-600 text-sm hidden md:block">
            Log in om door te gaan naar het Employee Management System
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="overflow-hidden shadow-xl rounded-xl border-0">
            <div className="h-1 bg-gradient-to-r from-primary via-primary to-accent"></div>
            <CardContent className="pt-6 p-8">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#233142] font-medium">E-mailadres</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email" 
                            className="rounded-lg border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="voer je e-mailadres in"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-[#233142] font-medium">Wachtwoord</FormLabel>
                        </div>
                        <FormControl>
                          <Input 
                            type="password" 
                            {...field} 
                            className="rounded-lg border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="voer je wachtwoord in"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="text-primary focus:ring-primary"
                            />
                          </FormControl>
                          <FormLabel className="text-sm text-gray-600 font-normal">Onthoud mij</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full tecnarit-blue-bg py-3 rounded-lg font-medium text-white"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Bezig met inloggen..." : "Inloggen"}
                  </Button>
                  
                  <div className="text-xs text-center text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
                    <p>Demo Inloggegevens: <br/> 
                      E-mail: <span className="font-bold">admin@tecnarit.com</span><br/> 
                      Wachtwoord: <span className="font-bold">admin123</span>
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
