import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAvY165vPqwrpZaLyKe8-nSHGZfrea-Eo0",
  authDomain: "expensify-zen.firebaseapp.com",
  projectId: "expensify-zen",
  storageBucket: "expensify-zen.firebasestorage.app",
  messagingSenderId: "1029301151749",
  appId: "1:1029301151749:web:ed0d5d80cfa8bea509d46c",
  measurementId: ""
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
