import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";

// Get the current hostname to determine the environment
const getAuthDomain = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const port = window.location.port;
    const protocol = window.location.protocol;
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "Current hostname:",
        hostname,
        "Port:",
        port,
        "Protocol:",
        protocol
      );
    }

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      // For localhost, always use the production domain to avoid SSL issues
      // Firebase Auth popups require secure context, which localhost doesn't provide
      const prodDomain =
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
        "expensify-zen.firebaseapp.com";
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "Using production auth domain for localhost to avoid SSL issues:",
          prodDomain
        );
      }
      return prodDomain;
    }
  }

  const prodDomain =
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "expensify-zen.firebaseapp.com";
  if (process.env.NODE_ENV !== "production") {
    console.log("Using production auth domain:", prodDomain);
  }
  return prodDomain;
};

// Validate required environment variables (dev-only diagnostics)
const requiredVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

if (process.env.NODE_ENV !== "production") {
  console.log("=== Environment Variables Debug ===");
  for (const varName of requiredVars) {
    const value = process.env[varName];
    console.log(`${varName}: ${value ? "✅ Loaded" : "❌ Missing"}`);
    if (!value) {
      console.warn(
        `Env var ${varName} not set. Falling back to defaults if available.`
      );
    }
  }
  console.log("==================================");
}

// Temporary fallback for debugging - REMOVE THIS AFTER FIXING ENV VARS
const fallbackConfig = {
  apiKey: "AIzaSyAvY165vPqwrpZaLyKe8-nSHGZfrea-Eo0",
  authDomain: "expensify-zen.firebaseapp.com",
  projectId: "expensify-zen",
  storageBucket: "expensify-zen.firebasestorage.app",
  messagingSenderId: "1029301151749",
  appId: "1:1029301151749:web:ed0d5d80cfa8bea509d46c",
  measurementId: "",
};

// Use environment variables if available, otherwise use fallback
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: getAuthDomain(),
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    fallbackConfig.storageBucket,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    fallbackConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || fallbackConfig.appId,
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    fallbackConfig.measurementId,
};

// Check if we're using fallbacks and show warning
const usingFallbacks = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
if (usingFallbacks) {
  console.warn(
    "Using fallback Firebase configuration. Environment variables not set."
  );
} else if (process.env.NODE_ENV !== "production") {
  console.log("All Firebase environment variables loaded successfully.");
}

// Initialize Firebase with proper error handling
let app: FirebaseApp;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    if (process.env.NODE_ENV !== "production") {
      console.log("Firebase app initialized successfully");
    }
  } else {
    app = getApp();
    if (process.env.NODE_ENV !== "production") {
      console.log("Using existing Firebase app");
    }
  }
} catch (error) {
  console.warn(
    "Error initializing Firebase with provided config. Falling back...",
    error
  );
  const fallbackFirebaseConfig = {
    ...fallbackConfig,
    authDomain: "expensify-zen.firebaseapp.com",
  };
  app = initializeApp(fallbackFirebaseConfig);
  if (process.env.NODE_ENV !== "production") {
    console.log("Firebase app initialized with fallback configuration");
  }
}

export { app };
