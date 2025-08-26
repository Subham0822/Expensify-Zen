import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAvY165vPqwrpZaLyKe8-nSHGZfrea-Eo0",
  authDomain: "expensify-zen.firebaseapp.com",
  projectId: "expensify-zen",
  storageBucket: "expensify-zen.firebasestorage.app",
  messagingSenderId: "1029301151749",
  appId: "1:1029301151749:web:ed0d5d80cfa8bea509d46c",
  measurementId: ""
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);

export { app, auth };
