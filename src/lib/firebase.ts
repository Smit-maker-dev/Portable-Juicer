import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import firebaseConfigJson from "../../firebase-applet-config.json";

// Safely cast the configuration JSON to handle alternate schemas (e.g., service accounts or custom formats)
const fbJson = firebaseConfigJson as any;

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || fbJson.projectId || fbJson.project_id || "kuaxi-blend";

// Standard Vite environment variable mapping for production/Vercel with robust working fallbacks
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fbJson.apiKey || "AIzaSyAUuEG9-UeIJpxbuu86-ZurCn_lJRQZ1Ro",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fbJson.authDomain || "kuaxi-blend.firebaseapp.com",
  projectId: projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fbJson.storageBucket || "kuaxi-blend.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fbJson.messagingSenderId || "578546296781",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fbJson.appId || "1:578546296781:web:e5e014f08e05d680c78684",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || fbJson.measurementId || ""
};

// Initialize Firebase using the configuration, preventing multi-instance errors
const app = getApps().length === 0 ? initializeApp(config) : getApp();

export const auth = getAuth(app);
const dbId = import.meta.env.VITE_FIREBASE_DATABASE_ID || fbJson.firestoreDatabaseId || fbJson.firestore_database_id || "ai-studio-portableblenders-7c622bc0-462a-4435-8b4c-b9b125ab0de8";

// Initialize Firestore with force long polling enabled to handle network/proxy issues in iframe/Vercel environments seamlessly
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, dbId);

export const googleProvider = new GoogleAuthProvider();

// Standard scopes
googleProvider.addScope("profile");
googleProvider.addScope("email");

// Optional: Prompt for custom parameters if needed
googleProvider.setCustomParameters({
  prompt: "select_account"
});
