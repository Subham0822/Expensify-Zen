import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAvY165vPqwrpZaLyKe8-nSHGZfrea-Eo0",
  authDomain: "expensify-zen.firebaseapp.com",
  projectId: "expensify-zen",
  storageBucket: "expensify-zen.firebasestorage.app",
  messagingSenderId: "1029301151749",
  appId: "1:1029301151749:web:ed0d5d80cfa8bea509d46c",
  measurementId: ""
};

const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
