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
      className="flex min-h-screen w-full items-center justify-center px-4 py-12"
      style={{ 
        backgroundImage: `url(${hexBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="z-10 w-full max-w-sm">
        <Card className="w-full border-0 bg-white rounded-lg shadow-2xl">
          <CardContent className="p-6">
            <div className="flex justify-center mb-6">
              <img src={logoWithBg} alt="TECNARIT" className="h-14 w-14" />
            </div>
            
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-[#233142]">TECNARIT - EMS</h1>
              <p className="text-sm text-gray-600 mt-1">Employee Management System</p>
            </div>
            
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">E-mailadres</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email" 
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#233142]"
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
                      <FormLabel className="text-gray-700">Wachtwoord</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          {...field} 
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#233142]"
                          placeholder="admin123"
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
                  className="w-full bg-[#233142] hover:bg-[#192331] py-2 text-white rounded font-medium transition-colors"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Bezig met inloggen..." : "Inloggen"}
                </Button>
                
                <div className="bg-gray-50 rounded p-3 text-xs text-center text-gray-600 mt-4">
                  <p className="mb-1 font-medium">Demo inloggegevens:</p>
                  <p>E-mail: <span className="font-semibold">admin@tecnarit.com</span></p>
                  <p>Wachtwoord: <span className="font-semibold">admin123</span></p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
