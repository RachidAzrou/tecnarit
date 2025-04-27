import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupFileRoutes } from "./upload";
import { insertEmployeeSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Set up file upload routes
  setupFileRoutes(app);

  // Employee CRUD routes
  app.get("/api/employees", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const employees = await storage.getEmployees();
      res.status(200).json(employees);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/employees/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id, 10);
      const employee = await storage.getEmployee(id);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      res.status(200).json(employee);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/employees", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Validate request body
      const validatedData = insertEmployeeSchema.parse(req.body);
      
      // Create employee
      const employee = await storage.createEmployee(validatedData);
      
      res.status(201).json(employee);
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

  app.patch("/api/employees/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id, 10);
      
      // Validate request body
      const validatedData = insertEmployeeSchema.partial().parse(req.body);
      
      // Update employee
      const employee = await storage.updateEmployee(id, validatedData);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      res.status(200).json(employee);
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

  app.delete("/api/employees/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id, 10);
      
      // Get all files for the employee
      const files = await storage.getEmployeeFiles(id);
      
      // Delete the employee
      const result = await storage.deleteEmployee(id);
      
      if (!result) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      // Delete all files associated with the employee
      for (const file of files) {
        await storage.deleteEmployeeFile(file.id);
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
