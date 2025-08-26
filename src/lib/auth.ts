"use client";

import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { app } from "./firebase";

export const auth = getAuth(app);

// Log the current auth domain for debugging
console.log("Firebase Auth initialized with domain:", auth.config.authDomain);

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Helper function to check if we're in a secure context
const isSecureContext = () => {
  if (typeof window !== "undefined") {
    return window.isSecureContext || window.location.protocol === "https:";
  }
  return false;
};

// Function to handle redirect results (call this when the page loads)
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log("Redirect sign-in successful:", result.user.email);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Error handling redirect result:", error);
    return null;
  }
};

export const signInWithGoogle = async () => {
  try {
    console.log("Attempting Google sign-in...");
    console.log("Secure context:", isSecureContext());

    // Use redirect instead of popup for localhost to avoid SSL issues
    if (!isSecureContext()) {
      console.log("Not in secure context, using redirect method");
      await signInWithRedirect(auth, googleProvider);
      return null; // User will be redirected
    }

    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google sign-in successful:", result.user.email);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error);

    // Log specific error details
    if (error.code === "auth/unauthorized-domain") {
      console.error(
        "Unauthorized domain error. Current domain:",
        window.location.hostname
      );
      console.error("Firebase auth domain:", auth.config.authDomain);
    } else if (error.code === "auth/cancelled-popup-request") {
      console.error(
        "Popup was cancelled. This often happens due to SSL issues on localhost."
      );
      console.error("Try using the redirect method instead.");
    }

    return null;
  }
};

export const signInWithGitHub = async () => {
  try {
    console.log("Attempting GitHub sign-in...");
    console.log("Secure context:", isSecureContext());

    // Use redirect instead of popup for localhost to avoid SSL issues
    if (!isSecureContext()) {
      console.log("Not in secure context, using redirect method");
      await signInWithRedirect(auth, githubProvider);
      return null; // User will be redirected
    }

    const result = await signInWithPopup(auth, githubProvider);
    console.log("GitHub sign-in successful:", result.user.email);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with GitHub:", error);

    // Log specific error details
    if (error.code === "auth/unauthorized-domain") {
      console.error(
        "Unauthorized domain error. Current domain:",
        window.location.hostname
      );
      console.error("Firebase auth domain:", auth.config.authDomain);
    } else if (error.code === "auth/cancelled-popup-request") {
      console.error(
        "Popup was cancelled. This often happens due to SSL issues on localhost."
      );
      console.error("Try using the redirect method instead.");
    }

    return null;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    console.log("Sign out successful");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

export type { User };
