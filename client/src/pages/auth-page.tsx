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
      className="flex min-h-screen w-full items-center justify-center p-4"
      style={{ 
        backgroundImage: `url(${hexBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-gray-900/20"></div>
      
      <div className="z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src={logoWithBg} alt="TECNARIT" className="h-20 w-20 drop-shadow-lg" />
          <h1 className="text-2xl font-bold mt-4 text-white drop-shadow-md">TECNARIT - EMS</h1>
        </div>
        
        <Card className="overflow-hidden border-0 shadow-2xl bg-white">
          <div className="h-2 bg-[#233142]"></div>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Log in op je account</h2>
              <p className="text-sm text-gray-500">Voer je inloggegevens in om toegang te krijgen</p>
            </div>
            
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 text-sm font-medium">E-mailadres</FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email" 
                            className="pl-10 w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:border-[#233142] focus:ring-1 focus:ring-[#233142]"
                            placeholder="admin@tecnarit.com"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 text-sm font-medium">Wachtwoord</FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                          </svg>
                        </div>
                        <FormControl>
                          <Input 
                            type="password" 
                            {...field} 
                            className="pl-10 w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:border-[#233142] focus:ring-1 focus:ring-[#233142]"
                            placeholder="admin123"
                          />
                        </FormControl>
                      </div>
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
                            className="text-[#233142] focus:ring-1 focus:ring-[#233142] rounded"
                          />
                        </FormControl>
                        <FormLabel className="text-sm text-gray-600 font-normal">Onthoud mij</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#233142] hover:bg-[#192331] py-2.5 text-white rounded-md font-medium transition-colors"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? 
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Bezig met inloggen...
                    </div> : 
                    "Inloggen"
                  }
                </Button>
                
                <div className="p-4 bg-blue-50 rounded-md border border-blue-100 mt-5">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-sm font-medium text-blue-600">Demo inloggegevens</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div className="flex mb-1">
                      <span className="font-medium w-24">E-mail:</span>
                      <span>admin@tecnarit.com</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-24">Wachtwoord:</span>
                      <span>admin123</span>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
