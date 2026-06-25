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
      console.error("Email login failed", err);
      set({ error: err.message || "Invalid email or password", loading: false });
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
      console.error("Signup failed", err);
      set({ error: err.message || "Failed to create an account", loading: false });
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
