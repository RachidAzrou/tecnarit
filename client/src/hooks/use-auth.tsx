import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import {
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { InsertUser } from "@shared/schema";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  loginWithEmail, 
  registerWithEmail, 
  logout as firebaseLogout,
  subscribeToAuthChanges
} from "../firebase/auth";

// Extended user type that includes Firebase user data
export type UserType = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  username?: string | null;
};

type AuthContextType = {
  user: UserType | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<any, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<any, Error, RegisterData>;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  email: string;
  password: string;
  username?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<UserType | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Transform Firebase user to our user type
        const transformedUser: UserType = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          username: firebaseUser.email?.split('@')[0] || firebaseUser.displayName
        };
        
        setUser(transformedUser);
        setIsLoading(false);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // Firebase authentication
      const { user, error } = await loginWithEmail(credentials.email, credentials.password);
      if (error) throw new Error(error);
      return user;
    },
    onSuccess: (firebaseUser) => {
      toast({
        title: "Ingelogd",
        description: `Welkom terug!`,
      });
      
      // Invalidate any cached queries to force refetching
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      toast({
        title: "Login mislukt",
        description: error.message === "Firebase: Error (auth/invalid-credential)." 
          ? "Ongeldige inloggegevens, probeer opnieuw." 
          : error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      // Firebase authentication
      const { user, error } = await registerWithEmail(credentials.email, credentials.password);
      if (error) throw new Error(error);
      return user;
    },
    onSuccess: (firebaseUser) => {
      toast({
        title: "Registratie geslaagd",
        description: `Welkom bij TECNARIT!`,
      });
      
      // Invalidate any cached queries to force refetching
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      toast({
        title: "Registratie mislukt",
        description: error.message === "Firebase: Error (auth/email-already-in-use)."
          ? "Dit e-mailadres is al in gebruik."
          : error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Firebase logout
      const { error } = await firebaseLogout();
      if (error) throw new Error(error);
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.invalidateQueries();
      
      // Zet de user state op null
      setUser(null);
      
      toast({
        title: "Je bent uitgelogd",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Uitloggen mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
