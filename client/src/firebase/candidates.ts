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
import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  UploadTask,
  UploadTaskSnapshot
} from 'firebase/storage';
import { Candidate, FirebaseCandidate, InsertCandidate, CandidateFile } from '@/firebase/schema';

const CANDIDATES_COLLECTION = 'candidates';
const FILES_COLLECTION = 'candidateFiles';

// Get all candidates
export const getCandidates = async (): Promise<FirebaseCandidate[]> => {
  try {
    console.log("Ophalen van kandidaten van Firebase...");
    const candidatesCol = collection(db, CANDIDATES_COLLECTION);
    const candidateSnapshot = await getDocs(candidatesCol);
    
    console.log(`Ruwe kandidaat documenten gevonden: ${candidateSnapshot.size}`);
    
    // Debug info over elke kandidaat
    candidateSnapshot.docs.forEach((doc, index) => {
      console.log(`Kandidaat document ${index+1}:`);
      console.log(`  - Document ID: ${doc.id}`);
      console.log(`  - Data:`, doc.data());
    });
    
    const candidates = candidateSnapshot.docs.map(doc => {
      const data = doc.data();
      const candidateId = doc.id; // Behoud het als string zoals in FirebaseCandidate
      
      try {
        return {
          id: candidateId, // Gebruik de string ID direct
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
      } catch (err) {
        console.error(`Fout bij verwerken van kandidaat document ${candidateId}:`, err);
        console.error('Document data:', data);
        return null;
      }
    }).filter(Boolean) as FirebaseCandidate[]; // verwijder null waardes
    
    console.log(`${candidates.length} kandidaten opgehaald uit Firebase`);
    return candidates;
  } catch (error) {
    console.error("Error getting candidates:", error);
    throw error;
  }
};

// Get a single candidate by ID
export const getCandidate = async (id: string): Promise<FirebaseCandidate | undefined> => {
  try {
    const candidateDoc = doc(db, CANDIDATES_COLLECTION, id.toString());
    const candidateSnap = await getDoc(candidateDoc);
    
    if (!candidateSnap.exists()) {
      return undefined;
    }
    
    const data = candidateSnap.data();
    return {
      id: candidateSnap.id, // Gebruik het document ID als string
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
export const createCandidate = async (candidate: InsertCandidate): Promise<FirebaseCandidate> => {
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
    
    // Return the created candidate with string ID
    return {
      id: docRef.id, // Gebruik de string ID direct
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone || null,
      linkedinProfile: candidate.linkedinProfile || null,
      yearsOfExperience: candidate.yearsOfExperience || null,
      status: candidate.status || 'beschikbaar',
      unavailableUntil: candidate.unavailableUntil || null,
      client: candidate.client || null,
      notes: candidate.notes || null,
      profileImage: candidate.profileImage || null,
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
export const updateCandidate = async (id: string, candidate: Partial<InsertCandidate>): Promise<FirebaseCandidate | undefined> => {
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
    // Converteer Date naar string voor Firestore
    if (updateData.unavailableUntil instanceof Date) {
      // @ts-ignore - We weten dat dit een string wordt en dat is prima voor Firestore
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
export const deleteCandidate = async (id: string): Promise<boolean> => {
  try {
    console.log(`Verwijderen van kandidaat met ID: ${id}`);
    
    // Zorg ervoor dat de gebruiker is ingelogd
    if (!auth.currentUser) {
      throw new Error("Je moet ingelogd zijn om een kandidaat te verwijderen");
    }
    
    // Controleer eerst of de kandidaat bestaat - debug info toevoegen
    const candidateRef = doc(db, CANDIDATES_COLLECTION, id.toString());
    console.log(`Zoeken naar kandidaat document in collectie '${CANDIDATES_COLLECTION}' met ID: ${id.toString()}`);
    const candidateSnap = await getDoc(candidateRef);
    
    if (!candidateSnap.exists()) {
      console.warn(`Kandidaat met ID ${id} bestaat niet in Firebase. Probeer eerst alle kandidaten op te halen om debugging informatie te tonen.`);
      
      // Haal alle kandidaten op voor debugging
      const candidatesCollection = collection(db, CANDIDATES_COLLECTION);
      const allCandidatesSnap = await getDocs(candidatesCollection);
      console.log(`Er zijn in totaal ${allCandidatesSnap.size} kandidaten in de collectie`);
      allCandidatesSnap.forEach(doc => {
        console.log(`Kandidaat gevonden met ID: ${doc.id}, naam: ${doc.data().firstName} ${doc.data().lastName}`);
      });
      
      return true;
    }
    
    // Verwijder de kandidaat uit Firestore
    await deleteDoc(candidateRef);
    console.log(`Kandidaat document met ID ${id} verwijderd uit Firestore`);
    
    // Ook alle bijbehorende bestanden verwijderen
    const filesCol = collection(db, FILES_COLLECTION);
    const q = query(filesCol, where("candidateId", "==", id));
    const filesSnapshot = await getDocs(q);
    
    console.log(`${filesSnapshot.docs.length} bijbehorende bestanden gevonden om te verwijderen`);
    
    const deletePromises = filesSnapshot.docs.map(async (fileDoc) => {
      const fileData = fileDoc.data();
      const fileId = fileDoc.id;
      
      // Verwijder uit Storage als er een pad is
      if (fileData.filePath) {
        const storageRef = ref(storage, fileData.filePath);
        try {
          await deleteObject(storageRef);
          console.log(`Bestand verwijderd uit Storage: ${fileData.filePath}`);
        } catch (storageError) {
          console.error(`Fout bij verwijderen bestand uit Storage: ${fileData.filePath}`, storageError);
        }
      }
      
      // Verwijder het document
      await deleteDoc(fileDoc.ref);
      console.log(`Bestandsmetadata met ID ${fileId} verwijderd uit Firestore`);
    });
    
    await Promise.all(deletePromises);
    console.log(`Kandidaat en alle bijbehorende bestanden succesvol verwijderd`);
    
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
export const uploadProfileImage = async (candidateId: string, file: File): Promise<string> => {
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

// Vernieuwde, snellere versie voor het toevoegen van bestanden
export const addCandidateFile = async (
  candidateId: string, 
  file: File, 
  fileName: string,
  onProgress?: (percentage: number) => void
): Promise<CandidateFile> => {
  try {
    // Zorg ervoor dat de gebruiker is ingelogd
    if (!auth.currentUser) {
      throw new Error("Je moet ingelogd zijn om bestanden te uploaden");
    }

    // Controleer bestandsgrootte vooraf
    if (file.size > 10 * 1024 * 1024) { // 10MB limiet
      throw new Error("Bestand is te groot, maximale grootte is 10MB");
    }
    
    // Initiële voortgangsmelding
    onProgress?.(10);
    
    // Unieke bestandsnaam genereren met timestamp
    const timestamp = new Date().getTime();
    const fileNameWithTimestamp = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `candidates/${candidateId}/documents/${fileNameWithTimestamp}`;
    
    console.log(`Bestand voorbereiden voor upload: ${fileName} (${file.size} bytes)`);
    
    // 1. Direct uploaden naar Firebase Storage zonder eerst een document aan te maken
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // Functie om uploadvoortgang te volgen
    return new Promise<CandidateFile>((resolve, reject) => {
      uploadTask.on(
        'state_changed', 
        // Voortgang bijhouden
        (snapshot: UploadTaskSnapshot) => {
          // Gebruik volledige range van 10-90% voor uploadvoortgang
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 80) + 10;
          onProgress?.(progress);
        },
        // Fout afhandelen
        (error) => {
          console.error('Upload error:', error);
          
          // Specifiekere foutmeldingen geven
          if (error.code === 'storage/unauthorized') {
            reject(new Error("Geen toestemming voor deze upload. Controleer je rechten."));
          } else if (error.code === 'storage/canceled') {
            reject(new Error("Upload is geannuleerd."));
          } else if (error.code === 'storage/retry-limit-exceeded') {
            reject(new Error("Upload mislukt door netwerkproblemen. Controleer je verbinding."));
          } else {
            reject(error);
          }
        },
        // Voltooid - nu pas Firestore-document aanmaken
        async () => {
          try {
            // URL ophalen
            console.log('Upload voltooid, URL ophalen');
            const downloadURL = await getDownloadURL(storageRef);
            
            onProgress?.(95);
            
            // Nu pas het document aanmaken met alle informatie in één keer
            const filesCol = collection(db, FILES_COLLECTION);
            const docRef = await addDoc(filesCol, {
              candidateId,
              fileName,
              fileType: file.type,
              filePath: filePath,
              fileUrl: downloadURL,
              fileSize: file.size,
              uploadDate: serverTimestamp(),
              uploadedBy: auth.currentUser.uid,
              status: 'completed'
            });
            
            console.log(`Document aangemaakt in Firestore, ID: ${docRef.id}`);
            onProgress?.(100);
            
            // Resultaat teruggeven
            resolve({
              id: docRef.id,
              candidateId,
              fileName,
              fileType: file.type,
              filePath,
              fileSize: file.size,
              uploadDate: new Date(),
            });
          } catch (error) {
            console.error('Error bij afronden van upload:', error);
            
            // Probeer het bestand uit Storage te verwijderen als er iets misgaat met het document
            try {
              await deleteObject(storageRef);
              console.log('Bestand verwijderd uit Storage na fout bij documentaanmaak');
            } catch (e) {
              console.error('Kon bestand niet verwijderen na fout:', e);
            }
            
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error("Error adding candidate file:", error);
    
    // Geef een meer specifieke foutmelding terug
    if (error instanceof Error) {
      if (error.message.includes("permission")) {
        throw new Error("Onvoldoende rechten. Controleer of je bent ingelogd en de juiste rechten hebt.");
      } else if (error.message.includes("network")) {
        throw new Error("Netwerkfout. Controleer je internetverbinding en probeer het opnieuw.");
      } else if (error.message.includes("storage/quota-exceeded")) {
        throw new Error("Opslaglimiet bereikt. Neem contact op met de systeembeheerder.");
      }
    }
    throw error;
  }
};

// Get candidate files
export const getCandidateFiles = async (candidateId: string): Promise<CandidateFile[]> => {
  try {
    console.log("Ophalen bestanden voor kandidaat:", candidateId);
    const filesCol = collection(db, FILES_COLLECTION);
    const q = query(filesCol, where("candidateId", "==", candidateId));
    const filesSnapshot = await getDocs(q);
    
    console.log(`${filesSnapshot.docs.length} bestanden gevonden`);
    
    return filesSnapshot.docs.map(doc => {
      const data = doc.data();
      console.log("Bestand document ID:", doc.id);
      return {
        id: doc.id, // Gebruik string ID in plaats van parseInt
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

// Nieuwe, vereenvoudigde implementatie voor het verwijderen van bestanden
export const deleteCandidateFile = async (fileId: number | string): Promise<boolean> => {
  try {
    console.log(`*** DEBUGGING: Verwijderen van bestand met ID: ${fileId} (type: ${typeof fileId}) ***`);
    
    // Controleer of de gebruiker is ingelogd
    if (!auth.currentUser) {
      console.error("Gebruiker niet ingelogd");
      throw new Error("Je moet ingelogd zijn om bestanden te verwijderen");
    }
    
    // Converteer naar string voor consistentie
    const fileIdStr = String(fileId);
    console.log(`*** DEBUGGING: ID als string: ${fileIdStr} ***`);
    
    // Eerst document ophalen om het pad te krijgen
    const fileDocRef = doc(db, FILES_COLLECTION, fileIdStr);
    const docSnapshot = await getDoc(fileDocRef);
    
    if (!docSnapshot.exists()) {
      console.error(`Document met ID ${fileIdStr} bestaat niet`);
      throw new Error(`Bestand niet gevonden: ${fileIdStr}`);
    }
    
    const fileData = docSnapshot.data();
    console.log(`*** DEBUGGING: Bestandsdata opgehaald: `, fileData);
    
    // Document direct verwijderen
    console.log(`*** DEBUGGING: Document verwijderen: ${fileIdStr} ***`);
    await deleteDoc(fileDocRef);
    console.log(`*** DEBUGGING: Document verwijderd ***`);
    
    // Probeer daarna het bestand uit Storage te verwijderen (niet wachten)
    if (fileData.filePath) {
      try {
        const storageFileRef = ref(storage, fileData.filePath);
        console.log(`*** DEBUGGING: Storage pad: ${fileData.filePath} ***`);
        // We verwijderen het bestand, maar wachten er niet op
        deleteObject(storageFileRef)
          .then(() => console.log(`*** DEBUGGING: Bestand uit storage verwijderd ***`))
          .catch(err => console.warn(`Probleem bij verwijderen uit Storage: ${err instanceof Error ? err.message : 'Onbekende fout'}`, err));
      } catch (err) {
        console.warn(`Probleem bij aanmaken storage reference: ${err instanceof Error ? err.message : 'Onbekende fout'}`, err);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Fout bij het verwijderen van het bestand:", error);
    throw error;
  }
};

// Get candidates filtered by status
export const getCandidatesByStatus = async (status: string): Promise<FirebaseCandidate[]> => {
  try {
    const candidatesCol = collection(db, CANDIDATES_COLLECTION);
    const q = query(candidatesCol, where("status", "==", status));
    const candidateSnapshot = await getDocs(q);
    
    return candidateSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id, // Gebruik string ID
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