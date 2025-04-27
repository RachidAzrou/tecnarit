import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupFileRoutes } from "./upload";
import { insertCandidateSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Set up file upload routes
  setupFileRoutes(app);

  // Candidate CRUD routes
  app.get("/api/candidates", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const candidates = await storage.getCandidates();
      res.status(200).json(candidates);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/candidates/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id, 10);
      const candidate = await storage.getCandidate(id);
      
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      res.status(200).json(candidate);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/candidates", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Validate request body
      const validatedData = insertCandidateSchema.parse(req.body);
      
      // Create candidate
      const candidate = await storage.createCandidate(validatedData);
      
      res.status(201).json(candidate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });

  app.patch("/api/candidates/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id, 10);
      
      // Validate request body
      const validatedData = insertCandidateSchema.partial().parse(req.body);
      
      // Update candidate
      const candidate = await storage.updateCandidate(id, validatedData);
      
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      res.status(200).json(candidate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });

  app.delete("/api/candidates/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id, 10);
      
      // Get all files for the candidate
      const files = await storage.getCandidateFiles(id);
      
      // Delete the candidate
      const result = await storage.deleteCandidate(id);
      
      if (!result) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      // Delete all files associated with the candidate
      for (const file of files) {
        await storage.deleteCandidateFile(file.id);
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
