import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  linkedinProfile: text("linkedin_profile"),
  yearsOfExperience: integer("years_of_experience"),
  status: text("status").notNull().default("beschikbaar"),
  unavailableUntil: timestamp("unavailable_until"),
  client: text("client"),
  notes: text("notes"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  createdAt: true,
});

export const candidateFileSchema = z.object({
  id: z.number(),
  candidateId: z.union([z.string(), z.number()]), // Ondersteuning voor zowel string als number ID's
  fileName: z.string(),
  fileType: z.string(),
  filePath: z.string(),
  fileSize: z.number(),
  uploadDate: z.date(),
});

export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidates.$inferSelect;

// Firebase aangepaste kandidaat type (werkt met string ID's)
export type FirebaseCandidate = Omit<Candidate, 'id'> & { id: string };

export type CandidateFile = z.infer<typeof candidateFileSchema>;
