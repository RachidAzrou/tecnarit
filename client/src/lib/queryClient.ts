import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getCandidate, getCandidates, getCandidateFiles, getCandidatesByStatus } from "../firebase/candidates";
import { FirebaseCandidate, CandidateFile } from "@/firebase/schema";

// Deze functie is niet meer nodig voor Firebase maar we houden hem voor compatibiliteit
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log('apiRequest is deprecated, use Firebase functions directly instead');
  
  // Simuleer een Response object voor compatibiliteit
  const mockResponse: Partial<Response> = {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({ message: 'OK' })
  };
  
  return mockResponse as Response;
}

// Custom query function die Firebase gebruikt in plaats van API verzoeken
export const firebaseQueryFn: QueryFunction<any> = async ({ queryKey }) => {
  const key = queryKey[0] as string;
  
  // Voor kandidaatlijst
  if (key === 'candidates') {
    return getCandidates();
  }
  
  // Voor een specifieke kandidaat
  if (key.startsWith('candidates/') && !key.includes('/files')) {
    const candidateId = key.split('/')[1];
    const candidate = await getCandidate(candidateId);
    if (!candidate) throw new Error('Candidate not found');
    return candidate;
  }
  
  // Voor kandidaat bestanden
  if (key.includes('/files')) {
    const candidateId = key.split('/')[1];
    return getCandidateFiles(candidateId);
  }
  
  // Voor kandidaten gefilterd op status
  if (key.startsWith('candidatesByStatus/')) {
    const status = key.split('/')[1];
    return getCandidatesByStatus(status);
  }
  
  throw new Error(`Unsupported query key: ${key}`);
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: firebaseQueryFn,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
