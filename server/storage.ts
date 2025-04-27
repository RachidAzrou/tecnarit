import { users, type User, type InsertUser, candidates, type Candidate, type InsertCandidate, type CandidateFile } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  sessionStore: session.SessionStore;
  
  // Candidate CRUD operations
  getCandidates(): Promise<Candidate[]>;
  getCandidate(id: number): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  deleteCandidate(id: number): Promise<boolean>;
  
  // File handling
  getCandidateFiles(candidateId: number): Promise<CandidateFile[]>;
  addCandidateFile(file: Omit<CandidateFile, "id">): Promise<CandidateFile>;
  deleteCandidateFile(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private candidates: Map<number, Candidate>;
  private files: Map<number, CandidateFile>;
  currentUserId: number;
  currentCandidateId: number;
  currentFileId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.candidates = new Map();
    this.files = new Map();
    this.currentUserId = 1;
    this.currentCandidateId = 1;
    this.currentFileId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24h in ms
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCandidates(): Promise<Candidate[]> {
    return Array.from(this.candidates.values());
  }

  async getCandidate(id: number): Promise<Candidate | undefined> {
    return this.candidates.get(id);
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const id = this.currentCandidateId++;
    
    // Ensure all nullable fields have default values
    const newCandidate: Candidate = {
      ...candidate, 
      id,
      status: candidate.status || "active",
      profileImage: candidate.profileImage || null,
      phone: candidate.phone || null,
      notes: candidate.notes || null,
      linkedinProfile: candidate.linkedinProfile || null,
      yearsOfExperience: candidate.yearsOfExperience || null,
      createdAt: new Date()
    };
    
    this.candidates.set(id, newCandidate);
    return newCandidate;
  }

  async updateCandidate(id: number, updates: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const candidate = this.candidates.get(id);
    if (!candidate) return undefined;
    
    const updatedCandidate: Candidate = {
      ...candidate,
      ...updates,
    };
    
    this.candidates.set(id, updatedCandidate);
    return updatedCandidate;
  }

  async deleteCandidate(id: number): Promise<boolean> {
    return this.candidates.delete(id);
  }

  async getCandidateFiles(candidateId: number): Promise<CandidateFile[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.candidateId === candidateId
    );
  }

  async addCandidateFile(file: Omit<CandidateFile, "id">): Promise<CandidateFile> {
    const id = this.currentFileId++;
    const newFile: CandidateFile = { ...file, id };
    this.files.set(id, newFile);
    return newFile;
  }

  async deleteCandidateFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }
}

export const storage = new MemStorage();
