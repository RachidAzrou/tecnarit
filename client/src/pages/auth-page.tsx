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
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
      
      <div className="z-10 flex w-full max-w-md flex-col items-center">
        <div className="mb-6 bg-white p-4 rounded-full shadow-lg">
          <img src={logoWithBg} alt="TECNARIT" className="h-16 w-16" />
        </div>
        
        <Card className="w-full border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold text-center mb-6 text-[#233142]">TECNARIT - EMS</h1>
            
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
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
                          className="w-full p-2.5 bg-white/70 border border-gray-300 rounded-md focus:bg-white"
                          placeholder="admin@tecnarit.com"
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
                      <FormLabel className="text-[#233142] font-medium">Wachtwoord</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          {...field} 
                          className="w-full p-2.5 bg-white/70 border border-gray-300 rounded-md focus:bg-white"
                          placeholder="admin123"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="text-[#83b74b] focus:ring-[#83b74b] rounded border-gray-400"
                        />
                      </FormControl>
                      <FormLabel className="text-sm text-gray-700 font-normal">Onthoud mij</FormLabel>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#83b74b] to-[#95d75e] hover:opacity-90 py-2.5 text-white rounded-md mt-4 font-medium shadow-md transition-all"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Bezig met inloggen..." : "Inloggen"}
                </Button>
                
                <div className="mt-5 rounded-md bg-[#233142]/10 p-3 text-center text-xs text-gray-700">
                  Gebruik de volgende demo inloggegevens:
                  <br />
                  E-mail: <span className="font-semibold">admin@tecnarit.com</span>
                  <br />
                  Wachtwoord: <span className="font-semibold">admin123</span>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
