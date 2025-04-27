import { Express, Request } from "express";
import express from "express";
import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import multer from "multer";
import { EmployeeFile } from "@shared/schema";

const mkdir = promisify(fs.mkdir);

// Create upload directory if it doesn't exist
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for multer
const fileStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const employeeId = req.params.id;
    const employeeDir = path.join(uploadDir, employeeId);
    
    // Create directory for employee if it doesn't exist
    if (!fs.existsSync(employeeDir)) {
      await mkdir(employeeDir, { recursive: true });
    }
    
    cb(null, employeeDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename to prevent overwriting
    const uniqueSuffix = crypto.randomBytes(8).toString("hex");
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  }
});

// Filter file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Define allowed file types
  const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
  const allowedDocTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  
  const isImageUpload = req.path.includes("profile-image");
  const isDocUpload = req.path.includes("documents");
  
  if (isImageUpload && allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else if (isDocUpload && [...allowedImageTypes, ...allowedDocTypes].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

export const upload = multer({ 
  storage: fileStorage, 
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

export function setupFileRoutes(app: Express) {
  // Upload profile image
  app.post("/api/employees/:id/profile-image", upload.single("profileImage"), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const employeeId = parseInt(req.params.id, 10);
      const employee = await storage.getEmployee(employeeId);
      
      if (!employee) {
        // Delete the uploaded file if employee not found
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: "Employee not found" });
      }
      
      // Update employee with profile image path
      const relativePath = path.relative(process.cwd(), req.file.path).replace(/\\/g, '/');
      const updatedEmployee = await storage.updateEmployee(employeeId, {
        profileImage: relativePath
      });
      
      res.status(200).json(updatedEmployee);
    } catch (error) {
      next(error);
    }
  });
  
  // Upload document for employee
  app.post("/api/employees/:id/documents", upload.single("document"), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const employeeId = parseInt(req.params.id, 10);
      const employee = await storage.getEmployee(employeeId);
      
      if (!employee) {
        // Delete the uploaded file if employee not found
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: "Employee not found" });
      }
      
      // Save file metadata
      const relativePath = path.relative(process.cwd(), req.file.path).replace(/\\/g, '/');
      const file = await storage.addEmployeeFile({
        employeeId,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        filePath: relativePath,
        fileSize: req.file.size,
        uploadDate: new Date()
      });
      
      res.status(201).json(file);
    } catch (error) {
      next(error);
    }
  });
  
  // Get employee files
  app.get("/api/employees/:id/files", async (req, res, next) => {
    try {
      const employeeId = parseInt(req.params.id, 10);
      const files = await storage.getEmployeeFiles(employeeId);
      res.status(200).json(files);
    } catch (error) {
      next(error);
    }
  });
  
  // Download file
  app.get("/api/files/:id", async (req, res, next) => {
    try {
      const employeeId = parseInt(req.params.employeeId, 10);
      const fileId = parseInt(req.params.id, 10);
      const files = await storage.getEmployeeFiles(employeeId);
      const file = files.find(f => f.id === fileId);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.download(path.join(process.cwd(), file.filePath), file.fileName);
    } catch (error) {
      next(error);
    }
  });
  
  // Delete file
  app.delete("/api/files/:id", async (req, res, next) => {
    try {
      const fileId = parseInt(req.params.id, 10);
      const allFiles = Array.from(await Promise.all(
        (await storage.getEmployees()).map(e => storage.getEmployeeFiles(e.id))
      )).flat();
      
      const file = allFiles.find(f => f.id === fileId);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      // Delete file from filesystem
      fs.unlinkSync(path.join(process.cwd(), file.filePath));
      
      // Delete file metadata from storage
      await storage.deleteEmployeeFile(fileId);
      
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  });
  
  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }, express.static(uploadDir));
}
