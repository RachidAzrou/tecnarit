import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth } from './config';

// This function is used to create a test user for the demo
export const createTestUserIfNeeded = async (email: string, password: string) => {
  try {
    // Check if the email is already in use
    const methods = await fetchSignInMethodsForEmail(auth, email);
    if (methods.length === 0) {
      // Email is not in use, create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Demo user created successfully');
      return true;
    } else {
      // User already exists
      console.log('Demo user already exists');
      return true;
    }
  } catch (error: any) {
    console.error('Failed to create demo user:', error.message);
    return false;
  }
};

// Sign in with email and password
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Register with email and password
export const registerWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Sign in with Google
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Observer for auth state changes
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};