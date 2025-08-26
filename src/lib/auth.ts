"use client";

import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  type User,
  type AuthProvider,
} from "firebase/auth";
import { app } from "./firebase";

export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

const isSecureContext = () => {
  if (typeof window !== "undefined") {
    return window.isSecureContext || window.location.protocol === "https:";
  }
  return false;
};

export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return result.user;
    }
    return null;
  } catch (error: any) {
    if (error.code === 'auth/account-exists-with-different-credential') {
        const pendingCred = error.credential;
        const email = error.customData.email;
        const methods = await fetchSignInMethodsForEmail(auth, email);
        
        if (methods[0] === 'google.com') {
            const result = await signInWithPopup(auth, googleProvider);
            if(result.user && pendingCred) {
                await linkWithCredential(result.user, pendingCred);
            }
        }
    }
    console.error("Error handling redirect result:", error);
    return null;
  }
};

const handleSignIn = async (provider: AuthProvider) => {
  try {
    console.log(`Attempting sign-in with ${provider.providerId}...`);
    
    // For non-secure contexts like http://localhost, redirect is often more reliable
    if (!isSecureContext()) {
      console.log("Not in secure context, using redirect method");
      await signInWithRedirect(auth, provider);
      return null;
    }

    const result = await signInWithPopup(auth, provider);
    console.log(`${provider.providerId} sign-in successful:`, result.user.email);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/account-exists-with-different-credential') {
      const pendingCred = provider.providerId === 'google.com' 
        ? GoogleAuthProvider.credentialFromError(error)
        : GithubAuthProvider.credentialFromError(error);
        
      const email = error.customData.email;
      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods[0] === 'google.com') {
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user && pendingCred) {
          await linkWithCredential(result.user, pendingCred);
          return result.user;
        }
      } else if (methods[0] === 'github.com') {
        const result = await signInWithPopup(auth, githubProvider);
         if (result.user && pendingCred) {
          await linkWithCredential(result.user, pendingCred);
          return result.user;
        }
      }
    }
    console.error(`Error signing in with ${provider.providerId}:`, error);
    return null;
  }
};


export const signInWithGoogle = () => handleSignIn(googleProvider);
export const signInWithGitHub = () => handleSignIn(githubProvider);

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    console.log("Sign out successful");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

export type { User };
