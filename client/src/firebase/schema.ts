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
  birthDate: z.date().optional().nullable(),
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
  candidateId: z.number().or(z.string()),
  fileType: z.string(),
  uploadDate: z.date(),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number(),
  // Compatibiliteit met de oude API
  filename: z.string().optional(),
  originalFilename: z.string().optional(),
  size: z.number().optional(),
  url: z.string().optional(),
});

export type CandidateFile = z.infer<typeof candidateFileSchema>;

// Employee types
export const insertEmployeeSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  position: z.string(),
  department: z.string(),
  startDate: z.string(),
  status: z.string().default("active"),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  profileImage: z.string().optional().nullable(),
  // Compatibiliteit met oudere versies
  hireDate: z.date().optional(),
  salary: z.number().optional(),
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = InsertEmployee & { id: number; };

export type EmployeeFile = {
  id: number;
  employeeId: number;
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
  uploadDate: Date;
  // Compatibiliteit met de API
  fileUrl?: string;
};