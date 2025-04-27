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
  Timestamp 
} from 'firebase/firestore';
import { db, storage, auth } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Candidate, InsertCandidate, CandidateFile } from '@shared/schema';

const CANDIDATES_COLLECTION = 'candidates';
const FILES_COLLECTION = 'candidateFiles';

// Get all candidates
export const getCandidates = async (): Promise<Candidate[]> => {
  try {
    const candidatesCol = collection(db, CANDIDATES_COLLECTION);
    const candidateSnapshot = await getDocs(candidatesCol);
    return candidateSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: parseInt(doc.id),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        linkedinProfile: data.linkedinProfile || null,
        yearsOfExperience: data.yearsOfExperience || null,
        status: data.status || 'beschikbaar',
        unavailableUntil: data.unavailableUntil ? new Date(data.unavailableUntil) : null,
        client: data.client || null,
        notes: data.notes || null,
        profileImage: data.profileImage || null,
        createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
      };
    });
  } catch (error) {
    console.error("Error getting candidates:", error);
    throw error;
  }
};

// Get a single candidate by ID
export const getCandidate = async (id: number): Promise<Candidate | undefined> => {
  try {
    const candidateDoc = doc(db, CANDIDATES_COLLECTION, id.toString());
    const candidateSnap = await getDoc(candidateDoc);
    
    if (!candidateSnap.exists()) {
      return undefined;
    }
    
    const data = candidateSnap.data();
    return {
      id: parseInt(candidateSnap.id),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || null,
      linkedinProfile: data.linkedinProfile || null,
      yearsOfExperience: data.yearsOfExperience || null,
      status: data.status || 'beschikbaar',
      unavailableUntil: data.unavailableUntil ? new Date(data.unavailableUntil) : null,
      client: data.client || null,
      notes: data.notes || null,
      profileImage: data.profileImage || null,
      createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
    };
    
  } catch (error) {
    console.error("Error getting candidate:", error);
    throw error;
  }
};

// Create a new candidate
export const createCandidate = async (candidate: InsertCandidate): Promise<Candidate> => {
  try {
    // Zorg ervoor dat de gebruiker is ingelogd
    if (!auth.currentUser) {
      throw new Error("Je moet ingelogd zijn om een kandidaat aan te maken");
    }
    
    const candidatesCol = collection(db, CANDIDATES_COLLECTION);
    
    // Prepare data for Firestore (especially timestamps)
    const candidateData = {
      ...candidate,
      unavailableUntil: candidate.unavailableUntil ? candidate.unavailableUntil.toISOString() : null,
      createdAt: serverTimestamp(),
      // Voeg de userId toe aan de kandidaat data voor beveiliging
      createdBy: auth.currentUser.uid
    };
    
    const docRef = await addDoc(candidatesCol, candidateData);
    
    // Return the created candidate with ID
    return {
      id: parseInt(docRef.id),
      ...candidate,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("Error creating candidate:", error);
    // Geef een meer specifieke foutmelding terug
    if (error instanceof Error) {
      if (error.message.includes("permission")) {
        throw new Error("Onvoldoende rechten. Controleer of je bent ingelogd en de juiste rechten hebt.");
      }
    }
    throw error;
  }
};

// Update a candidate
export const updateCandidate = async (id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined> => {
  try {
    // Zorg ervoor dat de gebruiker is ingelogd
    if (!auth.currentUser) {
      throw new Error("Je moet ingelogd zijn om een kandidaat bij te werken");
    }
    
    const candidateRef = doc(db, CANDIDATES_COLLECTION, id.toString());
    const candidateSnap = await getDoc(candidateRef);
    
    if (!candidateSnap.exists()) {
      return undefined;
    }
    
    // Prepare data for Firestore
    const updateData = { ...candidate };
    if (updateData.unavailableUntil instanceof Date) {
      updateData.unavailableUntil = updateData.unavailableUntil.toISOString();
    }
    
    await updateDoc(candidateRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser.uid
    });
    
    // Get updated candidate
    const updatedCandidateSnap = await getDoc(candidateRef);
    const data = updatedCandidateSnap.data();
    
    return {
      id,
      firstName: data?.firstName,
      lastName: data?.lastName,
      email: data?.email,
      phone: data?.phone || null,
      linkedinProfile: data?.linkedinProfile || null,
      yearsOfExperience: data?.yearsOfExperience || null,
      status: data?.status || 'beschikbaar',
      unavailableUntil: data?.unavailableUntil ? new Date(data.unavailableUntil) : null,
      client: data?.client || null,
      notes: data?.notes || null,
      profileImage: data?.profileImage || null,
      createdAt: data?.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
    };
  } catch (error) {
    console.error("Error updating candidate:", error);
    // Geef een meer specifieke foutmelding terug
    if (error instanceof Error) {
      if (error.message.includes("permission")) {
        throw new Error("Onvoldoende rechten. Controleer of je bent ingelogd en de juiste rechten hebt.");
      }
    }
    throw error;
  }
};

// Delete a candidate
export const deleteCandidate = async (id: number): Promise<boolean> => {
  try {
    // Zorg ervoor dat de gebruiker is ingelogd
    if (!auth.currentUser) {
      throw new Error("Je moet ingelogd zijn om een kandidaat te verwijderen");
    }
    
    const candidateRef = doc(db, CANDIDATES_COLLECTION, id.toString());
    await deleteDoc(candidateRef);
    
    // Also delete any files related to this candidate
    const filesCol = collection(db, FILES_COLLECTION);
    const q = query(filesCol, where("candidateId", "==", id));
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
    console.error("Error deleting candidate:", error);
    // Geef een meer specifieke foutmelding terug
    if (error instanceof Error) {
      if (error.message.includes("permission")) {
        throw new Error("Onvoldoende rechten. Controleer of je bent ingelogd en de juiste rechten hebt.");
      }
    }
    throw error;
  }
};

// Upload profile image
export const uploadProfileImage = async (candidateId: number, file: File): Promise<string> => {
  try {
    // Zorg ervoor dat de gebruiker is ingelogd
    if (!auth.currentUser) {
      throw new Error("Je moet ingelogd zijn om profielfoto's te uploaden");
    }
    
    const storageRef = ref(storage, `candidates/${candidateId}/profile/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update candidate with profile image URL
    const candidateRef = doc(db, CANDIDATES_COLLECTION, candidateId.toString());
    await updateDoc(candidateRef, {
      profileImage: downloadURL,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser.uid
    });
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    // Geef een meer specifieke foutmelding terug
    if (error instanceof Error) {
      if (error.message.includes("permission")) {
        throw new Error("Onvoldoende rechten. Controleer of je bent ingelogd en de juiste rechten hebt.");
      }
    }
    throw error;
  }
};

// Add candidate file (document like CV)
export const addCandidateFile = async (
  candidateId: number, 
  file: File, 
  fileName: string
): Promise<CandidateFile> => {
  try {
    const storageRef = ref(storage, `candidates/${candidateId}/documents/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Save file metadata in Firestore
    const filesCol = collection(db, FILES_COLLECTION);
    const docRef = await addDoc(filesCol, {
      candidateId,
      fileName,
      fileType: file.type,
      filePath: `candidates/${candidateId}/documents/${file.name}`,
      fileUrl: downloadURL,
      fileSize: file.size,
      uploadDate: serverTimestamp()
    });
    
    return {
      id: parseInt(docRef.id),
      candidateId,
      fileName,
      fileType: file.type,
      filePath: `candidates/${candidateId}/documents/${file.name}`,
      fileSize: file.size,
      uploadDate: new Date(),
    };
  } catch (error) {
    console.error("Error adding candidate file:", error);
    throw error;
  }
};

// Get candidate files
export const getCandidateFiles = async (candidateId: number): Promise<CandidateFile[]> => {
  try {
    const filesCol = collection(db, FILES_COLLECTION);
    const q = query(filesCol, where("candidateId", "==", candidateId));
    const filesSnapshot = await getDocs(q);
    
    return filesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: parseInt(doc.id),
        candidateId: data.candidateId,
        fileName: data.fileName,
        fileType: data.fileType,
        filePath: data.filePath,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        uploadDate: data.uploadDate ? new Date(data.uploadDate.toDate()) : new Date(),
      };
    });
  } catch (error) {
    console.error("Error getting candidate files:", error);
    throw error;
  }
};

// Delete candidate file
export const deleteCandidateFile = async (fileId: number): Promise<boolean> => {
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
    console.error("Error deleting candidate file:", error);
    throw error;
  }
};

// Get candidates filtered by status
export const getCandidatesByStatus = async (status: string): Promise<Candidate[]> => {
  try {
    const candidatesCol = collection(db, CANDIDATES_COLLECTION);
    const q = query(candidatesCol, where("status", "==", status));
    const candidateSnapshot = await getDocs(q);
    
    return candidateSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: parseInt(doc.id),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        linkedinProfile: data.linkedinProfile || null,
        yearsOfExperience: data.yearsOfExperience || null,
        status: data.status,
        unavailableUntil: data.unavailableUntil ? new Date(data.unavailableUntil) : null,
        client: data.client || null,
        notes: data.notes || null,
        profileImage: data.profileImage || null,
        createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
      };
    });
  } catch (error) {
    console.error(`Error getting candidates with status '${status}':`, error);
    throw error;
  }
};