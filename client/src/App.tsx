import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import CandidateList from "@/pages/candidate-list";
import CandidateForm from "@/pages/candidate-form";
import CandidateDetail from "@/pages/candidate-detail";
import ProfilePage from "@/pages/profile-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import MobileHeader from "@/components/layout/mobile-header";
import MobileNavbar from "@/components/layout/mobile-navbar";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={CandidateList} />
      <ProtectedRoute path="/candidates/new" component={CandidateForm} />
      <ProtectedRoute path="/candidates/:id/edit" component={CandidateForm} />
      <ProtectedRoute path="/candidates/:id" component={CandidateDetail} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <MobileHeader />
          <Router />
          <MobileNavbar />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
