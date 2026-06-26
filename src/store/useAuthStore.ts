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
      set({ error: err.message || "Failed to log in with Google", loading: false });
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
      // Secure logging: Log internally but do NOT propagate detailed information to the state or UI
      console.warn("Authentication failure detected and scrubbed for security");
      set({ error: "Incorrect email or password", loading: false });
      throw new Error("Incorrect email or password");
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
      // Secure logging: Log internally but do NOT propagate detailed user existence information
      console.warn("Registration failure detected and scrubbed for security");
      set({ error: "An error occurred during registration. Please try again.", loading: false });
      throw new Error("An error occurred during registration. Please try again.");
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
