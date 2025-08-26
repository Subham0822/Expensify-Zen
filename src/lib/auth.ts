
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

const isLocalhost = () => {
    if (typeof window !== 'undefined') {
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
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
    // This is where we handle the account linking after a redirect
    if (error.code === 'auth/account-exists-with-different-credential') {
        const pendingCred = error.credential;
        const email = error.customData.email;
        const methods = await fetchSignInMethodsForEmail(auth, email);
        
        // Sign in with the existing provider
        let providerToSignIn;
        if (methods[0] === 'google.com') {
            providerToSignIn = googleProvider;
        } else if (methods[0] === 'github.com') {
            providerToSignIn = githubProvider;
        } else {
            // Handle other providers if necessary
            throw new Error(`Unhandled provider: ${methods[0]}`);
        }

        const result = await signInWithPopup(auth, providerToSignIn);
        if(result.user && pendingCred) {
            // Link the new credential to the existing user
            await linkWithCredential(result.user, pendingCred);
            return result.user;
        }
    }
    console.error("Error handling redirect result:", error);
    return null;
  }
};

const handleSignIn = async (provider: AuthProvider) => {
  try {
    // For localhost development, redirect is often more reliable
    if (isLocalhost()) {
      await signInWithRedirect(auth, provider);
      return null; // signInWithRedirect doesn't return a user, the result is handled by getRedirectResult
    }

    // For deployed environments, popup is generally preferred
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/account-exists-with-different-credential') {
      const pendingCred = error.credential;
      const email = error.customData.email;
      const methods = await fetchSignInMethodsForEmail(auth, email);

      let providerToSignIn;
        if (methods[0] === 'google.com') {
            providerToSignIn = googleProvider;
        } else if (methods[0] === 'github.com') {
            providerToSignIn = githubProvider;
        } else {
            // Handle other providers if necessary
            throw new Error(`Unhandled provider: ${methods[0]}`);
        }
      
      const result = await signInWithPopup(auth, providerToSignIn);
      if (result.user && pendingCred) {
        await linkWithCredential(result.user, pendingCred);
        return result.user;
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
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

export type { User };
