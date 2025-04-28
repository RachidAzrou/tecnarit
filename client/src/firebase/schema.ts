import { z } from "zod";

// Gebruik dezelfde schema definities als shared/schema.ts, maar zonder drizzle-orm

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  name: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = {
  id: number;
  username: string;
  password: string;
  name: string | null;
};

export const insertCandidateSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  linkedinProfile: z.string().optional().nullable(),
  yearsOfExperience: z.number().optional().nullable(),
  status: z.string().default("beschikbaar"),
  unavailableUntil: z.date().optional().nullable(),
  client: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  profileImage: z.string().optional().nullable(),
});

export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = InsertCandidate & { id: number; createdAt: Date; };

// Firebase-specifieke type met string ID
export type FirebaseCandidate = Omit<Candidate, 'id'> & { id: string };

export const candidateFileSchema = z.object({
  id: z.number(),
  candidateId: z.number(),
  filename: z.string(),
  originalFilename: z.string(),
  fileType: z.string(),
  size: z.number(),
  uploadDate: z.date(),
  url: z.string(),
});

export type CandidateFile = z.infer<typeof candidateFileSchema>;