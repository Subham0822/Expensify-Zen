import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";

// Get the current hostname to determine the environment
const getAuthDomain = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const port = window.location.port;
    const protocol = window.location.protocol;
    console.log(
      "Current hostname:",
      hostname,
      "Port:",
      port,
      "Protocol:",
      protocol
    );

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      // For localhost, always use the production domain to avoid SSL issues
      // Firebase Auth popups require secure context, which localhost doesn't provide
      const prodDomain = "expensify-zen.firebaseapp.com";
      console.log(
        "Using production auth domain for localhost to avoid SSL issues:",
        prodDomain
      );
      return prodDomain;
    }
  }

  const prodDomain =
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "expensify-zen.firebaseapp.com";
  console.log("Using production auth domain:", prodDomain);
  return prodDomain;
};

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyAvY165vPqwrpZaLyKe8-nSHGZfrea-Eo0",
  authDomain: getAuthDomain(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "expensify-zen",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "expensify-zen.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1029301151749",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:1029301151749:web:ed0d5d80cfa8bea509d46c",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

console.log("Firebase config:", firebaseConfig);

// Initialize Firebase with proper error handling
let app: FirebaseApp;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase app initialized successfully");
  } else {
    app = getApp();
    console.log("Using existing Firebase app");
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Fallback to production domain if there's an issue
  const fallbackConfig = {
    ...firebaseConfig,
    authDomain: "expensify-zen.firebaseapp.com",
  };
  console.log("Falling back to production domain:", fallbackConfig);
  app = initializeApp(fallbackConfig);
}

export { app };
