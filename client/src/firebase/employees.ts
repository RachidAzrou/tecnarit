import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  serverTimestamp, 
  DocumentReference,
  DocumentData
} from 'firebase/firestore';
import { db, storage } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Employee, InsertEmployee } from '@/firebase/schema';

const EMPLOYEES_COLLECTION = 'employees';
const FILES_COLLECTION = 'employeeFiles';

// Get all employees
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const employeesCol = collection(db, EMPLOYEES_COLLECTION);
    const employeeSnapshot = await getDocs(employeesCol);
    return employeeSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: parseInt(doc.id),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        department: data.department,
        position: data.position,
        hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
        salary: data.salary,
        profileImage: data.profileImage,
        notes: data.notes,
      };
    });
  } catch (error) {
    console.error("Error getting employees:", error);
    throw error;
  }
};

// Get a single employee by ID
export const getEmployee = async (id: number): Promise<Employee | undefined> => {
  try {
    const employeeDoc = doc(db, EMPLOYEES_COLLECTION, id.toString());
    const employeeSnap = await getDoc(employeeDoc);
    
    if (!employeeSnap.exists()) {
      return undefined;
    }
    
    const data = employeeSnap.data();
    return {
      id: parseInt(employeeSnap.id),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      department: data.department,
      position: data.position,
      hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
      salary: data.salary,
      profileImage: data.profileImage,
      notes: data.notes,
    };
    
  } catch (error) {
    console.error("Error getting employee:", error);
    throw error;
  }
};

// Create a new employee
export const createEmployee = async (employee: InsertEmployee): Promise<Employee> => {
  try {
    const employeesCol = collection(db, EMPLOYEES_COLLECTION);
    const docRef = await addDoc(employeesCol, {
      ...employee,
      hireDate: employee.hireDate ? employee.hireDate.toISOString() : null,
      createdAt: serverTimestamp()
    });
    
    // Return the created employee with ID
    return {
      id: parseInt(docRef.id),
      ...employee
    };
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error;
  }
};

// Update an employee
export const updateEmployee = async (id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> => {
  try {
    const employeeRef = doc(db, EMPLOYEES_COLLECTION, id.toString());
    const employeeSnap = await getDoc(employeeRef);
    
    if (!employeeSnap.exists()) {
      return undefined;
    }
    
    // Convert Date to ISO string for Firestore
    const updateData = { ...employee };
    if (updateData.hireDate instanceof Date) {
      updateData.hireDate = updateData.hireDate.toISOString();
    }
    
    await updateDoc(employeeRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    // Get updated employee
    const updatedEmployeeSnap = await getDoc(employeeRef);
    const data = updatedEmployeeSnap.data();
    
    return {
      id,
      firstName: data?.firstName,
      lastName: data?.lastName,
      email: data?.email,
      phone: data?.phone,
      department: data?.department,
      position: data?.position,
      hireDate: data?.hireDate ? new Date(data.hireDate) : undefined,
      salary: data?.salary,
      profileImage: data?.profileImage,
      notes: data?.notes,
    };
  } catch (error) {
    console.error("Error updating employee:", error);
    throw error;
  }
};

// Delete an employee
export const deleteEmployee = async (id: number): Promise<boolean> => {
  try {
    const employeeRef = doc(db, EMPLOYEES_COLLECTION, id.toString());
    await deleteDoc(employeeRef);
    
    // Also delete any files related to this employee
    const filesCol = collection(db, FILES_COLLECTION);
    const q = query(filesCol, where("employeeId", "==", id));
    const filesSnapshot = await getDocs(q);
    
    const deletePromises = filesSnapshot.docs.map(async (fileDoc) => {
      const fileData = fileDoc.data();
      
      // Delete from Storage if there's a path
      if (fileData.filePath) {
        const storageRef = ref(storage, fileData.filePath);
        await deleteObject(storageRef);
      }
      
      // Delete the file document
      await deleteDoc(fileDoc.ref);
    });
    
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error("Error deleting employee:", error);
    throw error;
  }
};

// Upload profile image
export const uploadProfileImage = async (employeeId: number, file: File): Promise<string> => {
  try {
    const storageRef = ref(storage, `employees/${employeeId}/profile/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update employee with profile image URL
    const employeeRef = doc(db, EMPLOYEES_COLLECTION, employeeId.toString());
    await updateDoc(employeeRef, {
      profileImage: downloadURL,
      updatedAt: serverTimestamp()
    });
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error;
  }
};

// Add employee file (document)
export const addEmployeeFile = async (
  employeeId: number, 
  file: File, 
  fileName: string
) => {
  try {
    const storageRef = ref(storage, `employees/${employeeId}/documents/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Save file metadata in Firestore
    const filesCol = collection(db, FILES_COLLECTION);
    const docRef = await addDoc(filesCol, {
      employeeId,
      fileName,
      fileType: file.type,
      filePath: `employees/${employeeId}/documents/${file.name}`,
      fileUrl: downloadURL,
      fileSize: file.size,
      uploadDate: serverTimestamp()
    });
    
    return {
      id: parseInt(docRef.id),
      employeeId,
      fileName,
      fileType: file.type,
      filePath: `employees/${employeeId}/documents/${file.name}`,
      fileSize: file.size,
      uploadDate: new Date(),
    };
  } catch (error) {
    console.error("Error adding employee file:", error);
    throw error;
  }
};

// Get employee files
export const getEmployeeFiles = async (employeeId: number) => {
  try {
    const filesCol = collection(db, FILES_COLLECTION);
    const q = query(filesCol, where("employeeId", "==", employeeId));
    const filesSnapshot = await getDocs(q);
    
    return filesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: parseInt(doc.id),
        employeeId: data.employeeId,
        fileName: data.fileName,
        fileType: data.fileType,
        filePath: data.filePath,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        uploadDate: data.uploadDate ? new Date(data.uploadDate.toDate()) : new Date(),
      };
    });
  } catch (error) {
    console.error("Error getting employee files:", error);
    throw error;
  }
};

// Delete employee file
export const deleteEmployeeFile = async (fileId: number): Promise<boolean> => {
  try {
    const fileRef = doc(db, FILES_COLLECTION, fileId.toString());
    const fileSnap = await getDoc(fileRef);
    
    if (fileSnap.exists()) {
      const fileData = fileSnap.data();
      
      // Delete from Storage
      if (fileData.filePath) {
        const storageRef = ref(storage, fileData.filePath);
        await deleteObject(storageRef);
      }
      
      // Delete the document
      await deleteDoc(fileRef);
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting employee file:", error);
    throw error;
  }
};