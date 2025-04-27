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
import cactusLogo from "@assets/browser.png";
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#233142] p-4"
         style={{
           backgroundImage: `url(${blueBackground})`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundBlendMode: 'overlay',
           backgroundColor: 'rgba(35, 49, 66, 0.92)',
         }}>
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-center">
          <img src={cactusLogo} alt="TECNARIT" className="h-28 w-auto drop-shadow-xl" />
        </div>
        <h1 className="text-2xl font-bold text-center text-white mt-4">TECNARIT - EMS</h1>
      </div>
      
      <Card className="w-full max-w-md border-0 shadow-lg overflow-hidden">
        <div className="h-1.5 bg-[#65C366]"></div>
        <CardContent className="pt-6 p-8">
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">E-mailadres</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="email" 
                        className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#233142] focus:border-[#233142]"
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
                    <FormLabel className="text-gray-700 font-medium">Wachtwoord</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        {...field} 
                        className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#233142] focus:border-[#233142]"
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
                        className="text-[#233142] focus:ring-1 focus:ring-[#233142] rounded"
                      />
                    </FormControl>
                    <FormLabel className="text-sm text-gray-600 font-normal">Onthoud mij</FormLabel>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-[#65C366] hover:bg-[#559e56] py-2.5 text-white rounded-md mt-2 font-medium transition-colors"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Bezig met inloggen..." : "Inloggen"}
              </Button>
              
              <div className="text-xs text-center text-gray-500 mt-4 p-3 bg-gray-100 rounded-md">
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
  );
}
