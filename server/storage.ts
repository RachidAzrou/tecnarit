import { users, type User, type InsertUser, employees, type Employee, type InsertEmployee, type EmployeeFile } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  sessionStore: session.SessionStore;
  
  // Employee CRUD operations
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;
  
  // File handling
  getEmployeeFiles(employeeId: number): Promise<EmployeeFile[]>;
  addEmployeeFile(file: Omit<EmployeeFile, "id">): Promise<EmployeeFile>;
  deleteEmployeeFile(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private employees: Map<number, Employee>;
  private files: Map<number, EmployeeFile>;
  currentUserId: number;
  currentEmployeeId: number;
  currentFileId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.employees = new Map();
    this.files = new Map();
    this.currentUserId = 1;
    this.currentEmployeeId = 1;
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

  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = this.currentEmployeeId++;
    const newEmployee: Employee = {
      ...employee, 
      id,
      createdAt: new Date()
    };
    this.employees.set(id, newEmployee);
    return newEmployee;
  }

  async updateEmployee(id: number, updates: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;
    
    const updatedEmployee: Employee = {
      ...employee,
      ...updates,
    };
    
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    return this.employees.delete(id);
  }

  async getEmployeeFiles(employeeId: number): Promise<EmployeeFile[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.employeeId === employeeId
    );
  }

  async addEmployeeFile(file: Omit<EmployeeFile, "id">): Promise<EmployeeFile> {
    const id = this.currentFileId++;
    const newFile: EmployeeFile = { ...file, id };
    this.files.set(id, newFile);
    return newFile;
  }

  async deleteEmployeeFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }
}

export const storage = new MemStorage();
