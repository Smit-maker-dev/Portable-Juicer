import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { X, Mail, Lock, User, Loader2, AlertCircle, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuthStore();

  // Input validation and sanitization helpers (Standard 2)
  const sanitizeInput = (val: string): string => {
    if (!val) return "";
    return val
      .replace(/<[^>]*>/g, "") // Strip HTML tags
      .replace(/javascript:/gi, "") // Remove dangerous script schemes
      .trim();
  };

  const validateEmailFormat = (val: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(val) && val.length <= 150;
  };

  const validatePasswordFormat = (val: string): boolean => {
    // Password must be between 6 and 128 characters (Firebase default min is 6)
    return val.length >= 6 && val.length <= 128;
  };

  const validateNameFormat = (val: string): boolean => {
    // Be more permissive with names, just check length and basic trim
    return val.trim().length >= 2 && val.trim().length <= 100;
  };

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Auth Modal Google Sign-in Error:", err);
      if (err.code === "auth/unauthorized-domain") {
        setLocalError("Unauthorized Domain: Please add this URL to 'Authorized Domains' in your Firebase Console settings.");
      } else if (err.code === "auth/popup-blocked") {
        setLocalError("Popup Blocked: Please allow popups in your browser settings to sign in with Google.");
      } else {
        setLocalError("Failed to sign in with Google. Please check your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Sanitize user inputs first (Standard 2)
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = password; // Do not alter raw passwords, just validate length
    const sanitizedName = sanitizeInput(name);

    if (!sanitizedEmail || !sanitizedPassword) {
      setLocalError("Please fill in all required fields.");
      return;
    }

    // Perform validation checks (Standard 2)
    const isEmailValid = validateEmailFormat(sanitizedEmail);
    const isPasswordValid = validatePasswordFormat(sanitizedPassword);
    const isNameValid = !isSignUp || validateNameFormat(sanitizedName);

    if (!isEmailValid || !isPasswordValid || !isNameValid) {
      if (!isEmailValid) {
        setLocalError("Please enter a valid email address.");
      } else if (!isPasswordValid) {
        setLocalError("Password must be at least 6 characters long.");
      } else if (!isNameValid) {
        setLocalError("Please enter a valid name (2-100 characters).");
      }
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(sanitizedEmail, sanitizedPassword, sanitizedName);
      } else {
        await signInWithEmail(sanitizedEmail, sanitizedPassword);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setLocalError(err.message || (isSignUp ? "An error occurred during registration." : "Incorrect email or password"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative bg-white w-full max-w-md rounded-2xl border border-stone-200/80 shadow-2xl overflow-y-auto max-h-[calc(100vh-2rem)] md:max-h-[90vh] z-10 flex flex-col"
        >
          {/* Header section with brand accent */}
          <div className="relative py-6 px-6 sm:px-8 bg-gradient-to-br from-stone-900 to-stone-800 text-stone-100">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-100 transition-colors p-1.5 rounded-full hover:bg-stone-700/50 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="h-5 w-5 text-amber-300" />
              <span className="font-mono text-[10px] tracking-widest uppercase text-stone-400">KuaxiBlend Boutique</span>
            </div>
            <h3 className="font-display text-2xl font-extrabold tracking-tight">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h3>
            <p className="text-stone-400 text-xs mt-1">
              {isSignUp ? "Sign up to easily place and track your orders." : "Sign in to proceed to checkout."}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {/* Google Authentication Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-3 px-4 border border-stone-200 hover:border-stone-400 rounded-xl flex items-center justify-center gap-3 bg-white text-stone-700 font-display font-semibold text-sm cursor-pointer shadow-3xs hover:shadow-2xs active:scale-98 transition-all disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.86-3.577-7.86-8s3.53-8 7.86-8c2.46 0 4.105 1.025 5.047 1.926l3.258-3.133C18.44 1.222 15.62 0 12.24 0c-6.63 0-12 5.37-12 12s5.37 12 12 12c6.923 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.188-1.989H12.24z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Separator */}
            <div className="relative flex py-2 items-center text-xs text-stone-400 font-mono">
              <div className="flex-grow border-t border-stone-200"></div>
              <span className="flex-shrink mx-4 uppercase">or email</span>
              <div className="flex-grow border-t border-stone-200"></div>
            </div>

            {/* Error Message */}
            {localError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 leading-normal font-sans">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{localError}</span>
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold uppercase text-stone-500">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Aarav Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:border-stone-900 bg-stone-50/50 focus:bg-white text-sm text-stone-800 transition-all outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-stone-500">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:border-stone-900 bg-stone-50/50 focus:bg-white text-sm text-stone-800 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-stone-500">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:border-stone-900 bg-stone-50/50 focus:bg-white text-sm text-stone-800 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-700 text-stone-100 font-display font-semibold text-sm rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <span>{isSignUp ? "Create Account" : "Sign In to Account"}</span>
                )}
              </button>
            </form>

            {/* Toggle Sign Up / Sign In link */}
            <div className="text-center text-xs text-stone-500 font-sans mt-4">
              {isSignUp ? "Already have an account? " : "New to KuaxiBlend? "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setLocalError(null);
                }}
                disabled={isSubmitting}
                className="text-stone-900 font-semibold hover:underline bg-transparent border-none cursor-pointer"
              >
                {isSignUp ? "Sign In" : "Create one now"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
