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
import { IconInput } from "../components/ui/icon-input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import logoWithBg from "@assets/Color logo with background.png";
import hexBackground from "@assets/1259.jpg";

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
    <div 
      className="flex min-h-screen w-full items-center justify-center px-4 py-12"
      style={{ 
        backgroundImage: `url(${hexBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Gradient overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30"></div>
      
      <div className="z-10 w-full max-w-md">
        {/* White container with subtle border and shadow */}
        <Card className="w-full border-0 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
          {/* Top accent border with gradient */}
          <div className="h-2 bg-gradient-to-r from-[#233142] to-[#455d7a]"></div>
          
          <CardContent className="p-10">
            {/* Logo with better styling */}
            <div className="flex justify-center mb-8">
              <div className="relative p-2">
                <div className="absolute inset-0 bg-gradient-to-r from-[#233142] to-[#233142] rounded-xl"></div>
                <img 
                  src={logoWithBg} 
                  alt="TECNARIT" 
                  className="h-36 w-[350px] relative object-contain" 
                />
              </div>
            </div>
            
            {/* Title with more emphasis */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[#233142]">
                Employee Management System
              </h1>
              <div className="mt-2 w-20 h-1 bg-gradient-to-r from-[#83b74b] to-[#95d75e] mx-auto rounded-full"></div>
            </div>
            
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">E-mailadres</FormLabel>
                      <FormControl>
                        <IconInput 
                          {...field} 
                          type="email" 
                          placeholder="Voer uw e-mailadres in"
                          icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 5L11 13 2 5" />
                              <path d="M2 5H22V19H2z" />
                            </svg>
                          }
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
                      <FormLabel className="text-gray-700 font-medium">Wachtwoord</FormLabel>
                      <FormControl>
                        <IconInput 
                          type="password" 
                          {...field} 
                          placeholder="Voer uw wachtwoord in"
                          icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between mt-2">
                  <FormField
                    control={loginForm.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="text-[#233142] focus:ring-1 focus:ring-[#233142] rounded-sm h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel className="text-sm text-gray-600 font-normal">Onthoud mij</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full mt-2 bg-gradient-to-r from-[#233142] to-[#455d7a] hover:from-[#1d2a39] hover:to-[#3a4d65] py-3 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Bezig met inloggen...
                    </div>
                  ) : "Inloggen"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* App versie informatie */}
        <div className="text-center mt-4 text-sm text-white/80">
          <p>TECNARIT EMS v1.2.0</p>
        </div>
      </div>
    </div>
  );
}
