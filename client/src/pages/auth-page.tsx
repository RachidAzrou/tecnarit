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
import tecnaritLogo from "../assets/tecnarit-logo.png";

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

  // Demo login credentials message
  useEffect(() => {
    console.log("Test user credentials available: email: admin@tecnarit.com, password: admin123");
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
    <div className="min-h-screen flex flex-col md:flex-row bg-secondary/95">
      {/* Login Form Section */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-8">
            <img src={tecnaritLogo} alt="TECNARIT" className="h-24 object-contain" />
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight gradient-text">
            Inloggen bij TECNARIT
          </h2>
          <p className="mt-2 text-center text-sm text-foreground">
            Kandidaatbeheer Systeem
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="tecnarit-card border-primary/20 shadow-lg">
            <CardContent className="pt-6">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mailadres</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
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
                        <FormLabel>Wachtwoord</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
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
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">Onthoud mij</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-bg hover:opacity-90 transition-opacity"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Bezig met inloggen..." : "Inloggen"}
                  </Button>
                  
                  <div className="text-xs text-center text-muted-foreground mt-4">
                    <p>Demo Inloggegevens: e-mail: <span className="font-bold">admin@tecnarit.com</span>, wachtwoord: <span className="font-bold">admin123</span></p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hidden md:flex md:flex-1 navy-bg items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-secondary/80 via-secondary/50 to-transparent"></div>
        <div className="z-10 max-w-2xl mx-auto px-8 text-white">
          <h1 className="text-4xl font-bold mb-4 gradient-text">TECNARIT Kandidaatbeheer</h1>
          <p className="text-xl mb-6">
            Een moderne, intuïtieve oplossing voor het beheren van kandidaten.
          </p>
          <ul className="space-y-2 mb-8">
            <li className="flex items-center">
              <div className="rounded-full h-6 w-6 flex items-center justify-center gradient-bg mr-2">✓</div>
              <span>Eenvoudig kandidaten toevoegen en beheren</span>
            </li>
            <li className="flex items-center">
              <div className="rounded-full h-6 w-6 flex items-center justify-center gradient-bg mr-2">✓</div>
              <span>CV's en documenten uploaden en delen</span>
            </li>
            <li className="flex items-center">
              <div className="rounded-full h-6 w-6 flex items-center justify-center gradient-bg mr-2">✓</div>
              <span>Volg de status van ieder kandidaatproces</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
