import { create } from "zustand";
import { 
  User, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  setInitialized: (init: boolean) => void;
  setUser: (user: UserProfile | null) => void;
  setError: (err: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  initialized: false,

  setUser: (user) => set({ user, loading: false }),
  setInitialized: (initialized) => set({ initialized }),
  setError: (error) => set({ error }),

  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      set({
        user: {
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
          photoURL: u.photoURL,
        },
        loading: false,
      });
    } catch (err: any) {
      console.error("Google login failed", err);
      let friendlyMessage = "Failed to log in with Google";
      
      if (err.code === "auth/unauthorized-domain") {
        friendlyMessage = "Unauthorized Domain: Please add this URL to 'Authorized Domains' in your Firebase Console.";
      } else if (err.code === "auth/popup-blocked") {
        friendlyMessage = "Popup Blocked: Please allow popups for this site to sign in with Google.";
      } else if (err.code === "auth/cancelled-popup-request") {
        friendlyMessage = "Sign-in was cancelled. Please try again.";
      } else if (err.code === "auth/popup-closed-by-user") {
        friendlyMessage = "The sign-in popup was closed before completion.";
      } else if (err.message) {
        friendlyMessage = err.message;
      }
      
      set({ error: friendlyMessage, loading: false });
      throw err;
    }
  },

  signInWithEmail: async (email, pass) => {
    set({ loading: true, error: null });
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const u = result.user;
      set({
        user: {
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
          photoURL: u.photoURL,
        },
        loading: false,
      });
    } catch (err: any) {
      console.error("Authentication error:", err);
      let friendlyMessage = "Incorrect email or password";
      
      if (err.code === "auth/invalid-email") {
        friendlyMessage = "The email address is invalid.";
      } else if (err.code === "auth/user-disabled") {
        friendlyMessage = "This user account has been disabled.";
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        friendlyMessage = "Incorrect email or password";
      } else if (err.code === "auth/too-many-requests") {
        friendlyMessage = "Too many failed attempts. Please try again later.";
      } else if (err.message) {
        friendlyMessage = err.message;
      }
      
      set({ error: friendlyMessage, loading: false });
      throw err;
    }
  },

  signUpWithEmail: async (email, pass, name) => {
    set({ loading: true, error: null });
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      const u = result.user;
      await updateProfile(u, { displayName: name });
      set({
        user: {
          uid: u.uid,
          email: u.email,
          displayName: name,
          photoURL: u.photoURL,
        },
        loading: false,
      });
    } catch (err: any) {
      console.error("Registration error:", err);
      let friendlyMessage = "An error occurred during registration. Please try again.";
      
      if (err.code === "auth/email-already-in-use") {
        friendlyMessage = "This email address is already registered.";
      } else if (err.code === "auth/weak-password") {
        friendlyMessage = "The password is too weak. Please use at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        friendlyMessage = "The email address is invalid.";
      } else if (err.code === "auth/operation-not-allowed") {
        friendlyMessage = "Email/password accounts are not enabled. Please contact support.";
      } else if (err.message) {
        friendlyMessage = err.message;
      }
      
      set({ error: friendlyMessage, loading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await signOut(auth);
      set({ user: null, loading: false });
    } catch (err: any) {
      console.error("Logout failed", err);
      set({ error: err.message, loading: false });
    }
  },
}));

// Setup listener for firebase auth changes
onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    useAuthStore.getState().setUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    });
  } else {
    useAuthStore.getState().setUser(null);
  }
  useAuthStore.getState().setInitialized(true);
});
